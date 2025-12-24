// Simple Pine Script Parser (focused on function call validation)

import type * as AST from "./ast";
import { Lexer, type LexerError, type Token, TokenType } from "./lexer";

export interface ParserError {
	line: number;
	column: number;
	message: string;
}

export class Parser {
	private tokens: Token[] = [];
	private current: number = 0;
	private parenDepth: number = 0; // Track parenthesis nesting depth
	private lexerErrors: LexerError[] = [];
	private parserErrors: ParserError[] = [];
	private detectedVersion: string | null = null;

	constructor(source: string) {
		const lexer = new Lexer(source);
		this.tokens = lexer
			.tokenize()
			.filter(
				(t) => t.type !== TokenType.WHITESPACE && t.type !== TokenType.COMMENT,
			);
		this.lexerErrors = lexer.getErrors();
		this.detectedVersion = lexer.getDetectedVersion();
	}

	getLexerErrors(): LexerError[] {
		return this.lexerErrors;
	}

	getParserErrors(): ParserError[] {
		return this.parserErrors;
	}

	getDetectedVersion(): string | null {
		return this.detectedVersion;
	}

	parse(): AST.Program {
		const body: AST.Statement[] = [];

		while (!this.isAtEnd()) {
			try {
				const stmt = this.statement();
				if (stmt) body.push(stmt);
			} catch (e) {
				// Collect parser error
				const token = this.peek();
				const errorMsg = e instanceof Error ? e.message : String(e);
				this.parserErrors.push({
					line: token.line,
					column: token.column,
					message: errorMsg,
				});
				// Skip to next statement on error
				this.synchronize();
			}
		}

		return {
			type: "Program",
			body,
			line: 1,
			column: 1,
		};
	}

	private statement(): AST.Statement | null {
		// Skip newlines between statements (but not inside parentheses)
		while (this.check(TokenType.NEWLINE) && this.parenDepth === 0) {
			this.advance();
		}

		// If we've reached EOF after skipping newlines, there's nothing left to parse
		if (this.isAtEnd()) {
			return null;
		}

		// Skip annotations
		if (this.check(TokenType.ANNOTATION)) {
			this.advance();
			return null;
		}

		// Import statement: import User/Library/Version [as alias]
		if (this.match([TokenType.KEYWORD, ["import"]])) {
			return this.importStatement();
		}

		// Export function or method: export funcName(...) => ...
		// Export method: export method methodName(...) => ...
		if (this.match([TokenType.KEYWORD, ["export"]])) {
			return this.exportDeclaration();
		}

		// Method declaration: method methodName(...) => ...
		if (this.match([TokenType.KEYWORD, ["method"]])) {
			return this.methodDeclaration(false);
		}

		// If statement
		if (this.match([TokenType.KEYWORD, ["if"]])) {
			return this.ifStatement();
		}

		// For statement
		if (this.match([TokenType.KEYWORD, ["for"]])) {
			return this.forStatement();
		}

		// While statement
		if (this.match([TokenType.KEYWORD, ["while"]])) {
			return this.whileStatement();
		}

		// Return statement
		if (this.match([TokenType.KEYWORD, ["return"]])) {
			return this.returnStatement();
		}

		// Switch expression (Pine Script v6)
		// switch
		//     condition => expr
		//     => defaultExpr
		if (this.match([TokenType.KEYWORD, ["switch"]])) {
			// Parse switch as an expression statement (it returns a value)
			const switchExpr = this.switchExpression();
			return {
				type: "ExpressionStatement",
				expression: switchExpr,
				line: switchExpr.line,
				column: switchExpr.column,
			};
		}

		// Type or Enum declaration (Pine Script v6)
		if (this.match([TokenType.KEYWORD, ["type", "enum"]])) {
			const kind = this.previous().value;
			const nameToken = this.consume(
				TokenType.IDENTIFIER,
				`Expected ${kind} name`,
			);

			// Skip the body of the type/enum (indented block)
			// We use indentation tracking to skip the block
			const startToken = this.previous();

			// Skip newlines after name
			while (this.check(TokenType.NEWLINE)) {
				this.advance();
			}

			const firstBodyToken = this.peek();
			if (firstBodyToken.line > startToken.line) {
				const bodyIndent = firstBodyToken.indent || 0;
				const baseIndent = startToken.indent || 0;

				if (bodyIndent > baseIndent) {
					while (!this.isAtEnd()) {
						const currentToken = this.peek();
						// Only check indentation for tokens that start a line (have indent defined)
						// Tokens in the middle of a line have indent: undefined
						const isLineStart = currentToken.indent !== undefined;

						if (
							isLineStart &&
							currentToken.line > startToken.line &&
							currentToken.indent! < bodyIndent
						) {
							break;
						}
						this.advance();
					}
				}
			}

			return {
				type: kind === "type" ? "TypeDeclaration" : "EnumDeclaration",
				name: nameToken.value,
				line: nameToken.line,
				column: nameToken.column,
			} as AST.Statement;
		}

		// Variable declaration with optional type annotation:
		// var name = expr
		// varip name = expr
		// const name = expr
		// var float name = expr
		// int name = expr
		// float name = expr
		if (this.match([TokenType.KEYWORD, ["var", "varip", "const"]])) {
			const varKeyword = this.previous().value as "var" | "varip" | "const";
			let typeAnnotation: string | undefined;

			// Check if next token is also a type keyword (e.g., var float x = 1.0)
			if (this.isVarTypeKeyword()) {
				typeAnnotation = this.advance().value;
				typeAnnotation += this.parseGenericTypeSuffix();
			}

			return this.variableDeclaration(varKeyword, typeAnnotation);
		}

		// Type-annotated variable declaration without var: int x = 1, float y = 2.0, array<float> z = array.new<float>()
		// Also handles comma-separated: int _m2 = 0, int _m3 = 0, int _m4 = 0
		if (this.isVarTypeKeyword()) {
			const checkpoint = this.current;
			let typeAnnotation = this.advance().value;
			typeAnnotation += this.parseGenericTypeSuffix();

			// Check if next token is identifier followed by =
			if (
				this.check(TokenType.IDENTIFIER) &&
				this.peekNext()?.type === TokenType.ASSIGN
			) {
				// This is a type-annotated variable declaration
				const firstDecl = this.variableDeclaration(null, typeAnnotation);

				// Check for comma-separated declarations: int x = 0, int y = 0 OR int x = 0, y = 1
				if (this.check(TokenType.COMMA)) {
					const statements: AST.Statement[] = [firstDecl];
					let lastType = typeAnnotation; // Track last used type for inheritance

					while (this.match(TokenType.COMMA)) {
						// Each subsequent part can be:
						// 1. type identifier = expression (new type)
						// 2. identifier = expression (inherits last type)
						if (this.isVarTypeKeyword()) {
							let nextType = this.advance().value;
							nextType += this.parseGenericTypeSuffix();

							if (
								this.check(TokenType.IDENTIFIER) &&
								this.peekNext()?.type === TokenType.ASSIGN
							) {
								const nextDecl = this.variableDeclaration(null, nextType);
								statements.push(nextDecl);
								lastType = nextType;
							} else {
								break;
							}
						} else if (
							this.check(TokenType.IDENTIFIER) &&
							this.peekNext()?.type === TokenType.ASSIGN
						) {
							// Untyped declaration - inherits last type
							const nextDecl = this.variableDeclaration(null, lastType);
							statements.push(nextDecl);
						} else {
							break;
						}
					}

					return {
						type: "SequenceStatement",
						statements,
						line: firstDecl.line,
						column: firstDecl.column,
					} as AST.SequenceStatement;
				}

				return firstDecl;
			}

			// Not a variable declaration, backtrack
			this.current = checkpoint;
		}

		// Check for function definition: name(params) =>
		if (this.check(TokenType.IDENTIFIER)) {
			const checkpoint = this.current;
			const nameToken = this.advance();

			if (this.match(TokenType.LPAREN)) {
				// Check if this looks like a function definition (params are identifiers)
				// or a function call (params could be any expression)
				try {
					const params = this.parseFunctionParams();
					this.consume(
						TokenType.RPAREN,
						'Expected ")" after function parameters',
					);

					// Check for arrow =>
					if (this.match(TokenType.ARROW)) {
						// It's a function definition!
						return this.functionDeclaration(
							nameToken.value,
							params,
							nameToken.line,
							nameToken.column,
						);
					}
				} catch (_e) {
					// Not a function definition (parsing params failed), backtrack
					this.current = checkpoint;
				}
			}

			// Not a function definition, backtrack
			this.current = checkpoint;
		}

		// Check for tuple destructuring: [a, b, c] = expr
		if (this.check(TokenType.LBRACKET)) {
			const checkpoint = this.current;
			try {
				return this.tupleDestructuring();
			} catch (_e) {
				this.current = checkpoint;
			}
		}

		// Check if it's an identifier followed by = (variable declaration without var)
		// But only if it's '=' not ':='
		// Also handles comma-separated declarations: x = 1, y = 2, z = 3
		if (
			this.check(TokenType.IDENTIFIER) &&
			this.peekNext()?.type === TokenType.ASSIGN &&
			this.peekNext()?.value === "="
		) {
			const firstDecl = this.variableDeclaration(null);

			// Check for comma-separated declarations
			if (this.check(TokenType.COMMA)) {
				const statements: AST.Statement[] = [firstDecl];

				while (this.match(TokenType.COMMA)) {
					// Each subsequent part should be: identifier = expression
					if (!this.check(TokenType.IDENTIFIER)) {
						break;
					}
					const nextDecl = this.variableDeclaration(null);
					statements.push(nextDecl);
				}

				return {
					type: "SequenceStatement",
					statements,
					line: firstDecl.line,
					column: firstDecl.column,
				};
			}

			return firstDecl;
		}

		// Check for assignment: target := expr or target = expr or target += expr (compound)
		// Also handles comma-separated assignments: a := 1, b := 2, c := 3
		const checkpoint = this.current;
		try {
			const target = this.expression();
			if (this.match(TokenType.ASSIGN) || this.match(TokenType.COMPOUND_ASSIGN)) {
				const operator = this.previous().value;
				const value = this.expression();
				const firstAssignment: AST.AssignmentStatement = {
					type: "AssignmentStatement",
					target,
					operator,
					value,
					line: target.line,
					column: target.column,
				};

				// Check for comma-separated assignments
				if (this.check(TokenType.COMMA)) {
					const statements: AST.Statement[] = [firstAssignment];

					while (this.match(TokenType.COMMA)) {
						const nextTarget = this.expression();
						if (
							!this.match(TokenType.ASSIGN) &&
							!this.match(TokenType.COMPOUND_ASSIGN)
						) {
							throw new Error("Expected assignment operator after comma");
						}
						const nextOperator = this.previous().value;
						const nextValue = this.expression();
						statements.push({
							type: "AssignmentStatement",
							target: nextTarget,
							operator: nextOperator,
							value: nextValue,
							line: nextTarget.line,
							column: nextTarget.column,
						});
					}

					return {
						type: "SequenceStatement",
						statements,
						line: firstAssignment.line,
						column: firstAssignment.column,
					};
				}

				return firstAssignment;
			}
			// Not an assignment, backtrack
			this.current = checkpoint;
		} catch (_e) {
			this.current = checkpoint;
		}

		// Expression statement (function calls, etc.)
		return this.expressionStatement();
	}

