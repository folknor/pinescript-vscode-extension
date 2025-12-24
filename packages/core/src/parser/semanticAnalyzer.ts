// Semantic Analyzer for Pine Script - Detects code quality issues and best practices violations

import { FUNCTIONS_BY_NAME } from "../../../../pine-data/v6";
import { DiagnosticSeverity } from "../common/errors";
import type {
	AssignmentStatement,
	BinaryExpression,
	CallExpression,
	Expression,
	ForStatement,
	FunctionDeclaration,
	IfStatement,
	MemberExpression,
	Program,
	Statement,
	TernaryExpression,
	VariableDeclaration,
	WhileStatement,
} from "./ast";

export interface SemanticWarning {
	line: number;
	column: number;
	length: number;
	message: string;
	severity: DiagnosticSeverity;
	rule: string;
}

export class SemanticAnalyzer {
	private warnings: SemanticWarning[] = [];
	private inConditionalScope: boolean = false;
	private conditionalScopeDepth: number = 0;
	private declaredVariables: Set<string> = new Set();
	private usedVariables: Set<string> = new Set();

	analyze(ast: Program): SemanticWarning[] {
		this.warnings = [];
		this.inConditionalScope = false;
		this.conditionalScopeDepth = 0;
		this.declaredVariables.clear();
		this.usedVariables.clear();

		// First pass: collect all variable declarations
		this.collectVariableDeclarations(ast);

		// Second pass: analyze statements and track usage
		for (const statement of ast.body) {
			this.analyzeStatement(statement);
		}

		// Third pass: check for unused variables
		this.checkUnusedVariables();

		return this.warnings;
	}

	private analyzeStatement(statement: Statement): void {
		switch (statement.type) {
			case "VariableDeclaration":
				this.analyzeVariableDeclaration(statement);
				break;

			case "ExpressionStatement":
				this.analyzeExpression(statement.expression);
				break;

			case "FunctionDeclaration":
				this.analyzeFunctionDeclaration(statement);
				break;

			case "IfStatement":
				this.analyzeIfStatement(statement);
				break;

			case "ForStatement":
				this.analyzeForStatement(statement);
				break;

			case "WhileStatement":
				this.analyzeWhileStatement(statement);
				break;

			case "AssignmentStatement":
				this.analyzeAssignmentStatement(statement);
				break;

			case "ReturnStatement":
				this.analyzeExpression(statement.value);
				break;
		}
	}

	private analyzeVariableDeclaration(declaration: VariableDeclaration): void {
		// Check for unused variables will be handled at the symbol table level
		// Just analyze the initialization expression
		if (declaration.init) {
			this.analyzeExpression(declaration.init);
		}
	}

	private analyzeFunctionDeclaration(declaration: FunctionDeclaration): void {
		// Analyze function body
		for (const statement of declaration.body) {
			this.analyzeStatement(statement);
		}
	}

	private analyzeIfStatement(statement: IfStatement): void {
		// Enter conditional scope
		this.enterConditionalScope();

		// Analyze condition
		this.analyzeExpression(statement.condition);

		// Analyze consequent (then block)
		for (const stmt of statement.consequent) {
			this.analyzeStatement(stmt);
		}

		// Exit conditional scope for consequent
		this.exitConditionalScope();

		// Analyze alternate (else block) if present
		if (statement.alternate) {
			this.enterConditionalScope();
			for (const stmt of statement.alternate) {
				this.analyzeStatement(stmt);
			}
			this.exitConditionalScope();
		}
	}

	private analyzeForStatement(statement: ForStatement): void {
		// Enter conditional scope
		this.enterConditionalScope();

		// Analyze range expressions
		if ("from" in statement) {
			this.analyzeExpression(statement.from);
		}
		if ("to" in statement) {
			this.analyzeExpression(statement.to);
		}

		// Analyze loop body
		for (const stmt of statement.body) {
			this.analyzeStatement(stmt);
		}

		// Exit conditional scope
		this.exitConditionalScope();
	}

