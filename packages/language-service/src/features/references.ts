import type {
	CallExpression,
	Expression,
	FunctionDeclaration,
	Identifier,
	MethodDeclaration,
	Statement,
} from "../../../core/src/parser/ast";
import type { ParsedDocument } from "../documents/ParsedDocument";
import type { Location, Position, Range } from "../types";

/**
 * Options for find references.
 */
export interface ReferencesOptions {
	/** Include the definition in the results (default: true) */
	includeDeclaration?: boolean;
}

/**
 * Find all references to a symbol at a position.
 */
export function getReferences(
	doc: ParsedDocument,
	position: Position,
	options: ReferencesOptions = {},
): Location[] {
	const includeDeclaration = options.includeDeclaration ?? true;
	const symbol = doc.getWordAtPosition(position);
	if (!symbol) return [];

	const locations: Location[] = [];

	// Walk the AST to find all occurrences of this symbol
	for (const stmt of doc.ast.body) {
		findReferencesInStatement(stmt, symbol, doc.uri, locations, includeDeclaration);
	}

	return locations;
}

/**
 * Find references in a statement.
 */
function findReferencesInStatement(
	stmt: Statement,
	symbolName: string,
	uri: string,
	locations: Location[],
	includeDeclaration: boolean,
): void {
	switch (stmt.type) {
		case "VariableDeclaration": {
			// Check if this is the definition
			if (stmt.name === symbolName && includeDeclaration) {
				locations.push(createLocation(uri, stmt.line, stmt.column, stmt.name));
			}
			// Check initialization expression
			if (stmt.init) {
				findReferencesInExpression(stmt.init, symbolName, uri, locations);
			}
			break;
		}

		case "FunctionDeclaration": {
			const funcDecl = stmt as FunctionDeclaration;
			// Check if function name is the symbol
			if (funcDecl.name === symbolName && includeDeclaration) {
				locations.push(createLocation(uri, funcDecl.line, funcDecl.column, funcDecl.name));
			}
			// Check parameters
			for (const param of funcDecl.params) {
				if (param.name === symbolName && includeDeclaration) {
					// Parameters don't have their own line/column in current AST
					// Use function line as approximation
					locations.push(createLocation(uri, funcDecl.line, funcDecl.column, param.name));
				}
				// Check default values
				if (param.defaultValue) {
					findReferencesInExpression(param.defaultValue, symbolName, uri, locations);
				}
			}
			// Search in function body
			for (const bodyStmt of funcDecl.body) {
				findReferencesInStatement(bodyStmt, symbolName, uri, locations, includeDeclaration);
			}
			break;
		}

		case "MethodDeclaration": {
			const methodDecl = stmt as MethodDeclaration;
			if (methodDecl.name === symbolName && includeDeclaration) {
				locations.push(createLocation(uri, methodDecl.line, methodDecl.column, methodDecl.name));
			}
			for (const param of methodDecl.params) {
				if (param.name === symbolName && includeDeclaration) {
					locations.push(createLocation(uri, methodDecl.line, methodDecl.column, param.name));
				}
				if (param.defaultValue) {
					findReferencesInExpression(param.defaultValue, symbolName, uri, locations);
				}
			}
			for (const bodyStmt of methodDecl.body) {
				findReferencesInStatement(bodyStmt, symbolName, uri, locations, includeDeclaration);
			}
			break;
		}

		case "ExpressionStatement": {
			findReferencesInExpression(stmt.expression, symbolName, uri, locations);
			break;
		}

		case "AssignmentStatement": {
			findReferencesInExpression(stmt.target, symbolName, uri, locations);
			findReferencesInExpression(stmt.value, symbolName, uri, locations);
			break;
		}

		case "IfStatement": {
			findReferencesInExpression(stmt.condition, symbolName, uri, locations);
			for (const bodyStmt of stmt.consequent) {
				findReferencesInStatement(bodyStmt, symbolName, uri, locations, includeDeclaration);
			}
			if (stmt.alternate) {
				for (const bodyStmt of stmt.alternate) {
					findReferencesInStatement(bodyStmt, symbolName, uri, locations, includeDeclaration);
				}
			}
			break;
		}

		case "ForStatement": {
			// Check iterator declaration
			if (stmt.iterator === symbolName && includeDeclaration) {
				locations.push(createLocation(uri, stmt.line, stmt.column, stmt.iterator));
			}
			// Check range expressions
			findReferencesInExpression(stmt.from, symbolName, uri, locations);
			findReferencesInExpression(stmt.to, symbolName, uri, locations);
			if (stmt.step) {
				findReferencesInExpression(stmt.step, symbolName, uri, locations);
			}
			// Search in body
			for (const bodyStmt of stmt.body) {
				findReferencesInStatement(bodyStmt, symbolName, uri, locations, includeDeclaration);
			}
			break;
		}

		case "ForInStatement": {
			if (stmt.iterator === symbolName && includeDeclaration) {
				locations.push(createLocation(uri, stmt.line, stmt.column, stmt.iterator));
			}
			findReferencesInExpression(stmt.collection, symbolName, uri, locations);
			for (const bodyStmt of stmt.body) {
				findReferencesInStatement(bodyStmt, symbolName, uri, locations, includeDeclaration);
			}
			break;
		}

		case "WhileStatement": {
			findReferencesInExpression(stmt.condition, symbolName, uri, locations);
			for (const bodyStmt of stmt.body) {
				findReferencesInStatement(bodyStmt, symbolName, uri, locations, includeDeclaration);
			}
			break;
		}

		case "ReturnStatement": {
			findReferencesInExpression(stmt.value, symbolName, uri, locations);
			break;
		}

		case "TupleDeclaration": {
			for (const name of stmt.names) {
				if (name === symbolName && includeDeclaration) {
					locations.push(createLocation(uri, stmt.line, stmt.column, name));
				}
			}
			findReferencesInExpression(stmt.init, symbolName, uri, locations);
			break;
		}

		case "ImportStatement": {
			if (stmt.alias === symbolName && includeDeclaration) {
				locations.push(createLocation(uri, stmt.line, stmt.column, stmt.alias));
			}
			break;
		}

		case "TypeDeclaration":
		case "EnumDeclaration": {
			if (stmt.name === symbolName && includeDeclaration) {
				locations.push(createLocation(uri, stmt.line, stmt.column, stmt.name));
			}
			break;
		}

		case "SequenceStatement": {
			for (const seqStmt of stmt.statements) {
				findReferencesInStatement(seqStmt, symbolName, uri, locations, includeDeclaration);
			}
			break;
		}
	}
}