	/**
	 * Parse tuple destructuring: [a, b, c] = expr
	 */
	private tupleDestructuring(): AST.TupleDeclaration {
		const startToken = this.peek();
		this.consume(TokenType.LBRACKET, 'Expected "["');

		const names: string[] = [];
		if (!this.check(TokenType.RBRACKET)) {
			do {
				const nameToken = this.consume(
					TokenType.IDENTIFIER,
					"Expected variable name in tuple",
				);
				names.push(nameToken.value);
			} while (this.match(TokenType.COMMA));
		}

		this.consume(TokenType.RBRACKET, 'Expected "]"');
		this.consume(TokenType.ASSIGN, 'Expected "=" after tuple');

		const init = this.expression();

		return {
			type: "TupleDeclaration",
			names,
			init,
			line: startToken.line,
			column: startToken.column,
		};
	}

	private variableDeclaration(
		varType: "var" | "varip" | "const" | null,
		typeName?: string,
	): AST.VariableDeclaration {
		const token = this.consume(TokenType.IDENTIFIER, "Expected variable name");

		let init: AST.Expression | null = null;
		if (this.match(TokenType.ASSIGN)) {
			init = this.expression();
		}

		return {
			type: "VariableDeclaration",
			name: token.value,
			varType,
			init,
			typeAnnotation: typeName ? { name: typeName } : undefined,
			line: token.line,
			column: token.column,
		};
	}

	private expressionStatement(): AST.ExpressionStatement | AST.SequenceStatement {
		const expr = this.expression();

		// Check for comma-separated expressions (e.g., func1(), func2(), func3())
		if (this.check(TokenType.COMMA)) {
			const statements: AST.Statement[] = [
				{
					type: "ExpressionStatement",
					expression: expr,
					line: expr.line,
					column: expr.column,
				},
			];

			while (this.match(TokenType.COMMA)) {
				const nextExpr = this.expression();
				statements.push({
					type: "ExpressionStatement",
					expression: nextExpr,
					line: nextExpr.line,
					column: nextExpr.column,
				});
			}

			return {
				type: "SequenceStatement",
				statements,
				line: expr.line,
				column: expr.column,
			};
		}

		return {
			type: "ExpressionStatement",
			expression: expr,
			line: expr.line,
			column: expr.column,
		};
	}

