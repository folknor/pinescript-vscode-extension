import type {
	FunctionDeclaration,
	MethodDeclaration,
	Statement,
	VariableDeclaration,
} from "../../../core/src/parser/ast";
import { Parser } from "../../../core/src/parser/parser";
import type { ParsedDocument } from "../documents/ParsedDocument";
import type { Location, Position, Range } from "../types";
import { getSymbolInfo } from "./lookup";
import { getResolvedImports, parseLibrary, findLibraryExport } from "./imports";

// Map to store library content for definition resolution
const libraryContentCache = new Map<string, string>();

/**
 * Register library content for definition resolution.
 */
export function registerLibraryContentForDefinition(
	sourcePath: string,
	content: string,
): void {
	libraryContentCache.set(sourcePath, content);
}

/**
 * Clear registered library content.
 */
export function clearLibraryContentForDefinition(): void {
	libraryContentCache.clear();
}

/**
 * Result of a go-to-definition request.
 */
export interface DefinitionResult {
	/** Location of the definition, if found in user code */
	location?: Location;
	/** True if this is a built-in symbol (no source location) */
	isBuiltin?: boolean;
	/** Symbol info for built-ins (to show documentation) */
	symbolInfo?: ReturnType<typeof getSymbolInfo>;
	/** True if this is a library symbol */
	isLibrary?: boolean;
	/** Library source path for library symbols */
	libraryPath?: string;
}

/**
 * Find the definition of a symbol at a position.
 */
export function getDefinition(
	doc: ParsedDocument,
	position: Position,
): DefinitionResult | null {
	const symbol = doc.getWordAtPosition(position);
	if (!symbol) return null;

	// Check if this is a library symbol (e.g., "myLib.myFunction")
	const libraryDef = getLibraryDefinition(doc, position, symbol);
	if (libraryDef) return libraryDef;

	// First check if it's a built-in
	const builtinInfo = getSymbolInfo(symbol);
	if (builtinInfo) {
		return {
			isBuiltin: true,
			symbolInfo: builtinInfo,
		};
	}

	// Search for user-defined symbol in AST
	const location = findDefinitionInAST(doc, symbol);
	if (location) {
		return { location };
	}

	return null;
}

/**
 * Get definition for a library symbol.
 */
function getLibraryDefinition(
	doc: ParsedDocument,
	position: Position,
	symbol: string,
): DefinitionResult | null {
	const line = doc.getLine(position.line);
	if (!line) return null;

	// Check if we're on a member of a library alias (e.g., "myLib.myFunction")
	const beforeSymbol = line.substring(0, position.character);
	const beforeMatch = beforeSymbol.match(/([a-zA-Z_][a-zA-Z0-9_]*)\.$/);
	if (!beforeMatch) return null;

	const alias = beforeMatch[1];

	// Check if the alias is a resolved import
	const imports = getResolvedImports(doc);
	const resolvedImport = imports.find((i) => i.alias === alias);
	if (!resolvedImport) return null;

	// Get library content
	const content = libraryContentCache.get(resolvedImport.sourcePath);
	if (!content) {
		// Return library info without location
		return {
			isLibrary: true,
			libraryPath: resolvedImport.sourcePath,
		};
	}

	// Parse the library and find the export
	const library = parseLibrary(content, resolvedImport.sourcePath);
	const exportInfo = findLibraryExport(library, symbol);
	if (!exportInfo) return null;

	// Find the actual definition location in the library
	const location = findExportLocationInLibrary(
		content,
		resolvedImport.sourcePath,
		symbol,
	);

	if (location) {
		return {
			location,
			isLibrary: true,
			libraryPath: resolvedImport.sourcePath,
		};
	}

	return {
		isLibrary: true,
		libraryPath: resolvedImport.sourcePath,
	};
}

/**
 * Find the location of an exported symbol in a library file.
 */
function findExportLocationInLibrary(
	content: string,
	sourcePath: string,
	symbolName: string,
): Location | null {
	const parser = new Parser(content);
	const ast = parser.parse();

	for (const stmt of ast.body) {
		if (stmt.type === "FunctionDeclaration") {
			const funcDecl = stmt as FunctionDeclaration;
			if (funcDecl.isExport && funcDecl.name === symbolName) {
				// Create URI from source path
				const uri = sourcePath.startsWith("file://")
					? sourcePath
					: `file://${sourcePath}`;
				return createLocation(uri, funcDecl.line, funcDecl.column, funcDecl.name);
			}
		} else if (stmt.type === "MethodDeclaration") {
			const methodDecl = stmt as MethodDeclaration;
			if (methodDecl.isExport && methodDecl.name === symbolName) {
				const uri = sourcePath.startsWith("file://")
					? sourcePath
					: `file://${sourcePath}`;
				return createLocation(uri, methodDecl.line, methodDecl.column, methodDecl.name);
			}
		}
	}

	return null;
}

