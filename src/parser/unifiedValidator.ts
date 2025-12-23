// Unified Pine Script Validator with Type Checking and Scope Analysis
// This is the single validator for the extension, combining all validation logic.

import {
	type PineFunction,
	type PineParameter,
	FUNCTIONS_BY_NAME,
	CONSTANTS_BY_NAME,
	VARIABLES_BY_NAME,
} from "../../pine-data/v6";
import type {
	ArrayExpression,
	BinaryExpression,
	CallArgument,
	CallExpression,
	Expression,
	ExpressionStatement,
	Identifier,
	IndexExpression,
	Literal,
	MemberExpression,
	Program,
	ReturnStatement,
	Statement,
	SwitchExpression,
	TernaryExpression,
	TupleDeclaration,
	UnaryExpression,
} from "./ast";
import { type Symbol as SymbolInfo, SymbolTable } from "./symbolTable";
import { type PineType, TypeChecker } from "./typeSystem";

export enum DiagnosticSeverity {
	Error = 0,
	Warning = 1,
	Information = 2,
	Hint = 3,
}

export interface ValidationError {
	line: number;
	column: number;
	length: number;
	message: string;
	severity: DiagnosticSeverity;
}

interface FunctionSignature {
	name: string;
	parameters: ParameterInfo[];
	returns?: string;
}

interface ParameterInfo {
	name: string;
	type?: PineType;
	optional?: boolean;
	defaultValue?: string;
}

export class UnifiedPineValidator {
	private errors: ValidationError[] = [];
	private symbolTable: SymbolTable;
	private functionSignatures: Map<string, FunctionSignature> = new Map();
	private expressionTypes: Map<Expression, PineType> = new Map();
	private blockDepth: number = 0;

	private topLevelOnlyFunctions = new Set([
		"indicator",
		"strategy",
		"library",
		"plot",
		"plotshape",
		"plotchar",
		"plotcandle",
		"plotbar",
		"hline",
		"bgcolor",
		"barcolor",
		"fill",
		"alertcondition",
	]);

	constructor() {
		this.symbolTable = new SymbolTable();
		this.buildFunctionSignatures();
	}

	validate(ast: Program, version: string = "6"): ValidationError[] {
		this.errors = [];
		this.symbolTable = new SymbolTable();
		this.expressionTypes.clear();

		// Single pass: collect declarations and validate together
		// This ensures function parameters are in scope during validation
		for (const statement of ast.body) {
			this.validateStatement(statement, version);
		}

		// Check for unused variables (only for v6)
		if (version === "6") {
			this.checkUnusedVariables();
		}

		return this.errors;
	}

	private buildFunctionSignatures(): void {
		// Build from FUNCTIONS_BY_NAME which has accurate parameter requirements
		// Return types are already included in the generated data
		for (const [name, func] of FUNCTIONS_BY_NAME) {
			const sig = this.buildSignatureFromPineFunction(name, func);
			if (sig) {
				this.functionSignatures.set(name, sig);
			}
		}
	}

	// Phase D - Session 5: Namespace properties for property access type inference
	// Session 9: Track deprecated v5 constants for migration warnings
	private deprecatedV5Constants: Record<string, string> = {
		"plot.style_dashed": "plot.style_linebr",
		"plot.style_circles": "plot.style_circles", // Actually valid, but often confused
	};

