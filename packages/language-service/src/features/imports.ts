/**
 * Library Import Resolution.
 * Handles `/// @source <path>` directives for Pine Script library imports.
 *
 * Usage:
 * ```pine
 * /// @source ./libs/my-library.pine
 * import User/MyLibrary/1 as myLib
 *
 * x = myLib.myFunction(close)
 * ```
 */

import { Parser } from "../../../../packages/core/src/parser/parser";
import type * as AST from "../../../../packages/core/src/parser/ast";
import type { ParsedDocument } from "../documents/ParsedDocument";
import { CompletionItemKind, type CompletionItem, type Position } from "../types";

/**
 * Represents a resolved library import with its source directive.
 */
export interface ResolvedImport {
	/** The alias used for the import (e.g., "myLib") */
	alias: string;
	/** The library path from the import statement (e.g., "User/MyLibrary/1") */
	libraryPath: string;
	/** The source file path from the `/// @source` directive */
	sourcePath: string;
	/** Line number of the import statement (0-indexed) */
	line: number;
}

/**
 * Represents an exported symbol from a library.
 */
export interface LibraryExport {
	/** The name of the exported symbol */
	name: string;
	/** The kind of symbol (function, variable, etc.) */
	kind: "function" | "method" | "variable" | "type" | "enum";
	/** Parameters if this is a function/method */
	params?: Array<{ name: string; type?: string; defaultValue?: string }>;
	/** Return type if this is a function/method */
	returnType?: string;
	/** Description/documentation */
	description?: string;
}

/**
 * Represents a parsed library with its exports.
 */
export interface ParsedLibrary {
	/** The source file path */
	sourcePath: string;
	/** The exported symbols */
	exports: LibraryExport[];
	/** Parse errors if any */
	errors?: string[];
}

// Cache for parsed libraries
const libraryCache = new Map<string, ParsedLibrary>();

/**
 * Parse the `/// @source <path>` directive for an import.
 *
 * The directive must appear on the line immediately before the import statement.
 * Returns the path if found, undefined otherwise.
 */
export function parseSourceDirective(
	doc: ParsedDocument,
	importLine: number,
): string | undefined {
	// importLine is 1-indexed from AST, doc.getLine is 0-indexed
	// So line before import (1-indexed) is importLine - 1, which is (importLine - 2) in 0-indexed
	const prevLineIndex = importLine - 2;
	if (prevLineIndex < 0) return undefined;

	const line = doc.getLine(prevLineIndex);
	if (!line) return undefined;

	// Match `/// @source <path>`
	const match = line.match(/^\s*\/\/\/\s*@source\s+(.+?)\s*$/);
	if (!match) return undefined;

	return match[1];
}

/**
 * Get all resolved imports from a document.
 *
 * Returns imports that have a `/// @source` directive.
 */
export function getResolvedImports(doc: ParsedDocument): ResolvedImport[] {
	const imports: ResolvedImport[] = [];

	for (const stmt of doc.ast.body) {
		if (stmt.type !== "ImportStatement") continue;

		const importStmt = stmt as AST.ImportStatement;
		if (!importStmt.alias) continue;

		// Check for @source directive on the previous line
		const sourcePath = parseSourceDirective(doc, stmt.line);
		if (sourcePath) {
			imports.push({
				alias: importStmt.alias,
				libraryPath: importStmt.libraryPath,
				sourcePath,
				line: stmt.line,
			});
		}
	}

	return imports;
}

/**
 * Get imports that are missing a `/// @source` directive.
 */
export function getUnresolvedImports(
	doc: ParsedDocument,
): Array<{ alias: string; libraryPath: string; line: number }> {
	const unresolved: Array<{ alias: string; libraryPath: string; line: number }> = [];

	for (const stmt of doc.ast.body) {
		if (stmt.type !== "ImportStatement") continue;

		const importStmt = stmt as AST.ImportStatement;
		const sourcePath = parseSourceDirective(doc, stmt.line);

		if (!sourcePath) {
			unresolved.push({
				alias: importStmt.alias ?? importStmt.libraryPath.split("/").pop() ?? "lib",
				libraryPath: importStmt.libraryPath,
				line: stmt.line,
			});
		}
	}

	return unresolved;
}

/**
 * Parse a library file and extract its exports.
 *
 * @param content The library file content
 * @param sourcePath The path to the library file (for caching)
 */