	private ifStatement(): AST.IfStatement {
		const startToken = this.previous();
		const condition = this.expression();

		const consequent: AST.Statement[] = [];

		// Skip newlines after condition
		while (this.check(TokenType.NEWLINE)) {
			this.advance();
		}

		// Parse the consequent block using indentation tracking
		// Track the indentation of the if statement and its body
		const _baseIndent = this.peek().indent || 0;
		let consequentIndent: number | null = null;

		while (!this.isAtEnd() && !this.check([TokenType.KEYWORD, ["else"]])) {
			const currentToken = this.peek();
			const currentIndent = currentToken.indent || 0;

			// Set expected consequent indentation from first statement
			if (consequentIndent === null && currentToken.line > startToken.line) {
				consequentIndent = currentIndent;
			}

			// Stop if we've returned to base indentation level or less
			if (
				consequentIndent !== null &&
				currentToken.line > startToken.line &&
				currentIndent < consequentIndent
			) {
				break;
			}

			const stmt = this.statement();
			if (stmt) {
				consequent.push(stmt);
			} else {
				break;
			}
		}

		let alternate: AST.Statement[] | undefined;
		if (this.match([TokenType.KEYWORD, ["else"]])) {
			const elseToken = this.previous();
			alternate = [];

			// Skip newlines after 'else' keyword
			while (this.check(TokenType.NEWLINE)) {
				this.advance();
			}

			// Parse the alternate block using indentation tracking
			let alternateIndent: number | null = null;

			while (!this.isAtEnd()) {
				const currentToken = this.peek();
				const currentIndent = currentToken.indent || 0;

				// Set expected alternate indentation from first statement
				if (alternateIndent === null && currentToken.line > elseToken.line) {
					alternateIndent = currentIndent;
				}

				// Stop if we've returned to base indentation level or less
				if (
					alternateIndent !== null &&
					currentToken.line > elseToken.line &&
					currentIndent < alternateIndent
				) {
					break;
				}

				const stmt = this.statement();
				if (stmt) {
					alternate.push(stmt);
				} else {
					break;
				}
			}
		}

		return {
			type: "IfStatement",
			condition,
			consequent,
			alternate,
			line: startToken.line,
			column: startToken.column,
		};
	}

	private forStatement(): AST.ForStatement | AST.ForInStatement {
		const startToken = this.previous();
		const iterator = this.consume(
			TokenType.IDENTIFIER,
			"Expected iterator variable",
		).value;

		// Check for "for x in collection" syntax
		if (this.check(TokenType.KEYWORD) && this.peek().value === "in") {
			this.advance(); // consume 'in'
			const collection = this.expression();

			const body: AST.Statement[] = [];

			// Skip newlines after collection expression
			while (this.check(TokenType.NEWLINE)) {
				this.advance();
			}

			// Parse the loop body using indentation tracking
			let bodyIndent: number | null = null;

			while (!this.isAtEnd()) {
				const currentToken = this.peek();

				// Skip NEWLINE tokens when determining loop body boundaries
				if (currentToken.type === TokenType.NEWLINE) {
					this.advance();
					continue;
				}

				const currentIndent = currentToken.indent || 0;

				if (bodyIndent === null && currentToken.line > startToken.line) {
					bodyIndent = currentIndent;
				}

				if (
					bodyIndent !== null &&
					currentToken.line > startToken.line &&
					currentIndent < bodyIndent
				) {
					break;
				}

				const stmt = this.statement();
				if (stmt) {
					body.push(stmt);
				} else {
					break;
				}
			}

			return {
				type: "ForInStatement",
				iterator,
				collection,
				body,
				line: startToken.line,
				column: startToken.column,
			};
		}

		this.consume(TokenType.ASSIGN, 'Expected "=" in for loop');
		const from = this.expression();
		this.match([TokenType.KEYWORD, ["to"]]); // optional 'to' keyword
		const to = this.expression();

		// Optional step value: "by <expr>"
		let step: AST.Expression | undefined;
		if (this.match([TokenType.KEYWORD, ["by"]])) {
			step = this.expression();
		}

		const body: AST.Statement[] = [];

		// Skip newlines after to expression
		while (this.check(TokenType.NEWLINE)) {
			this.advance();
		}

		// Parse the loop body using indentation tracking
		let bodyIndent: number | null = null;

		while (!this.isAtEnd()) {
			const currentToken = this.peek();

			// Skip NEWLINE tokens when determining loop body boundaries
			if (currentToken.type === TokenType.NEWLINE) {
				this.advance();
				continue;
			}

			const currentIndent = currentToken.indent || 0;

			// Set expected body indentation from first statement
			if (bodyIndent === null && currentToken.line > startToken.line) {
				bodyIndent = currentIndent;
			}

			// Stop if we've returned to base indentation level or less
			if (
				bodyIndent !== null &&
				currentToken.line > startToken.line &&
				currentIndent < bodyIndent
			) {
				break;
			}

			const stmt = this.statement();
			if (stmt) {
				body.push(stmt);
			} else {
				break;
			}
		}

		return {
			type: "ForStatement",
			iterator,
			from,
			to,
			step,
			body,
			line: startToken.line,
			column: startToken.column,
		};
	}

	private whileStatement(): AST.WhileStatement {
		const startToken = this.previous();
		const condition = this.expression();

		const body: AST.Statement[] = [];
		const stmt = this.statement();
		if (stmt) body.push(stmt);

		return {
			type: "WhileStatement",
			condition,
			body,
			line: startToken.line,
			column: startToken.column,
		};
	}

	private returnStatement(): AST.ReturnStatement {
		const startToken = this.previous();
		const value = this.expression();

		return {
			type: "ReturnStatement",
			value,
			line: startToken.line,
			column: startToken.column,
		};
	}

	private functionDeclaration(
		name: string,
		params: AST.FunctionParam[],
		line: number,
		column: number,
	): AST.FunctionDeclaration {
		// Parse function body using indentation
		// In Pine Script, function bodies after => can be:
		// 1. Single expression: f(x) => x * 2
		// 2. Multi-line block with increased indentation:
		//    f(x) =>
		//        y = x * 2
		//        y + 1
		const body: AST.Statement[] = [];

		// Get the base indentation (indentation of the function declaration line)
		const _baseIndent = this.peek().indent || 0;

		// Skip newlines after the => token
		while (this.check(TokenType.NEWLINE)) {
			this.advance();
		}

		// Check if next token is on a new line with deeper indentation
		const nextToken = this.peek();
		if (nextToken.line === line) {
			// Single-line function: same line as =>
			try {
				const expr = this.expression();
				body.push({
					type: "ReturnStatement",
					value: expr,
					line: expr.line,
					column: expr.column,
				} as AST.ReturnStatement);
			} catch (_e) {
				// Error parsing expression - function may be incomplete
			}
		} else {
			// Multi-line function: parse all statements at deeper indentation
			// Determine the expected function body indentation from the first token
			let functionBodyIndent: number | null = null;

			while (!this.isAtEnd()) {
				const currentToken = this.peek();
				const currentIndent = currentToken.indent || 0;

				// Skip NEWLINE tokens when determining function body boundaries
				if (currentToken.type === TokenType.NEWLINE) {
					this.advance();
					continue;
				}

				// Set expected body indentation from first statement
				if (functionBodyIndent === null && currentToken.line > line) {
					functionBodyIndent = currentIndent;
				}

				// Stop if we've returned to base indentation level or less
				// AND we're past the function declaration line
				if (
					currentToken.line > line &&
					functionBodyIndent !== null &&
					currentIndent < functionBodyIndent
				) {
					break;
				}

				// Parse statement at this indentation level
				try {
					const stmt = this.statement();
					if (stmt) {
						body.push(stmt);
					} else {
						break;
					}
				} catch (_e) {
					// Error parsing statement - try to recover
					break;
				}
			}
		}

		return {
			type: "FunctionDeclaration",
			name,
			params,
			body,
			line,
			column,
		};
	}