	// Namespace properties for property access type inference
	private namespaceProperties: Record<string, PineType> = {
		// Build from CONSTANTS_BY_NAME at initialization time
		...(() => {
			const props: Record<string, PineType> = {};
			for (const [name, constant] of CONSTANTS_BY_NAME) {
				props[name] = constant.type as PineType;
			}
			// Also include variables
			for (const [name, variable] of VARIABLES_BY_NAME) {
				if (name.includes(".")) {
					props[name] = variable.type as PineType;
				}
			}
			return props;
		})(),

		// v4/v5 input type constants (for backward compatibility - not in v6 data)
		"input.source": "string",
		"input.resolution": "string",
		"input.bool": "string",
		"input.integer": "string",
		"input.float": "string",
		"input.string": "string",
		"input.color": "string",
		"input.timeframe": "string",
		"input.symbol": "string",
		"input.session": "string",
		"input.price": "string",
		"input.time": "string",

		// Namespace VARIABLES (not constants - these are runtime values, not in scraped data)
		// syminfo namespace
		"syminfo.tickerid": "simple<string>",
		"syminfo.ticker": "simple<string>",
		"syminfo.prefix": "simple<string>",
		"syminfo.type": "simple<string>",
		"syminfo.session": "simple<string>",
		"syminfo.timezone": "simple<string>",
		"syminfo.currency": "simple<string>",
		"syminfo.basecurrency": "simple<string>",
		"syminfo.root": "simple<string>",
		"syminfo.pointvalue": "simple<float>",
		"syminfo.mintick": "simple<float>",
		"syminfo.description": "simple<string>",
		"syminfo.sector": "simple<string>",
		"syminfo.industry": "simple<string>",
		"syminfo.country": "simple<string>",
		"syminfo.volumetype": "simple<string>",

		// barstate namespace
		"barstate.isfirst": "series<bool>",
		"barstate.islast": "series<bool>",
		"barstate.isrealtime": "series<bool>",
		"barstate.isnew": "series<bool>",
		"barstate.isconfirmed": "series<bool>",
		"barstate.ishistory": "series<bool>",
		"barstate.islastconfirmedhistory": "series<bool>",

		// timeframe namespace
		"timeframe.period": "simple<string>",
		"timeframe.multiplier": "simple<int>",
		"timeframe.isseconds": "simple<bool>",
		"timeframe.isminutes": "simple<bool>",
		"timeframe.isdaily": "simple<bool>",
		"timeframe.isweekly": "simple<bool>",
		"timeframe.ismonthly": "simple<bool>",
		"timeframe.isdwm": "simple<bool>",
		"timeframe.isintraday": "simple<bool>",

		// chart namespace
		"chart.bg_color": "color",
		"chart.fg_color": "color",
		"chart.left_visible_bar_time": "series<int>",
		"chart.right_visible_bar_time": "series<int>",
		"chart.is_heikinashi": "simple<bool>",
		"chart.is_kagi": "simple<bool>",
		"chart.is_linebreak": "simple<bool>",
		"chart.is_pnf": "simple<bool>",
		"chart.is_range": "simple<bool>",
		"chart.is_renko": "simple<bool>",
		"chart.is_standard": "simple<bool>",

		// session namespace
		"session.ismarket": "series<bool>",
		"session.ispremarket": "series<bool>",
		"session.ispostmarket": "series<bool>",
		"session.isfirstbar": "series<bool>",
		"session.islastbar": "series<bool>",
		"session.isfirstbar_regular": "series<bool>",
		"session.islastbar_regular": "series<bool>",

		// strategy namespace
		"strategy.position_size": "series<float>",
		"strategy.position_avg_price": "series<float>",
		"strategy.equity": "series<float>",
		"strategy.openprofit": "series<float>",
		"strategy.netprofit": "series<float>",
		"strategy.grossprofit": "series<float>",
		"strategy.grossloss": "series<float>",
		"strategy.max_drawdown": "series<float>",
		"strategy.closedtrades": "series<int>",
		"strategy.opentrades": "series<int>",
		"strategy.wintrades": "series<int>",
		"strategy.losstrades": "series<int>",
		"strategy.eventrades": "series<int>",
		"strategy.initial_capital": "simple<float>",

		// color.grey alias (British spelling, not in TradingView docs)
		"color.grey": "color",
		"color.transparent": "color",
	};

	private buildSignatureFromPineFunction(
		name: string,
		func: PineFunction,
	): FunctionSignature | null {
		try {
			const parameters: ParameterInfo[] = [];

			// Use the parameters array from PineFunction
			for (const param of func.parameters) {
				parameters.push({
					name: param.name,
					type: this.mapToPineType(param.type),
					optional: !param.required,
					defaultValue: param.default,
				});
			}

			return {
				name,
				parameters,
				returns: func.returns || undefined,
			};
		} catch (_e) {
			return null;
		}
	}

	private splitParameters(paramsString: string): string[] {
		const params: string[] = [];
		let current = "";
		let depth = 0;

		for (const char of paramsString) {
			if (char === "(" || char === "[") depth++;
			else if (char === ")" || char === "]") depth--;
			else if (char === "," && depth === 0) {
				if (current.trim()) params.push(current.trim());
				current = "";
				continue;
			}
			current += char;
		}

		if (current.trim()) params.push(current.trim());
		return params;
	}

	private mapToPineType(typeStr?: string): PineType {
		if (!typeStr) return "unknown";

		const typeMap: Record<string, PineType> = {
			int: "int",
			float: "float",
			bool: "bool",
			string: "string",
			color: "color",
			"series int": "series<int>",
			"series float": "series<float>",
			"series bool": "series<bool>",
			"series string": "series<string>",
			"series color": "series<color>",
		};

		return typeMap[typeStr.toLowerCase()] || "unknown";
	}

	private collectDeclarations(
		statement: Statement,
		version: string = "6",
	): void {
		if (statement.type === "VariableDeclaration") {
			const symbol: SymbolInfo = {
				name: statement.name,
				type: "unknown",
				line: statement.line,
				column: statement.column,
				used: false,
				kind: "variable",
				declaredWith: statement.varType,
			};

			// Use type annotation if present, otherwise infer from initialization
			if (statement.typeAnnotation) {
				symbol.type = this.mapToPineType(statement.typeAnnotation.name);
			} else if (statement.init) {
				const initType = this.inferExpressionType(statement.init, version);
				symbol.type = initType;
			}

			this.symbolTable.define(symbol);
		} else if (statement.type === "TupleDeclaration") {
			// Handle tuple destructuring: [a, b, c] = expr
			const tupleDecl = statement as TupleDeclaration;

			// Try to infer types from the init expression
			// For request.security with array arg: [a, b, c] = request.security(sym, tf, [open, high, low])
			// The types come from the array elements (built-in variables)
			const elementTypes: PineType[] = [];

			if (tupleDecl.init.type === "CallExpression") {
				const call = tupleDecl.init as CallExpression;
				let funcName = "";
				if (call.callee.type === "Identifier") {
					funcName = call.callee.name;
				} else if (call.callee.type === "MemberExpression") {
					const member = call.callee;
					if (member.object.type === "Identifier") {
						funcName = `${member.object.name}.${member.property.name}`;
					}
				}

				// For request.security, look for the expression/array argument
				if (funcName === "request.security" && call.arguments.length >= 3) {
					const exprArg = call.arguments[2].value;
					if (exprArg.type === "ArrayExpression") {
						// Extract types from array elements
						for (const elem of (exprArg as ArrayExpression).elements) {
							elementTypes.push(this.inferExpressionType(elem, version));
						}
					}
				}
			}

			// Add each tuple element as a variable
			for (let i = 0; i < tupleDecl.names.length; i++) {
				const name = tupleDecl.names[i];
				// Use inferred type from init expression, or default to series<float>
				const varType = elementTypes[i] || "series<float>";

				this.symbolTable.define({
					name,
					type: varType,
					line: tupleDecl.line,
					column: tupleDecl.column,
					used: false,
					kind: "variable",
					declaredWith: null,
				});
			}
		} else if (statement.type === "FunctionDeclaration") {
			// NOTE: Function declarations are handled in validateStatement
			// to ensure proper scope management. This method is only called
			// from within the function scope that's already been entered.

			// Collect declarations from function body (without managing scope)
			for (const stmt of statement.body) {
				this.collectDeclarations(stmt, version);
			}
		} else if (
			statement.type === "TypeDeclaration" ||
			statement.type === "EnumDeclaration"
		) {
			const symbol: SymbolInfo = {
				name: statement.name,
				type: "unknown",
				line: statement.line,
				column: statement.column,
				used: false,
				kind: "variable", // Treat as variable/namespace for now
				declaredWith: null,
			};
			this.symbolTable.define(symbol);
		}
	}