	private analyzeWhileStatement(statement: WhileStatement): void {
		// Enter conditional scope
		this.enterConditionalScope();

		// Analyze condition
		if ("condition" in statement) {
			this.analyzeExpression(statement.condition);
		}

		// Analyze loop body
		for (const stmt of statement.body) {
			this.analyzeStatement(stmt);
		}

		// Exit conditional scope
		this.exitConditionalScope();
	}

	private analyzeAssignmentStatement(statement: AssignmentStatement): void {
		// Check for conditional reassignment
		if (this.inConditionalScope) {
			this.checkConditionalReassignment(statement);
		}

		// Analyze target and value expressions
		this.analyzeExpression(statement.target);
		this.analyzeExpression(statement.value);
	}

	private analyzeExpression(expr: Expression): void {
		switch (expr.type) {
			case "CallExpression":
				this.analyzeCallExpression(expr);
				break;

			case "MemberExpression":
				this.analyzeMemberExpression(expr);
				break;

			case "BinaryExpression":
				this.analyzeBinaryExpression(expr);
				break;

			case "UnaryExpression":
				this.analyzeExpression(expr.argument);
				break;

			case "TernaryExpression":
				this.analyzeTernaryExpression(expr);
				break;

			case "ArrayExpression":
				for (const element of expr.elements) {
					this.analyzeExpression(element);
				}
				break;

			case "IndexExpression":
				this.analyzeExpression(expr.object);
				this.analyzeExpression(expr.index);
				break;

			case "Identifier":
				// Track variable usage
				this.usedVariables.add(expr.name);
				break;
			case "Literal":
				// No further analysis needed for literals
				break;
		}
	}

	private analyzeCallExpression(call: CallExpression): void {
		// Check for series functions called conditionally
		if (this.inConditionalScope) {
			this.checkConditionalSeriesCall(call);
		}

		// Analyze callee first
		this.analyzeExpression(call.callee);

		// Then analyze arguments (this will catch nested calls like ta.sma inside array.set)
		for (const arg of call.arguments) {
			this.analyzeExpression(arg.value);
		}
	}

	private analyzeMemberExpression(expr: MemberExpression): void {
		this.analyzeExpression(expr.object);
	}

	private analyzeBinaryExpression(expr: BinaryExpression): void {
		this.analyzeExpression(expr.left);
		this.analyzeExpression(expr.right);
	}

	private analyzeTernaryExpression(expr: TernaryExpression): void {
		this.analyzeExpression(expr.condition);
		this.analyzeExpression(expr.consequent);
		this.analyzeExpression(expr.alternate);
	}

	private enterConditionalScope(): void {
		this.conditionalScopeDepth++;
		this.inConditionalScope = true;
	}

	private exitConditionalScope(): void {
		this.conditionalScopeDepth--;
		if (this.conditionalScopeDepth === 0) {
			this.inConditionalScope = false;
		}
	}

	private checkConditionalSeriesCall(call: CallExpression): void {
		let functionName = "";

		if (call.callee.type === "Identifier") {
			functionName = call.callee.name;
		} else if (call.callee.type === "MemberExpression") {
			const member = call.callee;
			if (member.object.type === "Identifier") {
				functionName = `${member.object.name}.${member.property.name}`;
			}
		}

		// Check if this is a series function that should not be called conditionally
		if (this.isSeriesFunction(functionName)) {
			this.addWarning(
				call.line,
				call.column,
				functionName.length,
				`The function '${functionName}' should be called on each calculation for consistency. It is recommended to extract the call from this scope`,
				DiagnosticSeverity.Warning,
				"CONDITIONAL_SERIES",
			);
		}
	}

	private checkConditionalReassignment(statement: AssignmentStatement): void {
		// Check if this is a reassignment of a series variable (var :=)
		if (statement.target.type === "Identifier") {
			const targetName = statement.target.name;

			// NOTE: Simplified heuristic - warns on all conditional reassignments.
			// A complete implementation would check the symbol table to verify:
			// 1. Variable was declared with 'var' (making it a series variable)
			// 2. The reassignment actually affects series coherence
			// Low priority since false positives are acceptable for this lint rule.
			this.addWarning(
				statement.line,
				statement.column,
				1, // length of := operator
				`Reassignment of variable '${targetName}' inside conditional scope may cause series coherence issues`,
				DiagnosticSeverity.Warning,
				"CONDITIONAL_REASSIGNMENT",
			);
		}
	}