export function parseLibrary(content: string, sourcePath: string): ParsedLibrary {
	// Check cache first
	const cached = libraryCache.get(sourcePath);
	if (cached) return cached;

	const parser = new Parser(content);
	const ast = parser.parse();
	const lexerErrors = parser.getLexerErrors();
	const parserErrors = parser.getParserErrors();

	const exports: LibraryExport[] = [];

	// Walk the AST to find exported symbols
	for (const stmt of ast.body) {
		if (stmt.type === "FunctionDeclaration") {
			const funcDecl = stmt as AST.FunctionDeclaration;
			if (funcDecl.isExport) {
				exports.push({
					name: funcDecl.name,
					kind: "function",
					params: funcDecl.params.map((p) => ({
						name: p.name,
						type: p.typeAnnotation?.name,
						defaultValue: p.defaultValue ? "..." : undefined,
					})),
					returnType: funcDecl.returnType?.name,
				});
			}
		} else if (stmt.type === "MethodDeclaration") {
			const methodDecl = stmt as AST.MethodDeclaration;
			if (methodDecl.isExport) {
				exports.push({
					name: methodDecl.name,
					kind: "method",
					params: methodDecl.params.map((p) => ({
						name: p.name,
						type: p.typeAnnotation?.name,
						defaultValue: p.defaultValue ? "..." : undefined,
					})),
					returnType: methodDecl.returnType?.name,
				});
			}
		} else if (stmt.type === "TypeDeclaration") {
			const typeDecl = stmt as AST.TypeDeclaration;
			// Types might be exported - we assume they are if defined in a library
			exports.push({
				name: typeDecl.name,
				kind: "type",
			});
		} else if (stmt.type === "EnumDeclaration") {
			const enumDecl = stmt as AST.EnumDeclaration;
			exports.push({
				name: enumDecl.name,
				kind: "enum",
			});
		}
	}

	const allErrors = [
		...lexerErrors.map((e) => e.message),
		...parserErrors.map((e) => e.message),
	];

	const result: ParsedLibrary = {
		sourcePath,
		exports,
		errors: allErrors.length > 0 ? allErrors : undefined,
	};

	// Cache the result
	libraryCache.set(sourcePath, result);

	return result;
}

/**
 * Clear the library cache (useful for testing or when files change).
 */
export function clearLibraryCache(): void {
	libraryCache.clear();
}

/**
 * Get the import alias at a position (if any).
 *
 * For example, in `myLib.foo`, returns "myLib" if position is on "myLib".
 */
export function getImportAliasAtPosition(
	doc: ParsedDocument,
	position: Position,
): string | undefined {
	const line = doc.getLine(position.line);
	if (!line) return undefined;

	// Find the identifier at the position
	const beforeCursor = line.substring(0, position.character);
	const afterCursor = line.substring(position.character);

	const beforeMatch = beforeCursor.match(/([a-zA-Z_][a-zA-Z0-9_]*)$/);
	const afterMatch = afterCursor.match(/^([a-zA-Z0-9_]*)/);

	if (!beforeMatch) return undefined;

	const identifier = beforeMatch[1] + (afterMatch?.[1] || "");

	// Check if this identifier is an import alias
	const imports = getResolvedImports(doc);
	const resolved = imports.find((i) => i.alias === identifier);
	if (resolved) {
		return identifier;
	}

	return undefined;
}

/**
 * Check if position is after a library alias dot (e.g., "myLib." position on or after the dot).
 */
export function getLibraryAliasBeforeDot(
	doc: ParsedDocument,
	position: Position,
): ResolvedImport | undefined {
	const line = doc.getLine(position.line);
	if (!line) return undefined;

	const beforeCursor = line.substring(0, position.character);

	// Match pattern like "myLib." at end of beforeCursor
	const match = beforeCursor.match(/([a-zA-Z_][a-zA-Z0-9_]*)\.$/);
	if (!match) return undefined;

	const alias = match[1];
	const imports = getResolvedImports(doc);
	return imports.find((i) => i.alias === alias);
}

/**
 * Get completions for a library alias namespace.
 *
 * @param library The parsed library
 * @returns Completion items for the library's exports
 */
export function getLibraryCompletions(library: ParsedLibrary): CompletionItem[] {
	const items: CompletionItem[] = [];

	for (const exp of library.exports) {
		let kind: CompletionItemKind;
		switch (exp.kind) {
			case "function":
			case "method":
				kind = CompletionItemKind.Function;
				break;
			case "type":
				kind = CompletionItemKind.Class;
				break;
			case "enum":
				kind = CompletionItemKind.Enum;
				break;
			default:
				kind = CompletionItemKind.Variable;
		}

		const item: CompletionItem = {
			label: exp.name,
			kind,
		};

		// Build documentation
		const docParts: string[] = [];

		if (exp.params) {
			const paramStr = exp.params
				.map((p) => `${p.name}${p.type ? `: ${p.type}` : ""}`)
				.join(", ");
			docParts.push(`\`\`\`pine\n${exp.name}(${paramStr})\n\`\`\``);
		}

		if (exp.returnType) {
			docParts.push(`**Returns:** \`${exp.returnType}\``);
		}

		if (exp.description) {
			docParts.push(exp.description);
		}

		if (docParts.length > 0) {
			item.documentation = docParts.join("\n\n");
		}

		if (exp.returnType) {
			item.detail = `→ ${exp.returnType}`;
		}

		items.push(item);
	}

	return items;
}

/**
 * Find a library export by name.
 */
export function findLibraryExport(
	library: ParsedLibrary,
	name: string,
): LibraryExport | undefined {
	return library.exports.find((e) => e.name === name);
}