	private validateStatement(statement: Statement, version: string = "6"): void {
		const _prevBlockDepth = this.blockDepth;
		switch (statement.type) {
			case "VariableDeclaration": {
				// First, register the variable in the symbol table (like collectDeclarations does)
				const symbol: SymbolInfo = {
					name: statement.name,
					type: "unknown",
					line: statement.line,
					column: statement.column,
					used: false,
					kind: "variable",
					declaredWith: statement.varType,
				};

				// Use type annotation if present, otherwise infer from initialization
				if (statement.typeAnnotation) {
					symbol.type = this.mapToPineType(statement.typeAnnotation.name);
				} else if (statement.init) {
					const initType = this.inferExpressionType(statement.init, version);
					symbol.type = initType;
				}

				this.symbolTable.define(symbol);

				// Then validate the initialization expression
				if (statement.init) {
					this.validateExpression(statement.init, version);

					// Check type compatibility
					const initType = this.inferExpressionType(statement.init, version);
					const varSymbol = this.symbolTable.lookupLocal(statement.name);
					if (
						varSymbol &&
						varSymbol.type !== "unknown" &&
						initType !== "unknown"
					) {
						if (!TypeChecker.isAssignable(initType, varSymbol.type)) {
							// Check if this is a type promotion case (simple -> series)
							// In Pine Script, simple types can be promoted to series types
							if (this.canPromoteType(varSymbol.type, initType)) {
								// Promote variable type in symbol table
								varSymbol.type = initType;
								this.symbolTable.update(varSymbol);
							} else {
								this.addError(
									statement.line,
									statement.column,
									statement.name.length,
									`Cannot assign ${initType} to ${varSymbol.type}`,
									DiagnosticSeverity.Error,
								);
							}
						}
					}
				}
				break;
			}

			case "TupleDeclaration": {
				// Handle tuple destructuring: [a, b, c] = expr
				const tupleDecl = statement as TupleDeclaration;

				// Try to infer types from the init expression
				// For request.security with array arg: [a, b, c] = request.security(sym, tf, [open, high, low])
				const elementTypes: PineType[] = [];

				if (tupleDecl.init.type === "CallExpression") {
					const call = tupleDecl.init as CallExpression;
					let funcName = "";
					if (call.callee.type === "Identifier") {
						funcName = call.callee.name;
					} else if (call.callee.type === "MemberExpression") {
						const member = call.callee;
						if (member.object.type === "Identifier") {
							funcName = `${member.object.name}.${member.property.name}`;
						}
					}

					// For request.security, look for the expression/array argument
					if (funcName === "request.security" && call.arguments.length >= 3) {
						const exprArg = call.arguments[2].value;
						if (exprArg.type === "ArrayExpression") {
							// Extract types from array elements
							for (const elem of (exprArg as ArrayExpression).elements) {
								elementTypes.push(this.inferExpressionType(elem, version));
							}
						}
					}
				}

				// Add each tuple element as a variable
				for (let i = 0; i < tupleDecl.names.length; i++) {
					const name = tupleDecl.names[i];
					// Use inferred type from init expression, or default to series<float>
					const varType = elementTypes[i] || "series<float>";

					this.symbolTable.define({
						name,
						type: varType,
						line: tupleDecl.line,
						column: tupleDecl.column,
						used: false,
						kind: "variable",
						declaredWith: null,
					});
				}

				// Validate the init expression
				this.validateExpression(tupleDecl.init, version);
				break;
			}

			case "ExpressionStatement":
				this.validateExpression(statement.expression, version);
				break;

			case "FunctionDeclaration": {
				// First, infer the function return type from the body
				// We need to do this before entering scope since calls to this function
				// elsewhere need to know the return type
				let returnType: PineType = "unknown";

				if (statement.returnType) {
					// Use explicit return type annotation if present
					returnType = this.mapToPineType(statement.returnType.name);
				} else {
					// Infer return type from function body
					// For arrow functions, body contains a single ReturnStatement
					// For block functions, look at all return statements
					returnType = this.inferFunctionReturnType(
						statement.body,
						version,
						statement.params,
					);
				}

				// Register the function in the symbol table at the outer scope
				this.symbolTable.define({
					name: statement.name,
					type: returnType,
					line: statement.line,
					column: statement.column,
					used: false,
					kind: "function",
					declaredWith: null,
				});

				this.symbolTable.enterScope();
				this.blockDepth++;

				// Add function parameters to scope with proper type inference
				// Use the same logic as collectDeclarations for consistency
				for (let i = 0; i < statement.params.length; i++) {
					const param = statement.params[i];
					let paramType: PineType = "unknown";

					// Infer parameter type based on name and position
					if (i === 0) {
						// First parameter is often series data (price, src, val, etc.)
						const paramName = param.name.toLowerCase();
						if (
							paramName.includes("price") ||
							paramName.includes("src") ||
							paramName.includes("val") ||
							paramName.includes("close") ||
							paramName.includes("open") ||
							paramName.includes("high") ||
							paramName.includes("low") ||
							paramName === "price" ||
							paramName === "src" ||
							paramName === "val"
						) {
							paramType = "series<float>";
						} else if (
							paramName.includes("time") ||
							paramName.includes("index")
						) {
							paramType = "series<int>";
						} else if (
							paramName.includes("bool") ||
							paramName.includes("condition")
						) {
							paramType = "series<bool>";
						} else {
							// Default to series<float> for first parameter
							paramType = "series<float>";
						}
					} else {
						// Other parameters are often simple types
						const paramName = param.name.toLowerCase();
						if (
							paramName.includes("length") ||
							paramName.includes("period") ||
							paramName.includes("window") ||
							paramName.includes("count") ||
							paramName.includes("len") ||
							paramName.includes("n") ||
							paramName.includes("size")
						) {
							paramType = "int";
						} else if (
							paramName.includes("overbought") ||
							paramName.includes("oversold") ||
							paramName.includes("level") ||
							paramName.includes("threshold") ||
							paramName.includes("frac") ||
							paramName.includes("multiplier") ||
							paramName.includes("offset") ||
							paramName.includes("sigma")
						) {
							paramType = "float";
						} else {
							// Default to int for other parameters
							paramType = "int";
						}
					}

					this.symbolTable.define({
						name: param.name,
						type: paramType,
						line: statement.line,
						column: statement.column,
						used: false,
						kind: "variable",
						declaredWith: null,
					});
				}

				// Collect declarations within function body FIRST
				for (const stmt of statement.body) {
					this.collectDeclarations(stmt, version);
				}

				// THEN validate function body (with all variables in scope)
				for (const stmt of statement.body) {
					this.validateStatement(stmt);
				}
				this.symbolTable.exitScope();
				this.blockDepth--;
				break;
			}

			case "IfStatement": {
				this.validateExpression(statement.condition, version);
				const condType = this.inferExpressionType(statement.condition, version);
				if (!TypeChecker.isBoolType(condType)) {
					this.addError(
						statement.line,
						statement.column,
						10,
						`Condition must be boolean, got ${condType}`,
						DiagnosticSeverity.Error,
					);
				}

				// Note: In Pine Script, if statements do NOT create new scopes
				// Variables assigned inside if blocks persist in the outer scope
				for (const stmt of statement.consequent) {
					this.collectDeclarations(stmt, version);
				}
				this.blockDepth++;
				for (const stmt of statement.consequent) {
					this.validateStatement(stmt, version);
				}
				this.blockDepth--;

				if (statement.alternate) {
					this.blockDepth++;
					for (const stmt of statement.alternate) {
						this.collectDeclarations(stmt, version);
					}
					for (const stmt of statement.alternate) {
						this.validateStatement(stmt, version);
					}
					this.blockDepth--;
				}
				break;
			}

			case "ForStatement":
				// For loops create a new scope and define the iterator variable
				this.symbolTable.enterScope();
				this.blockDepth++;

				// Add the iterator variable to the scope (always int type)
				if ("iterator" in statement) {
					this.symbolTable.define({
						name: statement.iterator,
						type: "int",
						line: statement.line,
						column: statement.column,
						used: false,
						kind: "variable",
						declaredWith: null,
					});
				}

				// Validate range expressions
				if ("from" in statement) {
					this.validateExpression(statement.from, version);
				}
				if ("to" in statement) {
					this.validateExpression(statement.to, version);
				}

				// Collect declarations first
				for (const stmt of statement.body) {
					this.collectDeclarations(stmt, version);
				}
				// Then validate
				for (const stmt of statement.body) {
					this.validateStatement(stmt, version);
				}

				this.symbolTable.exitScope();
				this.blockDepth--;
				break;

			case "WhileStatement":
				if ("condition" in statement) {
					this.validateExpression(statement.condition, version);
				}
				this.symbolTable.enterScope();
				this.blockDepth++;
				for (const stmt of statement.body) {
					this.validateStatement(stmt, version);
				}
				this.symbolTable.exitScope();
				this.blockDepth--;
				break;

			case "ReturnStatement":
				this.validateExpression(statement.value, version);
				break;

			case "AssignmentStatement": {
				this.validateExpression(statement.target, version);
				this.validateExpression(statement.value, version);

				// Check type compatibility
				const targetType = this.inferExpressionType(statement.target, version);
				const valueType = this.inferExpressionType(statement.value, version);
				if (targetType !== "unknown" && valueType !== "unknown") {
					if (!TypeChecker.isAssignable(valueType, targetType)) {
						// Check if this is a type promotion case (simple -> series)
						// In Pine Script, simple types can be promoted to series types
						if (this.canPromoteType(targetType, valueType)) {
							// Promote variable type in symbol table
							if (statement.target.type === "Identifier") {
								const varSymbol = this.symbolTable.lookupLocal(
									statement.target.name,
								);
								if (varSymbol) {
									varSymbol.type = valueType;
									this.symbolTable.update(varSymbol);
								}
							}
						} else {
							this.addError(
								statement.line,
								statement.column,
								1, // length of operator
								`Cannot assign ${valueType} to ${targetType}`,
								DiagnosticSeverity.Error,
							);
						}
					}
				}
				break;
			}
		}
	}

