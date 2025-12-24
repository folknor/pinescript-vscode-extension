// AST Extractor for pine-lint compatible output format
// This module extracts variables, functions, types, and enums from the Pine Script AST

import type {
	CallExpression,
	EnumDeclaration,
	Expression,
	ForInStatement,
	ForStatement,
	FunctionDeclaration,
	FunctionParam,
	Identifier,
	MemberExpression,
	Program,
	Statement,
	TupleDeclaration,
	TypeAnnotation,
	TypeDeclaration,
	VariableDeclaration,
} from "./ast";
import {
	getPolymorphicReturnType,
	type ArgumentInfo,
} from "../analyzer/builtins";
import {
	FUNCTIONS_BY_NAME,
	VARIABLES_BY_NAME,
} from "../../../../pine-data/v6";

// Pine-lint compatible interfaces
export interface PineLintPosition {
	line: number;
	column: number;
}

export interface PineLintDefinition {
	start: PineLintPosition;
	end: PineLintPosition;
}

export interface PineLintVariable {
	name: string;
	type: string;
	definition: PineLintDefinition;
	scopeId?: string;
}

export interface PineLintFunctionArg {
	name: string;
	required: boolean;
	allowedTypeIDs: number[];
	displayType: string;
}

export interface PineLintFunction {
	name: string;
	definition: PineLintDefinition;
	args: PineLintFunctionArg[];
	returnedTypes: number[];
	syntax: string[];
}

export interface PineLintType {
	name: string;
	definition: PineLintDefinition;
}

export interface PineLintEnum {
	name: string;
	definition: PineLintDefinition;
}

export interface PineLintError {
	start: PineLintPosition;
	end: PineLintPosition;
	message: string;
}

export interface PineLintResult {
	errors?: PineLintError[];
	warnings?: PineLintError[];
	variables: PineLintVariable[];
	functions: PineLintFunction[];
	types: PineLintType[];
	enums: PineLintEnum[];
}

export interface PineLintOutput {
	success: boolean;
	result?: PineLintResult;
	error?: string;
}

// Helper: Get function return type from pine-data
function getFunctionReturnType(funcName: string): string | undefined {
	const func = FUNCTIONS_BY_NAME.get(funcName);
	return func?.returns;
}

// Helper: Get variable type from pine-data
function getVariableType(varName: string): string | undefined {
	const variable = VARIABLES_BY_NAME.get(varName);
	if (variable?.type) {
		// Normalize format: "series<float>" -> "series float"
		return variable.type.replace(/<(\w+)>/, " $1");
	}
	return undefined;
}

export class ASTExtractor {
	private scopeCounter = 0;
	private extractedVariables: PineLintVariable[] = [];

	/**
	 * Extract pine-lint compatible result from AST
	 */
	extract(ast: Program): PineLintResult {
		this.scopeCounter = 0;
		this.extractedVariables = [];

		const variables = this.extractVariables(ast);
		const functions = this.extractFunctions(ast);
		const types = this.extractTypes(ast);
		const enums = this.extractEnums(ast);

		return { variables, functions, types, enums };
	}

	/**
	 * Extract all variable declarations
	 */
	extractVariables(ast: Program): PineLintVariable[] {
		this.extractedVariables = [];
		this.walkStatements(ast.body, this.extractedVariables, undefined);
		return this.extractedVariables;
	}