/**
 * Find where a symbol is defined in the AST.
 */
function findDefinitionInAST(
	doc: ParsedDocument,
	symbolName: string,
): Location | null {
	// Walk the AST to find the definition
	for (const stmt of doc.ast.body) {
		const location = findDefinitionInStatement(stmt, symbolName, doc.uri);
		if (location) return location;
	}

	return null;
}

/**
 * Search for a symbol definition in a statement.
 */
function findDefinitionInStatement(
	stmt: Statement,
	symbolName: string,
	uri: string,
): Location | null {
	switch (stmt.type) {
		case "VariableDeclaration": {
			const varDecl = stmt as VariableDeclaration;
			if (varDecl.name === symbolName) {
				return createLocation(uri, varDecl.line, varDecl.column, varDecl.name);
			}
			break;
		}

		case "FunctionDeclaration": {
			const funcDecl = stmt as FunctionDeclaration;
			if (funcDecl.name === symbolName) {
				return createLocation(uri, funcDecl.line, funcDecl.column, funcDecl.name);
			}
			// Check parameters
			for (const param of funcDecl.params) {
				if (param.name === symbolName) {
					// Parameters don't have their own line/column, use function's
					return createLocation(uri, funcDecl.line, funcDecl.column, param.name);
				}
			}
			// Search in function body
			for (const bodyStmt of funcDecl.body) {
				const loc = findDefinitionInStatement(bodyStmt, symbolName, uri);
				if (loc) return loc;
			}
			break;
		}

		case "MethodDeclaration": {
			const methodDecl = stmt as MethodDeclaration;
			if (methodDecl.name === symbolName) {
				return createLocation(uri, methodDecl.line, methodDecl.column, methodDecl.name);
			}
			// Check parameters
			for (const param of methodDecl.params) {
				if (param.name === symbolName) {
					return createLocation(uri, methodDecl.line, methodDecl.column, param.name);
				}
			}
			// Search in method body
			for (const bodyStmt of methodDecl.body) {
				const loc = findDefinitionInStatement(bodyStmt, symbolName, uri);
				if (loc) return loc;
			}
			break;
		}

		case "ForStatement": {
			// For loop iterator variable
			if (stmt.iterator === symbolName) {
				return createLocation(uri, stmt.line, stmt.column, stmt.iterator);
			}
			// Search in body
			for (const bodyStmt of stmt.body) {
				const loc = findDefinitionInStatement(bodyStmt, symbolName, uri);
				if (loc) return loc;
			}
			break;
		}

		case "ForInStatement": {
			if (stmt.iterator === symbolName) {
				return createLocation(uri, stmt.line, stmt.column, stmt.iterator);
			}
			for (const bodyStmt of stmt.body) {
				const loc = findDefinitionInStatement(bodyStmt, symbolName, uri);
				if (loc) return loc;
			}
			break;
		}

		case "TupleDeclaration": {
			for (const name of stmt.names) {
				if (name === symbolName) {
					return createLocation(uri, stmt.line, stmt.column, name);
				}
			}
			break;
		}

		case "ImportStatement": {
			if (stmt.alias === symbolName) {
				return createLocation(uri, stmt.line, stmt.column, stmt.alias);
			}
			break;
		}

		case "TypeDeclaration":
		case "EnumDeclaration": {
			if (stmt.name === symbolName) {
				return createLocation(uri, stmt.line, stmt.column, stmt.name);
			}
			break;
		}

		case "IfStatement": {
			// Search in consequent and alternate
			for (const bodyStmt of stmt.consequent) {
				const loc = findDefinitionInStatement(bodyStmt, symbolName, uri);
				if (loc) return loc;
			}
			if (stmt.alternate) {
				for (const bodyStmt of stmt.alternate) {
					const loc = findDefinitionInStatement(bodyStmt, symbolName, uri);
					if (loc) return loc;
				}
			}
			break;
		}

		case "WhileStatement": {
			for (const bodyStmt of stmt.body) {
				const loc = findDefinitionInStatement(bodyStmt, symbolName, uri);
				if (loc) return loc;
			}
			break;
		}

		case "SequenceStatement": {
			for (const seqStmt of stmt.statements) {
				const loc = findDefinitionInStatement(seqStmt, symbolName, uri);
				if (loc) return loc;
			}
			break;
		}
	}

	return null;
}

/**
 * Create a Location from line/column (1-indexed in AST) to 0-indexed Range.
 */
function createLocation(
	uri: string,
	line: number,
	column: number,
	name: string,
): Location {
	const range: Range = {
		start: { line: line - 1, character: column - 1 },
		end: { line: line - 1, character: column - 1 + name.length },
	};
	return { uri, range };
}