	/**
	 * Parse import statement: import User/Library/Version [as alias]
	 * The path is special - slashes are path separators, not division
	 */
	private importStatement(): AST.ImportStatement {
		const startToken = this.previous();

		// Parse library path: username/libraryName/version
		// This is a special syntax where / is NOT division
		let libraryPath = "";

		// First segment: username (identifier)
		if (this.check(TokenType.IDENTIFIER)) {
			libraryPath = this.advance().value;
		} else {
			throw new Error(`Expected library username at line ${this.peek().line}`);
		}

		// Expect /
		if (this.match(TokenType.DIVIDE)) {
			libraryPath += "/";
		} else {
			throw new Error(`Expected "/" in import path at line ${this.peek().line}`);
		}

		// Second segment: libraryName (identifier)
		if (this.check(TokenType.IDENTIFIER)) {
			libraryPath += this.advance().value;
		} else {
			throw new Error(`Expected library name at line ${this.peek().line}`);
		}

		// Expect /
		if (this.match(TokenType.DIVIDE)) {
			libraryPath += "/";
		} else {
			throw new Error(`Expected "/" in import path at line ${this.peek().line}`);
		}

		// Third segment: version (number)
		if (this.check(TokenType.NUMBER)) {
			libraryPath += this.advance().value;
		} else {
			throw new Error(`Expected library version number at line ${this.peek().line}`);
		}

		// Optional: as alias
		let alias: string | undefined;
		if (this.check(TokenType.KEYWORD) && this.peek().value === "as") {
			this.advance(); // consume 'as'
			if (this.check(TokenType.IDENTIFIER)) {
				alias = this.advance().value;
			} else {
				throw new Error(`Expected alias name after 'as' at line ${this.peek().line}`);
			}
		}

		return {
			type: "ImportStatement",
			libraryPath,
			alias,
			line: startToken.line,
			column: startToken.column,
		};
	}

	/**
	 * Parse export declaration: export funcName(...) => ... or export method methodName(...) => ...
	 */
	private exportDeclaration(): AST.FunctionDeclaration | AST.MethodDeclaration {
		// Check if it's 'export method'
		if (this.match([TokenType.KEYWORD, ["method"]])) {
			return this.methodDeclaration(true);
		}

		// Otherwise it's 'export funcName(...) => ...'
		const nameToken = this.consume(TokenType.IDENTIFIER, "Expected function name after 'export'");
		this.consume(TokenType.LPAREN, 'Expected "(" after function name');
		const params = this.parseFunctionParams();
		this.consume(TokenType.RPAREN, 'Expected ")" after function parameters');
		this.consume(TokenType.ARROW, 'Expected "=>" after function parameters');

		const funcDecl = this.functionDeclaration(
			nameToken.value,
			params,
			nameToken.line,
			nameToken.column,
		);
		funcDecl.isExport = true;
		return funcDecl;
	}

	/**
	 * Parse method declaration: [export] method methodName(...) => ...
	 */
	private methodDeclaration(isExport: boolean): AST.MethodDeclaration {
		const nameToken = this.consume(TokenType.IDENTIFIER, "Expected method name after 'method'");
		this.consume(TokenType.LPAREN, 'Expected "(" after method name');
		const params = this.parseFunctionParams();
		this.consume(TokenType.RPAREN, 'Expected ")" after method parameters');
		this.consume(TokenType.ARROW, 'Expected "=>" after method parameters');

		// Parse method body - same logic as function body
		const body: AST.Statement[] = [];
		const line = nameToken.line;

		// Skip newlines after the => token
		while (this.check(TokenType.NEWLINE)) {
			this.advance();
		}

		// Check if next token is on a new line with deeper indentation
		const nextToken = this.peek();
		if (nextToken.line === line) {
			// Single-line method: same line as =>
			try {
				const expr = this.expression();
				body.push({
					type: "ReturnStatement",
					value: expr,
					line: expr.line,
					column: expr.column,
				} as AST.ReturnStatement);
			} catch (_e) {
				// Error parsing expression - method may be incomplete
			}
		} else {
			// Multi-line method: parse all statements at deeper indentation
			let methodBodyIndent: number | null = null;

			while (!this.isAtEnd()) {
				const currentToken = this.peek();
				const currentIndent = currentToken.indent || 0;

				// Skip NEWLINE tokens
				if (currentToken.type === TokenType.NEWLINE) {
					this.advance();
					continue;
				}

				// Set expected body indentation from first statement
				if (methodBodyIndent === null && currentToken.line > line) {
					methodBodyIndent = currentIndent;
				}

				// Stop if we've returned to base indentation level or less
				if (
					currentToken.line > line &&
					methodBodyIndent !== null &&
					currentIndent < methodBodyIndent
				) {
					break;
				}

				try {
					const stmt = this.statement();
					if (stmt) {
						body.push(stmt);
					} else {
						break;
					}
				} catch (_e) {
					break;
				}
			}
		}

		return {
			type: "MethodDeclaration",
			name: nameToken.value,
			params,
			body,
			isExport,
			line: nameToken.line,
			column: nameToken.column,
		};
	}

	/**
	 * Parse switch expression (Pine Script v6)
	 * switch
	 *     condition => expr
	 *     => defaultExpr
	 */
	private switchExpression(): AST.Expression {
		const startToken = this.previous();

		// Check for discriminant expression on the same line (e.g., "switch pos")
		// If there's an identifier or expression before the newline, parse it as discriminant
		let discriminant: AST.Expression | undefined;
		if (!this.check(TokenType.NEWLINE) && !this.isAtEnd()) {
			// There's something on the same line as 'switch' - parse as discriminant
			discriminant = this.expression();
		}

		// Skip newlines after 'switch' (or discriminant)
		while (this.check(TokenType.NEWLINE)) {
			this.advance();
		}

		// Parse switch cases until we hit a line with less indentation
		const cases: { condition?: AST.Expression; result: AST.Expression }[] = [];
		let switchIndent: number | null = null;

		while (!this.isAtEnd()) {
			// Skip newlines
			while (this.check(TokenType.NEWLINE)) {
				this.advance();
			}

			if (this.isAtEnd()) break;

			const currentToken = this.peek();
			const currentIndent = currentToken.indent || 0;

			// Set expected switch body indentation from first case
			if (switchIndent === null && currentToken.line > startToken.line) {
				switchIndent = currentIndent;
			}

			// Stop if we've returned to base indentation level or less
			if (
				switchIndent !== null &&
				currentToken.line > startToken.line &&
				currentIndent < switchIndent
			) {
				break;
			}

			// Check for default case (just =>)
			if (this.match(TokenType.ARROW)) {
				const result = this.parseSwitchCaseBody(switchIndent || 0);
				cases.push({ result });
				continue;
			}

			// Parse condition => result
			const condition = this.expression();
			if (this.match(TokenType.ARROW)) {
				const result = this.parseSwitchCaseBody(switchIndent || 0);
				cases.push({ condition, result });
			} else {
				// Not a valid case, stop parsing
				break;
			}
		}

		// Return a proper SwitchExpression AST node
		return {
			type: "SwitchExpression",
			discriminant,
			cases,
			line: startToken.line,
			column: startToken.column,
		};
	}