	/**
	 * Walk statements and collect variables
	 */
	private walkStatements(
		statements: Statement[],
		variables: PineLintVariable[],
		scopeId: string | undefined,
	): void {
		for (const stmt of statements) {
			if (stmt.type === "VariableDeclaration") {
				const varDecl = stmt as VariableDeclaration;
				const variable = this.extractVariable(varDecl, scopeId);
				variables.push(variable);
			} else if (stmt.type === "TupleDeclaration") {
				const tupleDecl = stmt as TupleDeclaration;
				// Extract all variables from the tuple
				const tupleVars = this.extractTupleVariables(tupleDecl, scopeId);
				variables.push(...tupleVars);
			} else if (stmt.type === "FunctionDeclaration") {
				// Extract function-local variables with new scope
				const funcDecl = stmt as FunctionDeclaration;
				this.scopeCounter++;
				const funcScopeId = `#${this.scopeCounter}`;

				// Add function parameters as variables
				for (const param of funcDecl.params) {
					const paramVar = this.extractParam(param, funcDecl.line, funcScopeId);
					variables.push(paramVar);
				}

				// Walk function body
				this.walkStatements(funcDecl.body, variables, funcScopeId);
			} else if (stmt.type === "IfStatement") {
				const ifStmt = stmt as {
					consequent: Statement[];
					alternate?: Statement[];
				};
				this.walkStatements(ifStmt.consequent, variables, scopeId);
				if (ifStmt.alternate) {
					this.walkStatements(ifStmt.alternate, variables, scopeId);
				}
			} else if (stmt.type === "ForStatement") {
				const forStmt = stmt as ForStatement;
				variables.push(this.createIteratorVariable(
					forStmt.iterator, forStmt.line, forStmt.column, "series int", scopeId
				));
				this.walkStatements(forStmt.body, variables, scopeId);
			} else if (stmt.type === "ForInStatement") {
				const forInStmt = stmt as ForInStatement;
				variables.push(this.createIteratorVariable(
					forInStmt.iterator, forInStmt.line, forInStmt.column, "undetermined type", scopeId
				));
				this.walkStatements(forInStmt.body, variables, scopeId);
			} else if (stmt.type === "WhileStatement") {
				const loopStmt = stmt as { body: Statement[] };
				this.walkStatements(loopStmt.body, variables, scopeId);
			} else if (stmt.type === "SequenceStatement") {
				// Handle comma-separated declarations: x = 1, y = 2, z = 3
				const seqStmt = stmt as { statements: Statement[] };
				this.walkStatements(seqStmt.statements, variables, scopeId);
			}
		}
	}

	/**
	 * Extract a single variable declaration
	 */
	private extractVariable(
		varDecl: VariableDeclaration,
		scopeId: string | undefined,
	): PineLintVariable {
		const typeString = this.inferVariableType(varDecl);
		const endColumn =
			varDecl.column + varDecl.name.length + (varDecl.init ? 20 : 0); // Approximate

		const variable: PineLintVariable = {
			name: varDecl.name,
			type: typeString,
			definition: {
				start: { line: varDecl.line, column: varDecl.column },
				end: { line: varDecl.line, column: endColumn },
			},
		};

		if (scopeId) {
			variable.scopeId = scopeId;
		}

		return variable;
	}

	/**
	 * Extract variables from a tuple declaration
	 */
	private extractTupleVariables(
		tupleDecl: TupleDeclaration,
		scopeId: string | undefined,
	): PineLintVariable[] {
		const variables: PineLintVariable[] = [];

		// Infer type from the init expression (usually a function call returning tuple)
		let baseType = "series float"; // Default for tuples
		if (tupleDecl.init.type === "CallExpression") {
			const call = tupleDecl.init as CallExpression;
			const funcName = this.getCalleeString(call.callee);
			// Get return type from pine-data
			const returnType = getFunctionReturnType(funcName);
			if (returnType) {
				baseType = returnType;
			}
		}

		for (let i = 0; i < tupleDecl.names.length; i++) {
			const name = tupleDecl.names[i];
			const variable: PineLintVariable = {
				name,
				type: baseType,
				definition: {
					start: { line: tupleDecl.line, column: tupleDecl.column },
					end: { line: tupleDecl.line, column: tupleDecl.column + name.length },
				},
			};
			if (scopeId) {
				variable.scopeId = scopeId;
			}
			variables.push(variable);
		}

		return variables;
	}

	/**
	 * Extract a function parameter as a variable
	 */
	private extractParam(
		param: FunctionParam,
		funcLine: number,
		scopeId: string,
	): PineLintVariable {
		const typeString = param.typeAnnotation
			? this.typeAnnotationToString(param.typeAnnotation)
			: "undetermined type";

		return {
			name: param.name,
			type: typeString,
			definition: {
				start: { line: funcLine, column: 1 },
				end: { line: funcLine, column: 1 + param.name.length },
			},
			scopeId,
		};
	}

	/**
	 * Create an iterator variable for for/for-in loops
	 */
	private createIteratorVariable(
		name: string,
		line: number,
		column: number,
		type: string,
		scopeId: string | undefined,
	): PineLintVariable {
		const variable: PineLintVariable = {
			name,
			type,
			definition: {
				start: { line, column },
				end: { line, column: column + name.length },
			},
		};
		if (scopeId) {
			variable.scopeId = scopeId;
		}
		return variable;
	}

	/**
	 * Infer the type of a variable from its declaration
	 */
	private inferVariableType(varDecl: VariableDeclaration): string {
		// Check explicit type annotation first
		if (varDecl.typeAnnotation) {
			return this.typeAnnotationToString(varDecl.typeAnnotation);
		}

		// If no init expression, return undetermined
		if (!varDecl.init) {
			return "undetermined type";
		}

		// Infer from the init expression
		return this.inferExpressionType(varDecl.init);
	}

