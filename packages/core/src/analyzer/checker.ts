// Pine Script Type Checker and Validator
// Performs semantic analysis and type checking on the AST

import type {
	ArrayExpression,
	BinaryExpression,
	CallArgument,
	CallExpression,
	Expression,
	ExpressionStatement,
	FunctionParam,
	Identifier,
	ImportStatement,
	IndexExpression,
	Literal,
	MemberExpression,
	MethodDeclaration,
	Program,
	ReturnStatement,
	Statement,
	SwitchExpression,
	TernaryExpression,
	TupleDeclaration,
	UnaryExpression,
} from "../parser/ast";
import { type Symbol as SymbolInfo, SymbolTable } from "./symbols";
import { type PineType, TypeChecker } from "./types";
import {
	type ValidationError,
	DiagnosticSeverity,
} from "../common/errors";
import {
	type FunctionSignature,
	TOP_LEVEL_ONLY_FUNCTIONS,
	DEPRECATED_V5_CONSTANTS,
	NAMESPACE_PROPERTIES,
	KNOWN_NAMESPACES,
	buildFunctionSignatures,
	mapToPineType,
	mapReturnTypeToPineType,
	isVariadicFunction,
	getMinArgsForVariadic,
	getPolymorphicReturnType,
	getPolymorphicType,
	getFunctionBehavior,
	hasOverloads,
	type ArgumentInfo,
} from "./builtins";

// Re-export for backward compatibility
export { DiagnosticSeverity, type ValidationError } from "../common/errors";

export class UnifiedPineValidator {
	private errors: ValidationError[] = [];
	private symbolTable: SymbolTable;
	private functionSignatures: Map<string, FunctionSignature>;
	private expressionTypes: Map<Expression, PineType> = new Map();
	private blockDepth: number = 0;

	constructor() {
		this.symbolTable = new SymbolTable();
		this.functionSignatures = buildFunctionSignatures();
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
				symbol.type = mapToPineType(statement.typeAnnotation.name);
			} else if (statement.init) {
				const initType = this.inferExpressionType(statement.init, version);
				symbol.type = initType;
			}