	/**
	 * Parse switch case body (single-line expression or multi-line block)
	 * For multi-line case bodies like:
	 *     condition =>
	 *         stmt1
	 *         stmt2
	 *         resultExpr
	 */
	private parseSwitchCaseBody(caseIndent: number): AST.Expression {
		const arrowToken = this.previous();

		// Check if there's content on the same line as =>
		if (!this.check(TokenType.NEWLINE) && !this.isAtEnd()) {
			// Single-line case: condition => expression
			return this.expression();
		}

		// Multi-line case body: parse statements until indentation decreases
		// Skip newlines after =>
		while (this.check(TokenType.NEWLINE)) {
			this.advance();
		}

		if (this.isAtEnd()) {
			// No body after =>, return na as placeholder
			return {
				type: "Identifier",
				name: "na",
				line: arrowToken.line,
				column: arrowToken.column,
			};
		}

		// Get the body indentation (should be greater than case indentation)
		const firstBodyToken = this.peek();
		const bodyIndent = firstBodyToken.indent || 0;

		// If not more indented than case, treat as empty body
		if (bodyIndent <= caseIndent) {
			return {
				type: "Identifier",
				name: "na",
				line: arrowToken.line,
				column: arrowToken.column,
			};
		}

		// Parse statements in the body
		const bodyStatements: AST.Statement[] = [];

		while (!this.isAtEnd()) {
			// Skip newlines
			while (this.check(TokenType.NEWLINE)) {
				this.advance();
			}

			if (this.isAtEnd()) break;

			const currentToken = this.peek();
			const currentIndent = currentToken.indent || 0;

			// Stop if indentation has decreased to or below case level
			if (currentIndent <= caseIndent) {
				break;
			}

			// Also stop if we've returned to the same indentation as case line
			// (which means we're at the next case)
			if (currentIndent === caseIndent) {
				break;
			}

			// Parse the next statement
			const stmt = this.statement();
			if (stmt) {
				bodyStatements.push(stmt);
			} else {
				break;
			}
		}

		// The result is the last statement's expression
		// If the last statement is an ExpressionStatement, use its expression
		// Otherwise wrap the statements somehow
		if (bodyStatements.length === 0) {
			return {
				type: "Identifier",
				name: "na",
				line: arrowToken.line,
				column: arrowToken.column,
			};
		}

		const lastStmt = bodyStatements[bodyStatements.length - 1];
		if (lastStmt.type === "ExpressionStatement") {
			// The last expression is the result
			// NOTE: Multi-statement arrow bodies lose intermediate statements in the AST.
			// e.g., `f() => a = 1\n    b = 2\n    a + b` only preserves `a + b`.
			// A proper fix would add a BlockExpression node containing all statements,
			// with the last expression as the result. Low priority since it only affects
			// complex multi-line arrow functions and doesn't cause validation errors.
			return lastStmt.expression;
		}

		// If the last statement isn't an expression, still try to return something
		// This handles cases like variable declarations that should return their value
		if (lastStmt.type === "VariableDeclaration" && lastStmt.init) {
			return lastStmt.init;
		}

		// Fallback: return na
		return {
			type: "Identifier",
			name: "na",
			line: lastStmt.line,
			column: lastStmt.column,
		};
	}

	// Type keywords that can appear as parameter types (includes qualifiers)
	private static readonly TYPE_KEYWORDS = new Set([
		"int",
		"float",
		"bool",
		"string",
		"color",
		"line",
		"label",
		"box",
		"table",
		"array",
		"matrix",
		"map",
		"series",
		"simple",
	]);

	// Variable type keywords (excludes qualifiers like series/simple)
	private static readonly VAR_TYPE_KEYWORDS = [
		"int",
		"float",
		"bool",
		"string",
		"color",
		"line",
		"label",
		"box",
		"table",
		"array",
		"matrix",
		"map",
	];

	private isTypeKeyword(): boolean {
		const token = this.peek();
		return (
			token.type === TokenType.KEYWORD &&
			Parser.TYPE_KEYWORDS.has(token.value)
		);
	}

	/** Check if current token is a variable type keyword (not a qualifier) */
	private isVarTypeKeyword(): boolean {
		return this.check([TokenType.KEYWORD, Parser.VAR_TYPE_KEYWORDS]);
	}

	/**
	 * Parse generic type syntax like <float>, <int>, <array<float>>, including array[] syntax.
	 * Returns the suffix to append to the base type, or empty string if no generic syntax found.
	 */
	private parseGenericTypeSuffix(): string {
		// Check for generic type syntax: array<float>, matrix<int>, etc.
		if (this.check(TokenType.COMPARE) && this.peek().value === "<") {
			this.advance(); // consume <
			let suffix = "";
			// Consume the type parameter (e.g., "float")
			if (this.check(TokenType.IDENTIFIER) || this.check(TokenType.KEYWORD)) {
				suffix = `<${this.advance().value}`;
				// Handle nested generics like array<array<float>>
				while (this.check(TokenType.COMPARE) && this.peek().value === "<") {
					this.advance(); // consume <
					if (this.check(TokenType.IDENTIFIER) || this.check(TokenType.KEYWORD)) {
						suffix += `<${this.advance().value}`;
					}
					if (this.check(TokenType.COMPARE) && this.peek().value === ">") {
						this.advance(); // consume >
						suffix += ">";
					}
				}
				// Consume closing >
				if (this.check(TokenType.COMPARE) && this.peek().value === ">") {
					this.advance(); // consume >
					suffix += ">";
				}
			}
			return suffix;
		}
		// Check for simple array type syntax: float[], int[], etc.
		if (this.check(TokenType.LBRACKET)) {
			this.advance(); // consume [
			if (this.check(TokenType.RBRACKET)) {
				this.advance(); // consume ]
				return "[]";
			}
		}
		return "";
	}

