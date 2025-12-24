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

// Input function patterns that determine variable type
const INPUT_FUNCTIONS: Record<string, string> = {
	"input.int": "input int",
	"input.float": "input float",
	"input.bool": "input bool",
	"input.string": "input string",
	"input.color": "input color",
	"input.source": "series float",
	"input.timeframe": "input string",
	"input.symbol": "input string",
	"input.session": "input string",
	"input.time": "input int",
	"input.text_area": "input string",
	// Note: plain "input" is handled separately with polymorphic return type detection
};

// TA functions that return series types (when args are series)
const SERIES_FUNCTIONS: Record<string, string> = {
	"ta.sma": "series float",
	"ta.ema": "series float",
	"ta.wma": "series float",
	"ta.vwma": "series float",
	"ta.rsi": "series float",
	"ta.macd": "series float",
	"ta.stoch": "series float",
	"ta.cci": "series float",
	"ta.atr": "series float",
	"ta.tr": "series float",
	"ta.bb": "series float",
	"ta.highest": "series float",
	"ta.lowest": "series float",
	"ta.crossover": "series bool",
	"ta.crossunder": "series bool",
	"ta.cross": "series bool",
	"ta.pivothigh": "series float",
	"ta.pivotlow": "series float",
	"ta.change": "series float",
	"ta.mom": "series float",
	"ta.roc": "series float",
	"ta.variance": "series float",
	"ta.stdev": "series float",
	"ta.correlation": "series float",
	"ta.cum": "series float",
	"ta.valuewhen": "series float",
	"ta.barssince": "series int",
	"ta.percentile_linear_interpolation": "series float",
	"ta.percentile_nearest_rank": "series float",
	"str.tostring": "series string",
	"str.format": "series string",
	"str.length": "series int",
	"str.contains": "series bool",
	"str.replace": "series string",
	"str.split": "array<string>",
	"request.security": "series float",
	"request.security_lower_tf": "array<float>",
	"array.new_float": "array<float>",
	"array.new_int": "array<int>",
	"array.new_bool": "array<bool>",
	"array.new_string": "array<string>",
	"array.new_color": "array<color>",
	"array.from": "array<float>",
	"array.size": "series int",
	"array.get": "series float",
	"array.push": "void",
	"array.pop": "series float",
	"array.avg": "series float",
	"array.sum": "series float",
	"array.max": "series float",
	"array.min": "series float",
};

// Functions that preserve the qualifier of their input (const in -> const out, series in -> series out)
const QUALIFIER_PRESERVING_FUNCTIONS: Record<
	string,
	{ int: string; float: string }
> = {
	"math.abs": { int: "int", float: "float" },
	"math.max": { int: "int", float: "float" },
	"math.min": { int: "int", float: "float" },
	"math.round": { int: "int", float: "int" },
	"math.floor": { int: "int", float: "int" },
	"math.ceil": { int: "int", float: "int" },
	"math.sqrt": { int: "float", float: "float" },
	"math.pow": { int: "float", float: "float" },
	"math.log": { int: "float", float: "float" },
	"math.log10": { int: "float", float: "float" },
	"math.exp": { int: "float", float: "float" },
	"math.sign": { int: "int", float: "int" },
	"math.avg": { int: "float", float: "float" },
	"math.sum": { int: "int", float: "float" },
};

// Built-in series variables
const BUILTIN_SERIES: Record<string, string> = {
	close: "series float",
	open: "series float",
	high: "series float",
	low: "series float",
	volume: "series float",
	time: "series int",
	hl2: "series float",
	hlc3: "series float",
	ohlc4: "series float",
	hlcc4: "series float",
	bar_index: "series int",
	timenow: "simple int",
	na: "na",
};

export class ASTExtractor {
	private scopeCounter = 0;
	private currentScopeId: string | undefined = undefined;