	private validateExpression(expr: Expression, version: string = "6"): void {
		switch (expr.type) {
			case "Identifier":
				this.validateIdentifier(expr);
				break;

			case "CallExpression":
				this.validateCallExpression(expr, version);
				break;

			case "MemberExpression":
				this.validateExpression(expr.object, version);
				break;

			case "BinaryExpression":
				this.validateExpression(expr.left, version);
				this.validateExpression(expr.right, version);
				this.validateBinaryExpression(expr, version);
				break;

			case "UnaryExpression":
				this.validateExpression(expr.argument, version);
				break;

			case "TernaryExpression":
				this.validateExpression(expr.condition, version);
				this.validateExpression(expr.consequent, version);
				this.validateExpression(expr.alternate, version);
				break;

			case "ArrayExpression":
				for (const el of expr.elements) {
					this.validateExpression(el, version);
				}
				break;

			case "IndexExpression":
				this.validateExpression(expr.object, version);
				this.validateExpression(expr.index, version);
				break;

			case "SwitchExpression": {
				// Validate all cases in the switch expression
				const switchExpr = expr as SwitchExpression;
				// Validate discriminant if present (e.g., "switch pos")
				if (switchExpr.discriminant) {
					this.validateExpression(switchExpr.discriminant, version);
				}
				for (const switchCase of switchExpr.cases) {
					if (switchCase.condition) {
						this.validateExpression(switchCase.condition, version);
					}
					this.validateExpression(switchCase.result, version);
				}
				break;
			}
		}
	}