	private parseFunctionParams(): AST.FunctionParam[] {
		const params: AST.FunctionParam[] = [];

		// Skip any leading newlines
		while (this.check(TokenType.NEWLINE)) {
			this.advance();
		}

		if (this.check(TokenType.RPAREN)) {
			return params; // No parameters
		}

		do {
			// Skip newlines between parameters (multi-line function definitions)
			while (this.check(TokenType.NEWLINE)) {
				this.advance();
			}

			// Pine Script function params can be:
			// - paramName (simple)
			// - type paramName (typed, type can be keyword like int/float or identifier like custom type)
			// - paramName = defaultValue (with default)
			// - type paramName = defaultValue (typed with default)

			let typeAnnotation: AST.TypeAnnotation | undefined;
			let paramName: string;

			// Parse type annotation and parameter name
			// Pine Script supports:
			// - paramName (simple)
			// - type paramName (e.g., float source)
			// - qualifier type paramName (e.g., simple int length, series float price)
			// - type keywords as param names (e.g., color = color.white)

			// Collect type keywords (qualifiers and base types)
			const typeKeywords: string[] = [];
			while (this.isTypeKeyword()) {
				// Check what follows: if it's an identifier, < (generic), or any keyword, this is part of the type
				// If it's = or , or ), this keyword is the parameter name
				const next = this.peekNext();
				if (
					next?.type === TokenType.IDENTIFIER ||
					next?.type === TokenType.KEYWORD || // Any keyword can be a param name (e.g., 'type', 'color')
					(next?.type === TokenType.COMPARE && next.value === "<")
				) {
					// More type info or param name follows
					typeKeywords.push(this.advance().value);
				} else {
					// This keyword is the parameter name itself
					break;
				}
			}

			// Check for generic type syntax: array<float>, matrix<int>, map<string, float>
			if (typeKeywords.length > 0 && this.check(TokenType.COMPARE) && this.peek().value === "<") {
				this.advance(); // consume <
				let genericType = "<";
				let depth = 1;
				// Consume everything until matching >
				while (!this.isAtEnd() && depth > 0) {
					const token = this.advance();
					if (token.type === TokenType.COMPARE && token.value === "<") {
						depth++;
					} else if (token.type === TokenType.COMPARE && token.value === ">") {
						depth--;
					}
					genericType += token.value;
					// Add space after comma for readability
					if (token.type === TokenType.COMMA && depth > 0) {
						genericType += " ";
					}
				}
				typeKeywords[typeKeywords.length - 1] += genericType;
			}

			if (typeKeywords.length > 0) {
				typeAnnotation = { name: typeKeywords.join(" ") };
				// Next token should be the parameter name (identifier or keyword used as name)
				// Keywords like 'type', 'color', 'string' etc. can be used as param names
				if (this.check(TokenType.IDENTIFIER)) {
					paramName = this.advance().value;
				} else if (this.check(TokenType.KEYWORD)) {
					// Keyword used as parameter name (e.g., string type, color color)
					paramName = this.advance().value;
				} else {
					throw new Error("Expected parameter name after type");
				}
			} else if (this.check(TokenType.KEYWORD)) {
				// Keyword used as parameter name (e.g., color = color.white, type = "SMA")
				paramName = this.advance().value;
			} else {
				// First token should be identifier (could be type or param name)
				const firstIdent = this.consume(
					TokenType.IDENTIFIER,
					"Expected parameter name or type",
				);

				// Check if next token is an identifier (then first was type, second is name)
				if (this.check(TokenType.IDENTIFIER)) {
					typeAnnotation = { name: firstIdent.value };
					paramName = this.advance().value;
				} else {
					// First identifier is the parameter name
					paramName = firstIdent.value;
				}
			}

			let defaultValue: AST.Expression | undefined;
			if (this.match(TokenType.ASSIGN)) {
				defaultValue = this.expression();
			}

			params.push({
				name: paramName,
				typeAnnotation,
				defaultValue,
			});

			// Skip newlines after parameter (before comma or closing paren)
			while (this.check(TokenType.NEWLINE)) {
				this.advance();
			}
		} while (this.match(TokenType.COMMA));

		// Skip trailing newlines before closing paren
		while (this.check(TokenType.NEWLINE)) {
			this.advance();
		}

		return params;
	}

	private expression(): AST.Expression {
		return this.ternary();
	}

	private ternary(): AST.Expression {
		const expr = this.logicalOr();

		if (this.match(TokenType.TERNARY)) {
			// Skip newlines after ? for multi-line ternary
			while (this.check(TokenType.NEWLINE)) {
				this.advance();
			}
			const consequent = this.expression();
			// Skip newlines before : for multi-line ternary (when consequent ends on previous line)
			while (this.check(TokenType.NEWLINE)) {
				this.advance();
			}
			this.consume(TokenType.COLON, 'Expected ":" in ternary expression');
			// Skip newlines after : for multi-line ternary
			while (this.check(TokenType.NEWLINE)) {
				this.advance();
			}
			const alternate = this.expression();

			return {
				type: "TernaryExpression",
				condition: expr,
				consequent,
				alternate,
				line: expr.line,
				column: expr.column,
			};
		}

		return expr;
	}

	private logicalOr(): AST.Expression {
		let expr = this.logicalAnd();

		while (true) {
			// Skip newlines that are clearly line continuations
			if (this.check(TokenType.NEWLINE)) {
				const nextToken = this.peekNext();
				// If next token is 'or', it's a line continuation
				if (
					nextToken &&
					nextToken.type === TokenType.KEYWORD &&
					nextToken.value === "or"
				) {
					this.advance(); // skip newline
				} else {
					break; // Not a continuation, end the expression
				}
			}

			if (this.match([TokenType.KEYWORD, ["or"]])) {
				const operator = this.previous().value;
				const right = this.logicalAnd();
				expr = {
					type: "BinaryExpression",
					operator,
					left: expr,
					right,
					line: expr.line,
					column: expr.column,
				};
			} else {
				break;
			}
		}

		return expr;
	}

	private logicalAnd(): AST.Expression {
		let expr = this.comparison();

		while (true) {
			// Skip newlines that are clearly line continuations
			if (this.check(TokenType.NEWLINE)) {
				const nextToken = this.peekNext();
				// If next token is 'and', it's a line continuation
				if (
					nextToken &&
					nextToken.type === TokenType.KEYWORD &&
					nextToken.value === "and"
				) {
					this.advance(); // skip newline
				} else {
					break; // Not a continuation, end the expression
				}
			}

			if (this.match([TokenType.KEYWORD, ["and"]])) {
				const operator = this.previous().value;
				const right = this.comparison();
				expr = {
					type: "BinaryExpression",
					operator,
					left: expr,
					right,
					line: expr.line,
					column: expr.column,
				};
			} else {
				break;
			}
		}

		return expr;
	}

	private comparison(): AST.Expression {
		let expr = this.addition();

		while (true) {
			// Skip newlines that are clearly line continuations
			if (this.check(TokenType.NEWLINE)) {
				const nextToken = this.peekNext();
				// If next token is a comparison operator, it's a line continuation
				if (nextToken && nextToken.type === TokenType.COMPARE) {
					this.advance(); // skip newline
				} else {
					break; // Not a continuation, end the expression
				}
			}

			if (this.match(TokenType.COMPARE)) {
				const operator = this.previous().value;
				const right = this.addition();
				expr = {
					type: "BinaryExpression",
					operator,
					left: expr,
					right,
					line: expr.line,
					column: expr.column,
				};
			} else {
				break;
			}
		}

		return expr;
	}