	/**
	 * Extract pine-lint compatible result from AST
	 */
	extract(ast: Program): PineLintResult {
		this.scopeCounter = 0;
		this.currentScopeId = undefined;

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
		const variables: PineLintVariable[] = [];
		this.walkStatements(ast.body, variables, undefined);
		return variables;
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
				// Extract the iterator variable
				const iterVar: PineLintVariable = {
					name: forStmt.iterator,
					type: "series int",
					definition: {
						start: { line: forStmt.line, column: forStmt.column },
						end: {
							line: forStmt.line,
							column: forStmt.column + forStmt.iterator.length,
						},
					},
				};
				if (scopeId) {
					iterVar.scopeId = scopeId;
				}
				variables.push(iterVar);
				this.walkStatements(forStmt.body, variables, scopeId);
			} else if (stmt.type === "ForInStatement") {
				const forInStmt = stmt as ForInStatement;
				// Extract the iterator variable
				const iterVar: PineLintVariable = {
					name: forInStmt.iterator,
					type: "undetermined type", // Collection element type
					definition: {
						start: { line: forInStmt.line, column: forInStmt.column },
						end: {
							line: forInStmt.line,
							column: forInStmt.column + forInStmt.iterator.length,
						},
					},
				};
				if (scopeId) {
					iterVar.scopeId = scopeId;
				}
				variables.push(iterVar);
				this.walkStatements(forInStmt.body, variables, scopeId);
			} else if (stmt.type === "WhileStatement") {
				const loopStmt = stmt as { body: Statement[] };
				this.walkStatements(loopStmt.body, variables, scopeId);
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
			// Most tuple-returning functions return series float
			if (SERIES_FUNCTIONS[funcName]) {
				baseType = SERIES_FUNCTIONS[funcName];
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
				// Check built-in series
				if (BUILTIN_SERIES[id.name]) {
					return BUILTIN_SERIES[id.name];
				}
				return "undetermined type";
			}

			case "CallExpression": {
				const call = expr as CallExpression;
				const funcName = this.getCalleeString(call.callee);

				// Check for polymorphic functions like input() - use data-driven approach
				if (funcName === "input") {
					const argInfos = call.arguments.map((arg) => ({
						name: arg.name,
						type: this.inferExpressionType(arg.value),
					}));
					const argTypes = argInfos.map((info) => info.type);
					const polyType = getPolymorphicReturnType(
						funcName,
						argTypes as import("../analyzer/types").PineType[],
						argInfos as ArgumentInfo[],
					);
					if (polyType) {
						// Return as input type (e.g., "input int", "input float")
						return `input ${polyType}`;
					}
					return "input int"; // Fallback for unknown input type
				}

				// Check specific input functions (input.int, input.float, etc.)
				if (INPUT_FUNCTIONS[funcName]) {
					return INPUT_FUNCTIONS[funcName];
				}

				// Check qualifier-preserving functions (math.*)
				if (QUALIFIER_PRESERVING_FUNCTIONS[funcName]) {
					const spec = QUALIFIER_PRESERVING_FUNCTIONS[funcName];
					// Infer qualifier from first argument
					if (call.arguments.length > 0) {
						const argType = this.inferExpressionType(call.arguments[0].value);
						// Extract qualifier and base type
						const isConst = argType.startsWith("const ");
						const isInt = argType.includes("int");
						const resultType = isInt ? spec.int : spec.float;
						const qualifier = isConst ? "const" : "series";
						return `${qualifier} ${resultType}`;
					}
					return `series ${spec.float}`;
				}

				// Check series-returning functions
				if (SERIES_FUNCTIONS[funcName]) {
					return SERIES_FUNCTIONS[funcName];
				}

				return "undetermined type";
			}

			case "MemberExpression": {
				const member = expr as MemberExpression;
				const fullName = this.getMemberExpressionString(member);

				// Check built-in series
				if (BUILTIN_SERIES[fullName]) {
					return BUILTIN_SERIES[fullName];
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