	private validateIdentifier(identifier: Identifier): void {
		const symbol = this.symbolTable.lookup(identifier.name);

		if (!symbol) {
			// Check if it's a namespace member access (we'll handle this in member expression)
			if (identifier.name.includes(".")) {
				return;
			}

			// RE-ENABLED: Fixed function parameter scope tracking
			// Function parameters are now properly registered in the symbol table
			// during both collectDeclarations and validateStatement phases
			const similar = this.symbolTable.findSimilarSymbols(identifier.name, 2);
			let message = `Undefined variable '${identifier.name}'`;
			if (similar.length > 0) {
				message += `. Did you mean '${similar[0]}'?`;
			}
			this.addError(
				identifier.line,
				identifier.column,
				identifier.name.length,
				message,
				DiagnosticSeverity.Error,
			);
			return;
		}

		// Mark as used
		this.symbolTable.markUsed(identifier.name);
	}

	private validateBinaryExpression(
		expr: BinaryExpression,
		version: string = "6",
	): void {
		const leftType = this.inferExpressionType(expr.left, version);
		const rightType = this.inferExpressionType(expr.right, version);

		if (!TypeChecker.areTypesCompatible(leftType, rightType, expr.operator)) {
			this.addError(
				expr.line,
				expr.column,
				1,
				`Type mismatch: cannot apply '${expr.operator}' to ${leftType} and ${rightType}`,
				DiagnosticSeverity.Error,
			);
		}
	}

	private validateCallExpression(
		call: CallExpression,
		version: string = "6",
	): void {
		// Get function name
		let functionName = "";
		if (call.callee.type === "Identifier") {
			functionName = call.callee.name;
		} else if (call.callee.type === "MemberExpression") {
			const member = call.callee;
			if (member.object.type === "Identifier") {
				functionName = `${member.object.name}.${member.property.name}`;
			}
		}

		if (!functionName) return;

		// Get function signature
		const signature = this.functionSignatures.get(functionName);

		// Check for top-level only functions in local scope
		if (this.topLevelOnlyFunctions.has(functionName) && this.blockDepth > 0) {
			this.addError(
				call.line,
				call.column,
				functionName.length,
				`Function '${functionName}' cannot be called from a local scope. It must be called from the global scope.`,
				DiagnosticSeverity.Error,
			);
		}

		if (!signature) {
			// Unknown function - could be user-defined
			return;
		}

		// Validate arguments
		this.validateFunctionArguments(call, functionName, signature, version);

		// Validate argument expressions
		for (const arg of call.arguments) {
			this.validateExpression(arg.value, version);
		}
	}

