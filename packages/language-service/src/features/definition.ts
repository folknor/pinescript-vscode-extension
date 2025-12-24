import type {
	FunctionDeclaration,
	MethodDeclaration,
	Statement,
	VariableDeclaration,
} from "../../../core/src/parser/ast";
import type { ParsedDocument } from "../documents/ParsedDocument";
import type { Location, Position, Range } from "../types";
import { getSymbolInfo } from "./lookup";

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