/**
 * Find references in an expression.
 */
function findReferencesInExpression(
	expr: Expression,
	symbolName: string,
	uri: string,
	locations: Location[],
): void {
	switch (expr.type) {
		case "Identifier": {
			const id = expr as Identifier;
			if (id.name === symbolName) {
				locations.push(createLocation(uri, id.line, id.column, id.name));
			}
			break;
		}

		case "CallExpression": {
			const call = expr as CallExpression;
			// Check callee
			findReferencesInExpression(call.callee, symbolName, uri, locations);
			// Check arguments
			for (const arg of call.arguments) {
				findReferencesInExpression(arg.value, symbolName, uri, locations);
			}
			break;
		}

		case "MemberExpression": {
			// Check object part (e.g., "foo" in "foo.bar")
			findReferencesInExpression(expr.object, symbolName, uri, locations);
			// Note: We don't check property as it's accessed via the object
			break;
		}

		case "BinaryExpression": {
			findReferencesInExpression(expr.left, symbolName, uri, locations);
			findReferencesInExpression(expr.right, symbolName, uri, locations);
			break;
		}

		case "UnaryExpression": {
			findReferencesInExpression(expr.argument, symbolName, uri, locations);
			break;
		}

		case "TernaryExpression": {
			findReferencesInExpression(expr.condition, symbolName, uri, locations);
			findReferencesInExpression(expr.consequent, symbolName, uri, locations);
			findReferencesInExpression(expr.alternate, symbolName, uri, locations);
			break;
		}

		case "ArrayExpression": {
			for (const element of expr.elements) {
				findReferencesInExpression(element, symbolName, uri, locations);
			}
			break;
		}

		case "IndexExpression": {
			findReferencesInExpression(expr.object, symbolName, uri, locations);
			findReferencesInExpression(expr.index, symbolName, uri, locations);
			break;
		}

		case "SwitchExpression": {
			if (expr.discriminant) {
				findReferencesInExpression(expr.discriminant, symbolName, uri, locations);
			}
			for (const switchCase of expr.cases) {
				if (switchCase.condition) {
					findReferencesInExpression(switchCase.condition, symbolName, uri, locations);
				}
				findReferencesInExpression(switchCase.result, symbolName, uri, locations);
			}
			break;
		}

		case "Literal":
			// Literals don't contain references
			break;
	}
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