	private validateFunctionArguments(
		call: CallExpression,
		functionName: string,
		signature: FunctionSignature,
		version: string = "6",
	): void {
		const args = call.arguments;

		// Build map of provided arguments
		const providedArgs = new Map<
			string,
			{ arg: CallArgument; type: PineType }
		>();
		const positionalArgs: { arg: CallArgument; type: PineType }[] = [];

		for (const arg of args) {
			const argType = this.inferExpressionType(arg.value, version);
			if (arg.name) {
				providedArgs.set(arg.name, { arg, type: argType });
			} else {
				positionalArgs.push({ arg, type: argType });
			}
		}

		// Check argument count
		const _requiredCount = signature.parameters.filter(
			(p) => !p.optional,
		).length;
		const totalCount = signature.parameters.length;

		// Check if function is variadic (accepts variable arguments)
		// Functions like math.max(...), math.min(...) have empty parameters array but accept multiple args
		const isVariadic =
			totalCount === 0 &&
			functionName.match(
				/^(math\.(max|min|avg|sum)|array\.(concat|covariance|avg|min|max|sum))/,
			);

		if (!isVariadic && positionalArgs.length > totalCount) {
			this.addError(
				call.line,
				call.column,
				functionName.length,
				`Too many arguments for '${functionName}'. Expected ${totalCount}, got ${positionalArgs.length}`,
				DiagnosticSeverity.Error,
			);
		}

		// For variadic functions, require at least minimum number of arguments
		if (isVariadic) {
			const minArgs = functionName.match(/^math\.(max|min)/) ? 2 : 1;
			if (positionalArgs.length < minArgs) {
				this.addError(
					call.line,
					call.column,
					functionName.length,
					`'${functionName}' requires at least ${minArgs} argument${minArgs > 1 ? "s" : ""}, got ${positionalArgs.length}`,
					DiagnosticSeverity.Error,
				);
			}
			return; // Skip further parameter validation for variadic functions
		}

		// Validate each parameter
		for (let i = 0; i < signature.parameters.length; i++) {
			const param = signature.parameters[i];

			// Check named argument
			const namedArg = providedArgs.get(param.name);
			if (namedArg) {
				// Validate type
				if (param.type && param.type !== "unknown") {
					if (!TypeChecker.isAssignable(namedArg.type, param.type)) {
						this.addError(
							call.line,
							call.column,
							param.name.length,
							`Type mismatch for parameter '${param.name}': expected ${param.type}, got ${namedArg.type}`,
							DiagnosticSeverity.Error,
						);
					}
				}
				continue;
			}

			// Check positional argument
			if (i < positionalArgs.length) {
				const posArg = positionalArgs[i];
				if (param.type && param.type !== "unknown") {
					if (!TypeChecker.isAssignable(posArg.type, param.type)) {
						this.addError(
							call.line,
							call.column,
							functionName.length,
							`Type mismatch for argument ${i + 1}: expected ${param.type}, got ${posArg.type}`,
							DiagnosticSeverity.Error,
						);
					}
				}
				continue;
			}

			// Parameter not provided
			if (!param.optional) {
				this.addError(
					call.line,
					call.column,
					functionName.length,
					`Missing required parameter '${param.name}' for function '${functionName}'`,
					DiagnosticSeverity.Error,
				);
			}
		}

		// Check for invalid named parameters
		for (const [name] of providedArgs.entries()) {
			if (!signature.parameters.some((p) => p.name === name)) {
				const validNames = signature.parameters.map((p) => p.name).join(", ");
				this.addError(
					call.line,
					call.column,
					name.length,
					`Invalid parameter '${name}'. Valid parameters: ${validNames}`,
					DiagnosticSeverity.Error,
				);
			}
		}

		// Special case validations
		this.validateSpecialCases(call, functionName, args);
	}

	private validateSpecialCases(
		call: CallExpression,
		functionName: string,
		args: CallArgument[],
	): void {
		// plotshape: should use "style" not "shape"
		if (functionName === "plotshape" || functionName.endsWith(".plotshape")) {
			for (const arg of args) {
				if (arg.name === "shape") {
					this.addError(
						call.line,
						call.column,
						5,
						'Invalid parameter "shape". Did you mean "style"?',
						DiagnosticSeverity.Error,
					);
				}
			}
		}

		// indicator/strategy: timeframe_gaps without timeframe
		if (functionName === "indicator" || functionName === "strategy") {
			const hasTimeframeGaps = args.some((a) => a.name === "timeframe_gaps");
			const hasTimeframe = args.some((a) => a.name === "timeframe");

			if (hasTimeframeGaps && !hasTimeframe) {
				this.addError(
					call.line,
					call.column,
					functionName.length,
					'"timeframe_gaps" has no effect without a "timeframe" argument',
					DiagnosticSeverity.Warning,
				);
			}
		}
	}

	/**
	 * Infer the return type of a user-defined function from its body.
	 * For arrow functions (single expression), the body contains a single ReturnStatement.
	 * For block functions, we analyze all return statements.
	 *
	 * NOTE: This is called BEFORE we enter the function scope, so we need to
	 * temporarily collect declarations from the body to resolve local variables.
	 */
	private inferFunctionReturnType(
		body: Statement[],
		version: string,
		params?: import("./ast").FunctionParam[],
	): PineType {
		// Enter a temporary scope for type inference
		this.symbolTable.enterScope();

		// Add function parameters to temporary scope
		if (params) {
			for (const param of params) {
				// Use a generic type for parameters during inference
				this.symbolTable.define({
					name: param.name,
					type: "series<float>", // Default assumption for UDF params
					line: 0,
					column: 0,
					used: false,
					kind: "variable",
					declaredWith: null,
				});
			}
		}

		// Temporarily collect declarations from function body
		for (const stmt of body) {
			this.collectDeclarations(stmt, version);
		}

		let returnType: PineType = "unknown";

		// Look for return statements in the function body
		for (const stmt of body) {
			if (stmt.type === "ReturnStatement") {
				// For ReturnStatement, infer type from the returned expression
				const returnStmt = stmt as ReturnStatement;
				returnType = this.inferExpressionType(returnStmt.value, version);
				break;
			}
		}

		// If no explicit return, check if the last statement is an expression
		if (returnType === "unknown" && body.length > 0) {
			const lastStmt = body[body.length - 1];
			if (lastStmt.type === "ExpressionStatement") {
				const exprStmt = lastStmt as ExpressionStatement;
				returnType = this.inferExpressionType(exprStmt.expression, version);
			}
		}

		// Exit the temporary scope
		this.symbolTable.exitScope();

		return returnType;
	}