	private addition(): AST.Expression {
		let expr = this.multiplication();

		while (true) {
			// Skip newlines that are clearly line continuations
			if (this.check(TokenType.NEWLINE)) {
				const nextToken = this.peekNext();
				// If next token is + or -, it's a line continuation
				if (
					nextToken &&
					(nextToken.type === TokenType.PLUS ||
						nextToken.type === TokenType.MINUS)
				) {
					this.advance(); // skip newline
				} else {
					break; // Not a continuation, end the expression
				}
			}

			if (this.match(TokenType.PLUS, TokenType.MINUS)) {
				const operator = this.previous().value;
				const right = this.multiplication();
				expr = {
					type: "BinaryExpression",
					operator,
					left: expr,
					right,
					line: expr.line,
					column: expr.column,
				};
			} else {
				break;
			}
		}

		return expr;
	}

	private multiplication(): AST.Expression {
		let expr = this.unary();

		while (true) {
			// Skip newlines that are clearly line continuations
			if (this.check(TokenType.NEWLINE)) {
				const nextToken = this.peekNext();
				// If next token is *, /, or %, it's a line continuation
				// OR if we just processed a binary operator and next token is an identifier/literal/paren
				if (
					nextToken &&
					(nextToken.type === TokenType.MULTIPLY ||
						nextToken.type === TokenType.DIVIDE ||
						nextToken.type === TokenType.MODULO ||
						(this.previous().type === TokenType.DIVIDE &&
							(nextToken.type === TokenType.IDENTIFIER ||
								nextToken.type === TokenType.NUMBER ||
								nextToken.type === TokenType.LPAREN)))
				) {
					this.advance(); // skip newline
				} else {
					break; // Not a continuation, end the expression
				}
			}

			if (this.match(TokenType.MULTIPLY, TokenType.DIVIDE, TokenType.MODULO)) {
				const operator = this.previous().value;
				const right = this.unary();
				expr = {
					type: "BinaryExpression",
					operator,
					left: expr,
					right,
					line: expr.line,
					column: expr.column,
				};
			} else {
				break;
			}
		}

		return expr;
	}

	private unary(): AST.Expression {
		// Skip newlines that are clearly line continuations in expressions
		// This handles cases where binary operators span multiple lines
		if (this.check(TokenType.NEWLINE)) {
			const nextToken = this.peekNext();
			// If next token suggests continuation (identifier, number, paren, unary op), skip newline
			if (
				nextToken &&
				(nextToken.type === TokenType.IDENTIFIER ||
					nextToken.type === TokenType.NUMBER ||
					nextToken.type === TokenType.LPAREN ||
					nextToken.type === TokenType.MINUS ||
					(nextToken.type === TokenType.KEYWORD && nextToken.value === "not"))
			) {
				this.advance(); // skip newline
			}
		}

		if (
			this.match(TokenType.MINUS) ||
			this.match([TokenType.KEYWORD, ["not"]])
		) {
			const operator = this.previous().value;
			const right = this.unary();
			return {
				type: "UnaryExpression",
				operator,
				argument: right,
				line: this.previous().line,
				column: this.previous().column,
			};
		}

		return this.postfix();
	}

	private postfix(): AST.Expression {
		let expr = this.primary();

		while (true) {
			// Allow line continuation for expressions (except for certain cases)
			// Skip newlines but allow continuation if we're in the middle of an expression
			if (this.check(TokenType.NEWLINE)) {
				// Check if the next token after newline suggests continuation
				const nextToken = this.peekNext();
				const _nextNextToken = this.tokens[this.current + 2];

				// Allow continuation if next token is an operator, function call, or array access
				// But break if it looks like a new statement
				// Heuristic: [ at start of line (column <= ~10) is likely a tuple declaration,
				// while [ deeper in the line is likely array access continuation
				const TUPLE_START_COLUMN_THRESHOLD = 10;
				if (
					nextToken &&
					(nextToken.type === TokenType.MULTIPLY ||
						nextToken.type === TokenType.DIVIDE ||
						nextToken.type === TokenType.PLUS ||
						nextToken.type === TokenType.MINUS ||
						nextToken.type === TokenType.COMPARE ||
						(nextToken.type === TokenType.KEYWORD &&
							["and", "or"].includes(nextToken.value)) ||
						nextToken.type === TokenType.LPAREN ||
						// LBRACKET at line start is likely a tuple declaration, not array access
						(nextToken.type === TokenType.LBRACKET &&
							nextToken.column > TUPLE_START_COLUMN_THRESHOLD) ||
						nextToken.type === TokenType.DOT)
				) {
					// Skip the newline and continue
					this.advance();
				} else if (this.parenDepth === 0) {
					// Not in parentheses and doesn't look like continuation - break
					break;
				} else {
					// In parentheses - allow continuation by skipping newline
					this.advance();
				}
			}

			// Handle generic type arguments: array.new<float>()
			if (this.check(TokenType.COMPARE) && this.peek().value === "<") {
				// Look ahead to see if this is a generic type argument (followed by identifier and >)
				const savedPos = this.current;
				this.advance(); // consume <

				// Collect type arguments
				const typeArgs: string[] = [];

				// Consume type identifier(s) - could be "float", "int", "box", "chart.point", etc.
				// Also handles map<key, value> syntax with multiple type arguments
				if (this.check(TokenType.IDENTIFIER) || this.check(TokenType.KEYWORD)) {
					// Parse one or more type arguments (for map<K, V>)
					do {
						let typeArg = this.advance().value;

						// Handle dotted type names like chart.point
						while (this.check(TokenType.DOT)) {
							this.advance(); // consume .
							if (
								this.check(TokenType.IDENTIFIER) ||
								this.check(TokenType.KEYWORD)
							) {
								typeArg += "." + this.advance().value;
							}
						}

						// Handle nested generics like array<array<float>>
						while (
							this.check(TokenType.COMPARE) &&
							this.peek().value === "<"
						) {
							typeArg += "<";
							this.advance();
							if (
								this.check(TokenType.IDENTIFIER) ||
								this.check(TokenType.KEYWORD)
							) {
								typeArg += this.advance().value;
								// Handle dotted type names in nested generics
								while (this.check(TokenType.DOT)) {
									this.advance();
									if (
										this.check(TokenType.IDENTIFIER) ||
										this.check(TokenType.KEYWORD)
									) {
										typeArg += "." + this.advance().value;
									}
								}
							}
							if (
								this.check(TokenType.COMPARE) &&
								this.peek().value === ">"
							) {
								typeArg += ">";
								this.advance();
							}
						}

						typeArgs.push(typeArg);
					} while (
						this.check(TokenType.COMMA) &&
						(this.advance(),
						this.check(TokenType.IDENTIFIER) ||
							this.check(TokenType.KEYWORD))
					);

					// Consume closing >
					if (this.check(TokenType.COMPARE) && this.peek().value === ">") {
						this.advance();
						// Now should see ( for function call
						if (this.match(TokenType.LPAREN)) {
							this.parenDepth++; // Increment before finishCall (which decrements)
							expr = this.finishCall(expr, typeArgs);
							continue;
						}
					}
				}
				// If pattern didn't match, restore position
				this.current = savedPos;
			}

			if (this.match(TokenType.LPAREN)) {
				// Function call
				this.parenDepth++; // Increment depth when opening parenthesis
				expr = this.finishCall(expr);
			} else if (this.match(TokenType.DOT)) {
				// Member access - property can be identifier or keyword (e.g., input.float)
				let property: Token;
				if (this.check(TokenType.IDENTIFIER)) {
					property = this.advance();
				} else if (this.check(TokenType.KEYWORD)) {
					property = this.advance();
				} else {
					throw new Error(`Expected property name at line ${this.peek().line}`);
				}
				expr = {
					type: "MemberExpression",
					object: expr,
					property: {
						type: "Identifier",
						name: property.value,
						line: property.line,
						column: property.column,
					},
					line: expr.line,
					column: expr.column,
				};
			} else if (this.match(TokenType.LBRACKET)) {
				// Array/index access
				const index = this.expression();
				this.consume(TokenType.RBRACKET, 'Expected "]"');
				expr = {
					type: "IndexExpression",
					object: expr,
					index,
					line: expr.line,
					column: expr.column,
				};
			} else {
				break;
			}
		}

		return expr;
	}