	/**
	 * Convert type annotation to pine-lint type string
	 */
	private typeAnnotationToString(annotation: TypeAnnotation): string {
		const baseName = annotation.name.toLowerCase();
		const qualifier = annotation.qualifier?.toLowerCase();

		if (qualifier) {
			return `${qualifier} ${baseName}`;
		}

		// Default to simple for basic types
		return `simple ${baseName}`;
	}

	/**
	 * Infer the type of an expression
	 */
	private inferExpressionType(expr: Expression): string {
		switch (expr.type) {
			case "Literal": {
				const lit = expr as { value: string | number | boolean; raw?: string };
				if (typeof lit.value === "number") {
					// Check raw string for decimal point to properly detect floats like 2.0
					const hasDecimalPoint = lit.raw?.includes(".");
					return hasDecimalPoint || !Number.isInteger(lit.value)
						? "const float"
						: "const int";
				}
				if (typeof lit.value === "boolean") {
					return "const bool";
				}
				if (typeof lit.value === "string") {
					return "const string";
				}
				return "undetermined type";
			}

			case "Identifier": {
				const id = expr as Identifier;
				// Check built-in variables from pine-data
				const varType = getVariableType(id.name);
				if (varType) {
					return varType;
				}
				// Check already-extracted variables
				const variable = this.extractedVariables.find(
					(v) => v.name === id.name,
				);
				if (variable && variable.type !== "undetermined type") {
					return variable.type;
				}
				return "undetermined type";
			}

			case "CallExpression": {
				const call = expr as CallExpression;
				const funcName = this.getCalleeString(call.callee);
				const funcDef = FUNCTIONS_BY_NAME.get(funcName);

				// Handle generic type arguments: array.new<float>() -> array<float>
				if (call.typeArguments && call.typeArguments.length > 0) {
					const typeArg = call.typeArguments[0];
					if (funcName.startsWith("array.new")) {
						return `array<${typeArg}>`;
					}
					if (funcName.startsWith("matrix.new")) {
						return `matrix<${typeArg}>`;
					}
					if (funcName === "map.new") {
						return `map<${typeArg}>`;
					}
				}

				// Handle input functions - polymorphic return type based on defval
				if (funcName === "input") {
					const argInfos = call.arguments.map((arg) => ({
						name: arg.name,
						type: this.inferExpressionType(arg.value),
					}));
					const polyType = getPolymorphicReturnType(
						funcName,
						argInfos.map((info) => info.type) as import("../analyzer/types").PineType[],
						argInfos as ArgumentInfo[],
					);
					return polyType ? `input ${polyType}` : "input int";
				}

				// Handle input.* functions (input.int, input.float, etc.)
				if (funcName.startsWith("input.") && funcDef?.returns) {
					const baseType = funcDef.returns.replace(/^(series|simple)\s*/, "");
					return `input ${baseType}`;
				}

				// Math functions preserve input qualifier and type
				if (funcName.startsWith("math.") && funcDef && call.arguments.length > 0) {
					return this.inferExpressionType(call.arguments[0].value);
				}

				// Array element-returning functions (polymorphic on array element type)
				if (funcDef?.flags?.polymorphic === "element" && call.arguments.length > 0) {
					const arrayArgType = this.inferExpressionType(call.arguments[0].value);
					const arrayMatch = arrayArgType.match(/^array<(.+)>$/);
					if (arrayMatch) {
						// If function has explicit return type, use it; otherwise use element type
						if (funcDef.returns && !funcDef.returns.includes("<type>")) {
							return funcDef.returns;
						}
						return arrayMatch[1];
					}
				}

				// Default: use return type from pine-data
				return funcDef?.returns || "undetermined type";
			}

			case "MemberExpression": {
				const member = expr as MemberExpression;
				const fullName = this.getMemberExpressionString(member);

				// Check built-in variables from pine-data
				const memberType = getVariableType(fullName);
				if (memberType) {
					return memberType;
				}

				return "undetermined type";
			}

			case "BinaryExpression":
			case "TernaryExpression":
				// Binary/ternary expressions generally produce series types
				return "series float";

			case "UnaryExpression": {
				const unary = expr as { operator: string; argument: Expression };
				const argType = this.inferExpressionType(unary.argument);
				// Unary negation preserves the qualifier and type
				if (unary.operator === "-" || unary.operator === "+") {
					return argType;
				}
				if (unary.operator === "not") {
					return argType.replace(/int|float/, "bool");
				}
				return argType;
			}

			case "ArrayExpression":
				return "array<float>";

			case "IndexExpression":
				return "series float";

			default:
				return "undetermined type";
		}
	}