	private mapReturnTypeToPineType(returnTypeStr: string): PineType {
		// Map common return type strings from function signatures to PineType
		const typeMap: Record<string, PineType> = {
			int: "int",
			float: "float",
			bool: "bool",
			string: "string",
			color: "color",
			"series float": "series<float>",
			"series int": "series<int>",
			"series bool": "series<bool>",
			"series string": "series<string>",
			"series color": "series<color>",
			"const int": "int",
			"const float": "float",
			"const bool": "bool",
			"const string": "string",
			"simple int": "int",
			"simple float": "float",
			"simple bool": "bool",
			"simple string": "string",
			// Input types (from input.* functions)
			"input int": "int",
			"input float": "float",
			"input bool": "bool",
			"input string": "string",
			"input color": "color",
		};

		return typeMap[returnTypeStr.toLowerCase()] || "unknown";
	}

	private inferExpressionType(
		expr: Expression,
		version: string = "6",
	): PineType {
		// Check cache
		if (this.expressionTypes.has(expr)) {
			const cached = this.expressionTypes.get(expr);
			if (cached) return cached;
		}

		let type: PineType = "unknown";

		switch (expr.type) {
			case "Literal":
				type = TypeChecker.inferLiteralType((expr as Literal).value);
				break;

			case "Identifier": {
				const symbol = this.symbolTable.lookup((expr as Identifier).name);
				type = symbol ? symbol.type : "unknown";
				break;
			}

			case "CallExpression": {
				const callExpr = expr as CallExpression;
				let funcName = "";
				if (callExpr.callee.type === "Identifier") {
					funcName = callExpr.callee.name;
				} else if (callExpr.callee.type === "MemberExpression") {
					const member = callExpr.callee;
					if (member.object.type === "Identifier") {
						funcName = `${member.object.name}.${member.property.name}`;
					}
				}

				// Special handling for request.security with non-tuple returns
				// When 3rd argument is not an array, the return type matches the expression type
				// e.g., request.security(sym, tf, ta.atr(14)) returns series<float>
				if (funcName === "request.security" && callExpr.arguments.length >= 3) {
					const exprArg = callExpr.arguments[2].value;
					// Only handle non-array cases (array cases are handled in tuple destructuring)
					if (exprArg.type !== "ArrayExpression") {
						type = this.inferExpressionType(exprArg, version);
						break;
					}
				}

				// First check function signatures for built-ins
				// (These have accurate return type information)
				const signature = this.functionSignatures.get(funcName);
				if (signature?.returns) {
					// Map the return type string to PineType
					type = this.mapReturnTypeToPineType(signature.returns);
					break;
				}

				// Check if it's a user-defined function with registered return type
				const udfSymbol = this.symbolTable.lookup(funcName);
				if (udfSymbol && udfSymbol.kind === "function" && udfSymbol.type !== "unknown") {
					type = udfSymbol.type;
					break;
				}

				// Fallback to TypeChecker for common built-ins
				const argTypes = callExpr.arguments.map((arg) =>
					this.inferExpressionType(arg.value, version),
				);
				type = TypeChecker.getBuiltinReturnType(funcName, argTypes);
				break;
			}

			case "BinaryExpression": {
				const binaryExpr = expr as BinaryExpression;
				const leftType = this.inferExpressionType(binaryExpr.left, version);
				const rightType = this.inferExpressionType(binaryExpr.right, version);
				type = TypeChecker.getBinaryOpType(
					leftType,
					rightType,
					binaryExpr.operator,
				);
				break;
			}

			case "UnaryExpression": {
				const unaryExpr = expr as UnaryExpression;
				// 'not' operator always returns bool
				if (unaryExpr.operator === "not") {
					type = "bool";
				} else if (unaryExpr.operator === "-") {
					// Unary minus preserves numeric type
					type = this.inferExpressionType(unaryExpr.argument, version);
				} else {
					type = this.inferExpressionType(unaryExpr.argument, version);
				}
				break;
			}

			case "TernaryExpression": {
				// Phase C - Session 5: Enhanced ternary expression type inference
				const ternaryExpr = expr as TernaryExpression;
				const conseqType = this.inferExpressionType(
					ternaryExpr.consequent,
					version,
				);
				const altType = this.inferExpressionType(
					ternaryExpr.alternate,
					version,
				);

				// If both unknown, return unknown
				if (conseqType === "unknown" && altType === "unknown") {
					type = "unknown";
					break;
				}

				// If one is unknown, try to use the known type
				if (conseqType === "unknown" && altType !== "unknown") {
					type = altType;
					break;
				}
				if (altType === "unknown" && conseqType !== "unknown") {
					type = conseqType;
					break;
				}

				// Handle na ? na : value pattern - common in Pine Script
				if (conseqType === "na") {
					type = altType;
				} else if (altType === "na") {
					type = conseqType;
				} else if (TypeChecker.isAssignable(conseqType, altType)) {
					type = conseqType;
				} else if (TypeChecker.isAssignable(altType, conseqType)) {
					type = altType;
				} else if (
					TypeChecker.isNumericType(conseqType) &&
					TypeChecker.isNumericType(altType)
				) {
					// Both numeric - use wider type
					if (conseqType.includes("float") || altType.includes("float")) {
						type =
							conseqType.startsWith("series") || altType.startsWith("series")
								? "series<float>"
								: "float";
					} else {
						type =
							conseqType.startsWith("series") || altType.startsWith("series")
								? "series<int>"
								: "int";
					}
				} else {
					// Keep unknown only if truly incompatible
					type = "unknown";
				}
				break;
			}

			case "IndexExpression": {
				// Phase B - Session 5: Infer type from array/series element access
				const indexExpr = expr as IndexExpression;
				const arrayType = this.inferExpressionType(indexExpr.object, version);

				// Handle series<T>[index] → T
				const seriesMatch = arrayType.match(/^series<(.+)>$/);
				if (seriesMatch) {
					type = seriesMatch[1] as PineType; // Return inner type (e.g., series<float> → float)
					break;
				}

				// Handle array<T>[index] → T
				const arrayMatch = arrayType.match(/^array<(.+)>$/);
				if (arrayMatch) {
					type = arrayMatch[1] as PineType; // Return element type
					break;
				}

				// For unknown array type, return unknown
				// For known non-array/series type, assume it's indexable and return same type
				type = arrayType === "unknown" ? "unknown" : arrayType;
				break;
			}

			case "SwitchExpression": {
				// Infer type from the first case result (all cases should return same type)
				const switchExpr = expr as SwitchExpression;
				if (switchExpr.cases.length > 0) {
					type = this.inferExpressionType(switchExpr.cases[0].result, version);
				}
				break;
			}

			case "MemberExpression": {
				// Phase D - Session 5: Check for namespace properties first
				// Session 9: Add deprecation warnings and unknown property detection
				const memberExpr = expr as MemberExpression;

				// Try to get namespace.property full name
				if (
					memberExpr.object?.type === "Identifier" &&
					memberExpr.property?.type === "Identifier"
				) {
					const propertyName = `${memberExpr.object.name}.${memberExpr.property.name}`;
					const namespaceName = memberExpr.object.name;

					// Session 9: Check for deprecated v5 constants (only warn in v6)
					if (version === "6" && propertyName in this.deprecatedV5Constants) {
						const replacement = this.deprecatedV5Constants[propertyName];
						this.addError(
							memberExpr.line || 0,
							memberExpr.column || 0,
							propertyName.length,
							`Deprecated Pine Script v5 constant '${propertyName}'. Use '${replacement}' instead.`,
							DiagnosticSeverity.Warning,
						);
						// Still infer type as string (it might work, but warn user)
						type = "string";
						break;
					}

					// Check if it's a known namespace property (all versions)
					if (propertyName in this.namespaceProperties) {
						type = this.namespaceProperties[propertyName];
						break;
					}

					// Session 9: Check if namespace exists but property doesn't (v6 only)
					if (version === "6") {
						const knownNamespaces = [
							"plot",
							"color",
							"shape",
							"size",
							"location",
							"barstate",
							"timeframe",
							"syminfo",
							"chart",
							"position",
							"scale",
							"display",
							"format",
							"xloc",
							"yloc",
							"input", // v4/v5 input namespace for backward compatibility
						];
						if (knownNamespaces.includes(namespaceName)) {
							// Known namespace but unknown property - likely an error
							this.addError(
								memberExpr.line || 0,
								memberExpr.column || 0,
								propertyName.length,
								`Unknown property '${memberExpr.property.name}' on namespace '${namespaceName}'`,
								DiagnosticSeverity.Error,
							);
						}
					}
				}

				// For namespace.function calls, return unknown (will be resolved in call expression)
				type = "unknown";
				break;
			}
		}

		this.expressionTypes.set(expr, type);
		return type;
	}