	private finishCall(
		callee: AST.Expression,
		typeArguments?: string[],
	): AST.CallExpression {
		const args: AST.CallArgument[] = [];

		if (!this.check(TokenType.RPAREN)) {
			do {
				// Skip newlines between arguments
				while (this.check(TokenType.NEWLINE)) {
					this.advance();
				}

				// Check for named argument: name = value
				// Allow both IDENTIFIER and KEYWORD as parameter names (Pine Script uses keywords like 'color', 'title', etc. as parameter names)
				if (
					(this.check(TokenType.IDENTIFIER) || this.check(TokenType.KEYWORD)) &&
					this.peekNext()?.type === TokenType.ASSIGN
				) {
					const name = this.advance().value;
					this.advance(); // consume =
					const value = this.expression();
					args.push({ name, value });
				} else {
					// Positional argument
					const value = this.expression();
					args.push({ value });
				}

				// Skip newlines after argument
				while (this.check(TokenType.NEWLINE)) {
					this.advance();
				}
			} while (this.match(TokenType.COMMA));
		}

		this.consume(TokenType.RPAREN, 'Expected ")" after arguments');
		this.parenDepth--; // Decrement depth when closing parenthesis

		const callExpr: AST.CallExpression = {
			type: "CallExpression",
			callee,
			arguments: args,
			line: callee.line,
			column: callee.column,
		};

		if (typeArguments && typeArguments.length > 0) {
			callExpr.typeArguments = typeArguments;
		}

		return callExpr;
	}

	private primary(): AST.Expression {
		// Literals
		if (this.match(TokenType.NUMBER)) {
			const token = this.previous();
			return {
				type: "Literal",
				value: parseFloat(token.value),
				raw: token.value,
				line: token.line,
				column: token.column,
			};
		}

		if (this.match(TokenType.STRING)) {
			const token = this.previous();
			return {
				type: "Literal",
				value: token.value,
				raw: token.value,
				line: token.line,
				column: token.column,
			};
		}

		if (this.match(TokenType.BOOL)) {
			const token = this.previous();
			return {
				type: "Literal",
				value: token.value === "true",
				raw: token.value,
				line: token.line,
				column: token.column,
			};
		}

		if (this.match(TokenType.COLOR)) {
			const token = this.previous();
			return {
				type: "Literal",
				value: token.value, // Keep hex color as string (e.g., "#d8e3ac")
				raw: token.value,
				line: token.line,
				column: token.column,
			};
		}

		// Parse 'na' as an Identifier so it works both as a constant and function call
		// The analyzer handles na() returning bool and na as a constant value
		if (this.match([TokenType.KEYWORD, ["na"]])) {
			const token = this.previous();
			return {
				type: "Identifier",
				name: "na",
				line: token.line,
				column: token.column,
			};
		}

		// Switch expression (can appear as value in variable declaration)
		if (this.match([TokenType.KEYWORD, ["switch"]])) {
			return this.switchExpression();
		}

		// Identifier
		if (this.match(TokenType.IDENTIFIER) || this.match(TokenType.KEYWORD)) {
			const token = this.previous();
			return {
				type: "Identifier",
				name: token.value,
				line: token.line,
				column: token.column,
			};
		}

		// Grouping
		if (this.match(TokenType.LPAREN)) {
			this.parenDepth++; // Increment depth for grouping
			const expr = this.expression();
			this.consume(TokenType.RPAREN, 'Expected ")" after expression');
			this.parenDepth--; // Decrement depth after closing
			return expr;
		}

		// Array literal
		if (this.match(TokenType.LBRACKET)) {
			const elements: AST.Expression[] = [];
			if (!this.check(TokenType.RBRACKET)) {
				do {
					elements.push(this.expression());
				} while (this.match(TokenType.COMMA));
			}
			const closeBracket = this.consume(TokenType.RBRACKET, 'Expected "]"');
			return {
				type: "ArrayExpression",
				elements,
				line: closeBracket.line,
				column: closeBracket.column,
			};
		}

		throw new Error(`Unexpected token: ${this.peek().value}`);
	}

	// Utility methods
	private match(...types: (TokenType | [TokenType, string[]])[]): boolean {
		for (const type of types) {
			if (Array.isArray(type)) {
				const [tokenType, values] = type;
				if (this.check(tokenType) && values.includes(this.peek().value)) {
					this.advance();
					return true;
				}
			} else {
				if (this.check(type)) {
					this.advance();
					return true;
				}
			}
		}
		return false;
	}

	private check(type: TokenType | [TokenType, string[]]): boolean {
		if (this.isAtEnd()) return false;
		if (Array.isArray(type)) {
			const [tokenType, values] = type;
			return (
				this.peek().type === tokenType && values.includes(this.peek().value)
			);
		}
		return this.peek().type === type;
	}

	private advance(): Token {
		if (!this.isAtEnd()) this.current++;
		return this.previous();
	}

	private isAtEnd(): boolean {
		return this.peek().type === TokenType.EOF;
	}

	private peek(): Token {
		return this.tokens[this.current];
	}

	private peekNext(): Token | null {
		if (this.current + 1 >= this.tokens.length) return null;
		return this.tokens[this.current + 1];
	}

	private previous(): Token {
		return this.tokens[this.current - 1];
	}

	private consume(type: TokenType, message: string): Token {
		if (this.check(type)) return this.advance();
		throw new Error(`${message} at line ${this.peek().line}`);
	}

	private synchronize(): void {
		this.advance();

		while (!this.isAtEnd()) {
			// Look for statement boundaries
			if (this.previous().type === TokenType.NEWLINE) return;

			switch (this.peek().type) {
				case TokenType.KEYWORD:
					if (
						["if", "for", "while", "var", "varip", "const"].includes(
							this.peek().value,
						)
					) {
						return;
					}
					break;
			}

			this.advance();
		}
	}
}
