import type { ParsedDocument } from "../documents/ParsedDocument";
import type { HoverInfo, Position } from "../types";
import { getSymbolInfo } from "./lookup";
import {
	getResolvedImports,
	parseLibrary,
	findLibraryExport,
	type LibraryExport,
} from "./imports";

// Map to store library content for hover resolution
const libraryContentCache = new Map<string, string>();

/**
 * Register library content for hover resolution.
 */
export function registerLibraryContentForHover(
	sourcePath: string,
	content: string,
): void {
	libraryContentCache.set(sourcePath, content);
}

/**
 * Clear registered library content.
 */
export function clearLibraryContentForHover(): void {
	libraryContentCache.clear();
}

export interface HoverOptions {
	/** Whether to show full documentation or just a summary */
	mode?: "full" | "summary";
}

/**
 * Get hover information for a symbol at a position.
 */
export function getHover(
	doc: ParsedDocument,
	position: Position,
	options: HoverOptions = {},
): HoverInfo | null {
	const symbol = doc.getWordAtPosition(position);
	if (!symbol) return null;

	// Check if this is a library symbol (e.g., "myLib.myFunction")
	const libraryHover = getLibraryHover(doc, position, symbol, options);
	if (libraryHover) return libraryHover;

	const info = getSymbolInfo(symbol);
	if (!info) return null;

	const mode = options.mode ?? "full";

	// Build markdown content
	const parts: string[] = [];

	// Header
	parts.push(`### ${symbol}`);

	// Syntax (for functions)
	if (info.syntax) {
		parts.push(`\`\`\`pine\n${info.syntax}\n\`\`\``);
	}

	// Description
	if (info.description) {
		const desc =
			mode === "summary"
				? `${info.description.split(".")[0]}.`
				: info.description;
		parts.push(desc);
	}

	// Return type or type
	if (info.returns) {
		parts.push(`**Returns:** \`${info.returns}\``);
	} else if (info.type) {
		parts.push(`**Type:** \`${info.type}\``);
	}

	// Parameters (for functions, in full mode)
	if (mode === "full" && info.parameters && info.parameters.length > 0) {
		parts.push("**Parameters:**");
		for (const param of info.parameters) {
			if (param.documentation) {
				parts.push(`- \`${param.label}\`: ${param.documentation}`);
			} else {
				parts.push(`- \`${param.label}\``);
			}
		}
	}

	// Namespace
	if (info.namespace) {
		parts.push(`_Namespace: ${info.namespace}_`);
	}

	// Deprecated warning
	if (info.deprecated) {
		parts.push("⚠️ **Deprecated**");
	}

	return {
		contents: parts.join("\n\n"),
	};
}

/**
 * Get hover information for a library symbol.
 */
function getLibraryHover(
	doc: ParsedDocument,
	position: Position,
	symbol: string,
	options: HoverOptions,
): HoverInfo | null {
	const line = doc.getLine(position.line);
	if (!line) return null;

	// Check if we're hovering over a member of a library alias (e.g., "myLib.myFunction")
	const beforeSymbol = line.substring(0, position.character);
	const afterSymbol = line.substring(position.character);

	// Find the full expression around the cursor
	const beforeMatch = beforeSymbol.match(/([a-zA-Z_][a-zA-Z0-9_]*)\.$/);
	if (!beforeMatch) return null;

	const alias = beforeMatch[1];
	const memberMatch = afterSymbol.match(/^([a-zA-Z_][a-zA-Z0-9_]*)/);
	if (!memberMatch) return null;

	// Check if the alias is a resolved import
	const imports = getResolvedImports(doc);
	const resolvedImport = imports.find((i) => i.alias === alias);
	if (!resolvedImport) return null;

	// Get library content
	const content = libraryContentCache.get(resolvedImport.sourcePath);
	if (!content) return null;

	// Parse the library and find the export
	const library = parseLibrary(content, resolvedImport.sourcePath);
	const exportInfo = findLibraryExport(library, symbol);
	if (!exportInfo) return null;

	return buildLibraryExportHover(alias, exportInfo, options);
}

/**
 * Build hover content for a library export.
 */
function buildLibraryExportHover(
	alias: string,
	exportInfo: LibraryExport,
	options: HoverOptions,
): HoverInfo {
	const mode = options.mode ?? "full";
	const parts: string[] = [];

	// Header
	parts.push(`### ${alias}.${exportInfo.name}`);

	// Syntax for functions/methods
	if (exportInfo.params) {
		const paramStr = exportInfo.params
			.map((p) => `${p.name}${p.type ? `: ${p.type}` : ""}`)
			.join(", ");
		parts.push(`\`\`\`pine\n${exportInfo.name}(${paramStr})\n\`\`\``);
	}

	// Description
	if (exportInfo.description) {
		const desc =
			mode === "summary"
				? `${exportInfo.description.split(".")[0]}.`
				: exportInfo.description;
		parts.push(desc);
	}

	// Return type
	if (exportInfo.returnType) {
		parts.push(`**Returns:** \`${exportInfo.returnType}\``);
	}

	// Parameters (for functions, in full mode)
	if (mode === "full" && exportInfo.params && exportInfo.params.length > 0) {
		parts.push("**Parameters:**");
		for (const param of exportInfo.params) {
			const typeStr = param.type ? `: ${param.type}` : "";
			parts.push(`- \`${param.name}${typeStr}\``);
		}
	}

	// Source
	parts.push(`_Library: ${alias}_`);

	return {
		contents: parts.join("\n\n"),
	};
}