	private isSeriesFunction(functionName: string): boolean {
		// Check if function returns a series type using pine-data
		// These functions should not be called conditionally
		const func = FUNCTIONS_BY_NAME.get(functionName);
		if (func?.returns) {
			// Check if return type is series
			if (func.returns.startsWith("series")) {
				return true;
			}
		}

		// Fallback: namespace-based heuristic for functions not in pine-data
		// or for user-defined functions that follow naming conventions
		return (
			functionName.startsWith("ta.") ||
			functionName.startsWith("request.") ||
			functionName.startsWith("str.")
		);
	}

	private collectVariableDeclarations(ast: Program): void {
		for (const statement of ast.body) {
			this.collectDeclarationsInStatement(statement);
		}
	}

	private collectDeclarationsInStatement(statement: Statement): void {
		switch (statement.type) {
			case "VariableDeclaration":
				if (statement.name) {
					this.declaredVariables.add(statement.name);
				}
				break;

			case "FunctionDeclaration":
				// Collect function parameters
				for (const param of statement.params) {
					if (param.name) {
						this.declaredVariables.add(param.name);
					}
				}
				// Recursively collect declarations in function body
				for (const bodyStatement of statement.body) {
					this.collectDeclarationsInStatement(bodyStatement);
				}
				break;

			case "IfStatement":
				// Collect declarations in consequent
				for (const stmt of statement.consequent) {
					this.collectDeclarationsInStatement(stmt);
				}
				// Collect declarations in alternate
				if (statement.alternate) {
					for (const stmt of statement.alternate) {
						this.collectDeclarationsInStatement(stmt);
					}
				}
				break;

			case "ForStatement":
			case "WhileStatement":
				// Collect declarations in loop body
				for (const stmt of statement.body) {
					this.collectDeclarationsInStatement(stmt);
				}
				break;
		}
	}

	private checkUnusedVariables(): void {
		for (const variableName of this.declaredVariables) {
			if (!this.usedVariables.has(variableName)) {
				// Skip common variables that are often used for plotting or external reference
				if (!this.isCommonlyUsedVariable(variableName)) {
					this.addWarning(
						0, // We don't have line info for declarations
						0,
						variableName.length,
						`Variable '${variableName}' is declared but never used`,
						DiagnosticSeverity.Warning,
						"UNUSED_VARIABLE",
					);
				}
			}
		}
	}

	/**
	 * Check if a variable name is commonly used in Pine Script.
	 *
	 * NOTE: This list is intentionally hardcoded (not from pine-data) because:
	 * 1. These are UX heuristics for "unused variable" warnings, not API data
	 * 2. Common variable naming patterns are not in TradingView docs
	 * 3. These reduce noise from false positive "unused" warnings on plot variables
	 *
	 * The list includes common indicator names (ma, rsi, macd), color variables,
	 * boolean flags, and input parameter names that may appear unused but are
	 * actually used by plots or external references.
	 */
	private isCommonlyUsedVariable(name: string): boolean {
		const commonVariables = new Set([
			// Common plot variables
			"ma",
			"sma",
			"ema",
			"wma",
			"rsi",
			"macd",
			"bb",
			"atr",
			"cci",
			"stoch",
			// Common color variables
			"color",
			"col",
			"c",
			"bullish",
			"bearish",
			"up",
			"down",
			"buy",
			"sell",
			// Common boolean variables
			"show",
			"display",
			"plot",
			"draw",
			"enable",
			"disable",
			// Common input variables (might be used externally)
			"src",
			"source",
			"len",
			"length",
			"period",
			"mult",
			"multiplier",
			// Special Pine Script variables
			"close",
			"open",
			"high",
			"low",
			"volume",
			"time",
			"bar_index",
		]);

		return commonVariables.has(name.toLowerCase());
	}

	private addWarning(
		line: number,
		column: number,
		length: number,
		message: string,
		severity: DiagnosticSeverity,
		rule: string,
	): void {
		this.warnings.push({
			line,
			column,
			length,
			message,
			severity,
			rule,
		});
	}
}
