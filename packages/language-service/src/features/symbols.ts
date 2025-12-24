import type {
	FunctionDeclaration,
	MethodDeclaration,
	Statement,
	VariableDeclaration,
} from "../../../core/src/parser/ast";
import type { ParsedDocument } from "../documents/ParsedDocument";
import { type DocumentSymbol, SymbolKind } from "../types";

/**
 * Get all symbols in a document for the outline view.
 * Returns a flat list of top-level symbols (functions, variables, types, imports).
 */
export function getDocumentSymbols(doc: ParsedDocument): DocumentSymbol[] {
	const symbols: DocumentSymbol[] = [];

	for (const stmt of doc.ast.body) {
		const symbol = extractSymbol(stmt, doc);
		if (symbol) {
			symbols.push(symbol);
		}
	}

	return symbols;
}

/**
 * Extract a DocumentSymbol from a statement, if applicable.
 */
function extractSymbol(
	stmt: Statement,
	doc: ParsedDocument,
): DocumentSymbol | null {
	switch (stmt.type) {
		case "FunctionDeclaration":
			return createFunctionSymbol(stmt, doc);

		case "MethodDeclaration":
			return createMethodSymbol(stmt, doc);

		case "VariableDeclaration":
			return createVariableSymbol(stmt, doc);

		case "TypeDeclaration":
			return {
				name: stmt.name,
				kind: SymbolKind.Struct,
				range: createRange(stmt.line, stmt.column, stmt.name, doc),
				selectionRange: createSelectionRange(
					stmt.line,
					stmt.column,
					stmt.name,
				),
			};

		case "EnumDeclaration":
			return {
				name: stmt.name,
				kind: SymbolKind.Enum,
				range: createRange(stmt.line, stmt.column, stmt.name, doc),
				selectionRange: createSelectionRange(
					stmt.line,
					stmt.column,
					stmt.name,
				),
			};

		case "ImportStatement":
			return {
				name: stmt.alias || stmt.libraryPath,
				kind: SymbolKind.Module,
				range: createRange(
					stmt.line,
					stmt.column,
					stmt.alias || stmt.libraryPath,
					doc,
				),
				selectionRange: createSelectionRange(
					stmt.line,
					stmt.column,
					stmt.alias || stmt.libraryPath,
				),
			};

		default:
			return null;
	}
}

/**
 * Create a symbol for a function declaration.
 */
function createFunctionSymbol(
	func: FunctionDeclaration,
	doc: ParsedDocument,
): DocumentSymbol {
	// Build function signature for display
	const params = func.params.map((p) => p.name).join(", ");
	const name = `${func.name}(${params})`;

	// Calculate the range that includes the entire function body
	const endLine = findBlockEndLine(func.body, func.line);

	return {
		name,
		kind: SymbolKind.Function,
		range: {
			start: { line: func.line - 1, character: func.column - 1 },
			end: { line: endLine - 1, character: doc.getLine(endLine - 1).length },
		},
		selectionRange: createSelectionRange(func.line, func.column, func.name),
	};
}

/**
 * Create a symbol for a method declaration.
 */
function createMethodSymbol(
	method: MethodDeclaration,
	doc: ParsedDocument,
): DocumentSymbol {
	const params = method.params.map((p) => p.name).join(", ");
	const name = `${method.name}(${params})`;

	const endLine = findBlockEndLine(method.body, method.line);

	return {
		name,
		kind: SymbolKind.Method,
		range: {
			start: { line: method.line - 1, character: method.column - 1 },
			end: { line: endLine - 1, character: doc.getLine(endLine - 1).length },
		},
		selectionRange: createSelectionRange(
			method.line,
			method.column,
			method.name,
		),
	};
}

/**
 * Create a symbol for a variable declaration.
 */
function createVariableSymbol(
	varDecl: VariableDeclaration,
	doc: ParsedDocument,
): DocumentSymbol {
	// Determine symbol kind based on variable type
	let kind = SymbolKind.Variable;
	if (varDecl.varType === "const") {
		kind = SymbolKind.Constant;
	}

	return {
		name: varDecl.name,
		kind,
		range: createRange(varDecl.line, varDecl.column, varDecl.name, doc),
		selectionRange: createSelectionRange(
			varDecl.line,
			varDecl.column,
			varDecl.name,
		),
	};
}

/**
 * Find the last line of a block of statements.
 */
function findBlockEndLine(body: Statement[], startLine: number): number {
	let maxLine = startLine;

	for (const stmt of body) {
		if (stmt.line > maxLine) {
			maxLine = stmt.line;
		}

		// Recurse into nested blocks
		if ("body" in stmt && Array.isArray(stmt.body)) {
			const nestedEnd = findBlockEndLine(stmt.body as Statement[], stmt.line);
			if (nestedEnd > maxLine) {
				maxLine = nestedEnd;
			}
		}

		// Handle if statements with alternate blocks
		if (stmt.type === "IfStatement" && stmt.alternate) {
			const altEnd = findBlockEndLine(stmt.alternate, stmt.line);
			if (altEnd > maxLine) {
				maxLine = altEnd;
			}
		}
	}

	return maxLine;
}

/**
 * Create a range for a single-line symbol.
 * AST uses 1-indexed lines/columns, LSP uses 0-indexed.
 */
function createRange(
	line: number,
	column: number,
	name: string,
	doc: ParsedDocument,
): { start: { line: number; character: number }; end: { line: number; character: number } } {
	const lineContent = doc.getLine(line - 1);
	return {
		start: { line: line - 1, character: column - 1 },
		end: { line: line - 1, character: lineContent.length },
	};
}

/**
 * Create a selection range (just the symbol name).
 * AST uses 1-indexed lines/columns, LSP uses 0-indexed.
 */
function createSelectionRange(
	line: number,
	column: number,
	name: string,
): { start: { line: number; character: number }; end: { line: number; character: number } } {
	return {
		start: { line: line - 1, character: column - 1 },
		end: { line: line - 1, character: column - 1 + name.length },
	};
}