			this.symbolTable.define(symbol);
		} else if (statement.type === "TupleDeclaration") {
			// Handle tuple destructuring: [a, b, c] = expr
			const tupleDecl = statement as TupleDeclaration;

			// Try to infer types from the init expression
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
		} else if (statement.type === "MethodDeclaration") {
			// Handle method declarations like function declarations
			for (const stmt of statement.body) {
				this.collectDeclarations(stmt, version);
			}
		} else if (statement.type === "ImportStatement") {
			// Register import alias as a namespace/variable
			if (statement.alias) {
				const symbol: SymbolInfo = {
					name: statement.alias,
					type: "unknown", // Library type
					line: statement.line,
					column: statement.column,
					used: false,
					kind: "variable", // Treat as namespace
					declaredWith: null,
				};
				this.symbolTable.define(symbol);
			}
		}
	}

	private validateStatement(statement: Statement, version: string = "6"): void {
		const _prevBlockDepth = this.blockDepth;
		switch (statement.type) {
			case "VariableDeclaration": {
				// First, register the variable in the symbol table
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
					symbol.type = mapToPineType(statement.typeAnnotation.name);
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
				let returnType: PineType = "unknown";

				if (statement.returnType) {
					// Use explicit return type annotation if present
					returnType = mapToPineType(statement.returnType.name);
				} else {
					// Infer return type from function body
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
				for (let i = 0; i < statement.params.length; i++) {
					const param = statement.params[i];
					let paramType: PineType = "unknown";

					// Use explicit type annotation if present
					if (param.typeAnnotation) {
						paramType = mapToPineType(param.typeAnnotation.name);
					}
					// Otherwise infer parameter type based on name and position
					else if (i === 0) {
						// First parameter is often series data
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
						// Check if this is a type promotion case
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

			case "MethodDeclaration": {
				// Handle method declarations like function declarations
				// First, infer the method return type from the body
				let returnType: PineType = "unknown";

				if (statement.returnType) {
					returnType = mapToPineType(statement.returnType.name);
				} else {
					returnType = this.inferFunctionReturnType(
						statement.body,
						version,
						statement.params,
					);
				}

				// Register the method in the symbol table
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

				// Add method parameters to scope with proper type
				for (const param of statement.params) {
					let paramType: PineType = "unknown";
					if (param.typeAnnotation) {
						paramType = mapToPineType(param.typeAnnotation.name);
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

				// Collect and validate method body
				for (const stmt of statement.body) {
					this.collectDeclarations(stmt, version);
				}
				for (const stmt of statement.body) {
					this.validateStatement(stmt);
				}

				this.symbolTable.exitScope();
				this.blockDepth--;
				break;
			}

			case "ImportStatement": {
				// Import statements don't need validation beyond registering the alias
				// (already done in collectDeclarations)
				break;
			}

			case "SequenceStatement": {
				// Validate each statement in the sequence
				for (const stmt of statement.statements) {
					this.validateStatement(stmt, version);
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
			// Check if it's a namespace member access
			if (identifier.name.includes(".")) {
				return;
			}

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
		if (TOP_LEVEL_ONLY_FUNCTIONS.has(functionName) && this.blockDepth > 0) {
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

		// Check if function is variadic
		const isVariadic = isVariadicFunction(functionName);

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
			const minArgs = getMinArgsForVariadic(functionName);
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

		// For functions with overloads, skip positional type checking
		// (we can't reliably determine which overload is being used)
		const functionHasOverloads = hasOverloads(functionName);

		// For polymorphic functions, skip parameter type checking
		// (the function signature shows one type but accepts multiple)
		const functionIsPolymorphic = getPolymorphicType(functionName) !== undefined ||
			getFunctionBehavior(functionName)?.polymorphic !== undefined;

		// Validate each parameter
		for (let i = 0; i < signature.parameters.length; i++) {
			const param = signature.parameters[i];

			// Check named argument
			const namedArg = providedArgs.get(param.name);
			if (namedArg) {
				// Skip type validation for polymorphic functions (type depends on input)
				if (functionIsPolymorphic) {
					continue;
				}
				// Validate type (named args are unambiguous, so we can check them)
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

			// Check positional argument (skip for overloaded/polymorphic functions)
			if (i < positionalArgs.length) {
				// Skip type checking for overloaded/polymorphic functions
				if (functionHasOverloads || functionIsPolymorphic) {
					continue;
				}
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

			// Parameter not provided - skip for overloaded functions
			// (alternative overloads may not require this parameter)
			if (!param.optional && !functionHasOverloads) {
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
	 */
	private inferFunctionReturnType(
		body: Statement[],
		version: string,
		params?: FunctionParam[],
	): PineType {
		// Enter a temporary scope for type inference
		this.symbolTable.enterScope();

		// Add function parameters to temporary scope
		if (params) {
			for (const param of params) {
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

				// DEBUG: trace na calls
				const DEBUG_NA = false;
				if (DEBUG_NA && funcName === "na") {
					const sig = this.functionSignatures.get("na");
					console.log(`DEBUG na call at line ${expr.line}: sig=${JSON.stringify(sig)}, sig.returns=${sig?.returns}`);
				}

				// Handle generic type arguments: array.new<float>() -> array<float>
				if (callExpr.typeArguments && callExpr.typeArguments.length > 0) {
					const typeArg = callExpr.typeArguments[0];
					// array.new<T> returns array<T>, matrix.new<T> returns matrix<T>
					if (funcName === "array.new" || funcName.startsWith("array.new")) {
						type = `array<${typeArg}>` as PineType;
						break;
					}
					if (funcName === "matrix.new" || funcName.startsWith("matrix.new")) {
						type = `matrix<${typeArg}>` as PineType;
						break;
					}
					if (funcName === "map.new") {
						// map.new<K, V> would need two type args
						type = `map<${typeArg}>` as PineType;
						break;
					}
				}

				// Special handling for request.security with non-tuple returns
				if (funcName === "request.security" && callExpr.arguments.length >= 3) {
					const exprArg = callExpr.arguments[2].value;
					if (exprArg.type !== "ArrayExpression") {
						type = this.inferExpressionType(exprArg, version);
						break;
					}
				}

				// First check if this is a polymorphic function
				// Build argument info with names for data-driven polymorphism
				const argInfos: ArgumentInfo[] = callExpr.arguments.map((arg) => ({
					name: arg.name,
					type: this.inferExpressionType(arg.value, version),
				}));
				const argTypes = argInfos.map((info) => info.type);
				const polyReturnType = getPolymorphicReturnType(funcName, argTypes, argInfos);
				if (polyReturnType) {
					type = polyReturnType;
					break;
				}

				// Then check function signatures for built-ins
				const signature = this.functionSignatures.get(funcName);
				if (signature?.returns) {
					type = mapReturnTypeToPineType(signature.returns);
					break;
				}

				// Check if it's a user-defined function with registered return type
				const udfSymbol = this.symbolTable.lookup(funcName);
				if (udfSymbol && udfSymbol.kind === "function" && udfSymbol.type !== "unknown") {
					type = udfSymbol.type;
					break;
				}

				// Fallback to TypeChecker for common built-ins
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
				if (unaryExpr.operator === "not") {
					type = "bool";
				} else if (unaryExpr.operator === "-") {
					type = this.inferExpressionType(unaryExpr.argument, version);
				} else {
					type = this.inferExpressionType(unaryExpr.argument, version);
				}
				break;
			}

			case "TernaryExpression": {
				const ternaryExpr = expr as TernaryExpression;
				const conseqType = this.inferExpressionType(
					ternaryExpr.consequent,
					version,
				);
				const altType = this.inferExpressionType(
					ternaryExpr.alternate,
					version,
				);

				if (conseqType === "unknown" && altType === "unknown") {
					type = "unknown";
					break;
				}

				if (conseqType === "unknown" && altType !== "unknown") {
					type = altType;
					break;
				}
				if (altType === "unknown" && conseqType !== "unknown") {
					type = conseqType;
					break;
				}

				// Handle na ? na : value pattern
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
					type = "unknown";
				}
				break;
			}

			case "IndexExpression": {
				const indexExpr = expr as IndexExpression;
				const arrayType = this.inferExpressionType(indexExpr.object, version);

				// Handle series<T>[index] → T
				const seriesMatch = arrayType.match(/^series<(.+)>$/);
				if (seriesMatch) {
					type = seriesMatch[1] as PineType;
					break;
				}

				// Handle array<T>[index] → T
				const arrayMatch = arrayType.match(/^array<(.+)>$/);
				if (arrayMatch) {
					type = arrayMatch[1] as PineType;
					break;
				}

				type = arrayType === "unknown" ? "unknown" : arrayType;
				break;
			}

			case "SwitchExpression": {
				const switchExpr = expr as SwitchExpression;
				if (switchExpr.cases.length > 0) {
					type = this.inferExpressionType(switchExpr.cases[0].result, version);
				}
				break;
			}

			case "MemberExpression": {
				const memberExpr = expr as MemberExpression;

				// Try to get namespace.property full name
				if (
					memberExpr.object?.type === "Identifier" &&
					memberExpr.property?.type === "Identifier"
				) {
					const propertyName = `${memberExpr.object.name}.${memberExpr.property.name}`;
					const namespaceName = memberExpr.object.name;

					// Check for deprecated v5 constants (only warn in v6)
					if (version === "6" && propertyName in DEPRECATED_V5_CONSTANTS) {
						const replacement = DEPRECATED_V5_CONSTANTS[propertyName];
						this.addError(
							memberExpr.line || 0,
							memberExpr.column || 0,
							propertyName.length,
							`Deprecated Pine Script v5 constant '${propertyName}'. Use '${replacement}' instead.`,
							DiagnosticSeverity.Warning,
						);
						type = "string";
						break;
					}

					// Check if it's a known namespace property
					if (propertyName in NAMESPACE_PROPERTIES) {
						type = NAMESPACE_PROPERTIES[propertyName];
						break;
					}

					// Check if namespace exists but property doesn't (v6 only)
					if (version === "6") {
						if (KNOWN_NAMESPACES.includes(namespaceName)) {
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
		if (from === "float" && to === "series<float>") return true;
		if (from === "int" && to === "series<int>") return true;
		if (from === "bool" && to === "series<bool>") return true;
		if (from === "string" && to === "series<string>") return true;
		if (from === "color" && to === "series<color>") return true;

		// int -> float (numeric promotion)
		if (from === "int" && to === "float") return true;
		if (from === "int" && to === "series<float>") return true;
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