	private checkUnusedVariables(): void {
		const unused = this.symbolTable.getAllUnusedSymbols();
		for (const symbol of unused) {
			this.addError(
				symbol.line,
				symbol.column,
				symbol.name.length,
				`Variable '${symbol.name}' is declared but never used`,
				DiagnosticSeverity.Warning,
			);
		}
	}

	private canPromoteType(from: PineType, to: PineType): boolean {
		// In Pine Script, simple types can be promoted to series types
		// but not the other way around

		// float -> series<float>
		if (from === "float" && to === "series<float>") return true;
		// int -> series<int>
		if (from === "int" && to === "series<int>") return true;
		// bool -> series<bool>
		if (from === "bool" && to === "series<bool>") return true;
		// string -> series<string>
		if (from === "string" && to === "series<string>") return true;
		// color -> series<color>
		if (from === "color" && to === "series<color>") return true;

		// int -> float (numeric promotion)
		if (from === "int" && to === "float") return true;
		// int -> series<float> (int to series<float> promotion)
		if (from === "int" && to === "series<float>") return true;
		// series<int> -> series<float> (series int to series float promotion)
		if (from === "series<int>" && to === "series<float>") return true;

		return false;
	}

	private addError(
		line: number,
		column: number,
		length: number,
		message: string,
		severity: DiagnosticSeverity,
	): void {
		this.errors.push({ line, column, length, message, severity });
	}
}