	/**
	 * Get the string representation of a callee expression
	 */
	private getCalleeString(callee: Expression): string {
		if (callee.type === "Identifier") {
			return (callee as Identifier).name;
		}
		if (callee.type === "MemberExpression") {
			return this.getMemberExpressionString(callee as MemberExpression);
		}
		return "";
	}

	/**
	 * Get the full string of a member expression (e.g., "ta.sma")
	 */
	private getMemberExpressionString(member: MemberExpression): string {
		const parts: string[] = [];
		let current: Expression = member;

		while (current.type === "MemberExpression") {
			const m = current as MemberExpression;
			parts.unshift(m.property.name);
			current = m.object;
		}

		if (current.type === "Identifier") {
			parts.unshift((current as Identifier).name);
		}

		return parts.join(".");
	}

	/**
	 * Extract all function declarations
	 */
	extractFunctions(ast: Program): PineLintFunction[] {
		const functions: PineLintFunction[] = [];

		for (const stmt of ast.body) {
			if (stmt.type === "FunctionDeclaration") {
				const funcDecl = stmt as FunctionDeclaration;
				functions.push(this.extractFunction(funcDecl));
			}
		}

		return functions;
	}

	/**
	 * Extract a single function declaration
	 */
	private extractFunction(funcDecl: FunctionDeclaration): PineLintFunction {
		const args: PineLintFunctionArg[] = funcDecl.params.map((param) => ({
			name: param.name,
			required: param.defaultValue === undefined,
			allowedTypeIDs: [],
			displayType: param.typeAnnotation
				? this.typeAnnotationToString(param.typeAnnotation)
				: "undetermined type",
		}));

		const returnType = this.inferFunctionReturnType(funcDecl);
		const paramList = funcDecl.params.map((p) => p.name).join(", ");
		const syntax = [`${funcDecl.name}(${paramList}) → ${returnType}`];

		// Estimate end position (line count based on body statements)
		const endLine =
			funcDecl.body.length > 0
				? Math.max(...funcDecl.body.map((s) => s.line)) + 1
				: funcDecl.line + 1;

		return {
			name: funcDecl.name,
			definition: {
				start: { line: funcDecl.line, column: funcDecl.column },
				end: { line: endLine, column: 1 },
			},
			args,
			returnedTypes: [],
			syntax,
		};
	}

	/**
	 * Infer the return type of a function
	 */
	private inferFunctionReturnType(funcDecl: FunctionDeclaration): string {
		// Check explicit return type annotation
		if (funcDecl.returnType) {
			return this.typeAnnotationToString(funcDecl.returnType);
		}

		// Look for return statements
		for (const stmt of funcDecl.body) {
			if (stmt.type === "ReturnStatement") {
				const retStmt = stmt as { value: Expression };
				return this.inferExpressionType(retStmt.value);
			}
		}

		// Check last statement as implicit return
		if (funcDecl.body.length > 0) {
			const lastStmt = funcDecl.body[funcDecl.body.length - 1];
			if (lastStmt.type === "ExpressionStatement") {
				const exprStmt = lastStmt as { expression: Expression };
				return this.inferExpressionType(exprStmt.expression);
			}
		}

		return "undetermined type";
	}

	/**
	 * Extract type declarations (v6 user-defined types)
	 */
	extractTypes(ast: Program): PineLintType[] {
		const types: PineLintType[] = [];

		for (const stmt of ast.body) {
			if (stmt.type === "TypeDeclaration") {
				const typeDecl = stmt as TypeDeclaration;
				types.push({
					name: typeDecl.name,
					definition: {
						start: { line: typeDecl.line, column: typeDecl.column },
						end: {
							line: typeDecl.line,
							column: typeDecl.column + typeDecl.name.length,
						},
					},
				});
			}
		}

		return types;
	}

	/**
	 * Extract enum declarations
	 */
	extractEnums(ast: Program): PineLintEnum[] {
		const enums: PineLintEnum[] = [];

		for (const stmt of ast.body) {
			if (stmt.type === "EnumDeclaration") {
				const enumDecl = stmt as EnumDeclaration;
				enums.push({
					name: enumDecl.name,
					definition: {
						start: { line: enumDecl.line, column: enumDecl.column },
						end: {
							line: enumDecl.line,
							column: enumDecl.column + enumDecl.name.length,
						},
					},
				});
			}
		}

		return enums;
	}
}
