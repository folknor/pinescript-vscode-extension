// Simple Pine Script Parser (focused on function call validation)

import type * as AST from "./ast";
import { Lexer, type LexerError, type Token, TokenType } from "./lexer";

export class Parser {
	private tokens: Token[] = [];
	private current: number = 0;
	private parenDepth: number = 0; // Track parenthesis nesting depth
	private lexerErrors: LexerError[] = [];
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
				// Skip to next statement on error (silently - errors are collected separately)
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

		// Skip annotations
		if (this.check(TokenType.ANNOTATION)) {
			this.advance();
			return null;
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
						const currentIndent = currentToken.indent || 0;

						if (
							currentToken.line > startToken.line &&
							currentIndent < bodyIndent
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
			if (
				this.check([
					TokenType.KEYWORD,
					[
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
					],
				])
			) {
				typeAnnotation = this.advance().value;

				// Check for generic type syntax: array<float>, matrix<int>, etc.
				if (this.check(TokenType.COMPARE) && this.peek().value === "<") {
					this.advance(); // consume <
					// Consume the type parameter (e.g., "float")
					if (
						this.check(TokenType.IDENTIFIER) ||
						this.check(TokenType.KEYWORD)
					) {
						typeAnnotation += `<${this.advance().value}`;
						// Handle nested generics like array<array<float>>
						while (this.check(TokenType.COMPARE) && this.peek().value === "<") {
							this.advance(); // consume <
							if (
								this.check(TokenType.IDENTIFIER) ||
								this.check(TokenType.KEYWORD)
							) {
								typeAnnotation += `<${this.advance().value}`;
							}
							if (this.check(TokenType.COMPARE) && this.peek().value === ">") {
								this.advance(); // consume >
								typeAnnotation += ">";
							}
						}
						// Consume closing >
						if (this.check(TokenType.COMPARE) && this.peek().value === ">") {
							this.advance(); // consume >
							typeAnnotation += ">";
						}
					}
				}
				// Check for simple array type syntax: float[], int[], etc.
				else if (this.check(TokenType.LBRACKET)) {
					this.advance(); // consume [
					if (this.check(TokenType.RBRACKET)) {
						this.advance(); // consume ]
						typeAnnotation += "[]";
					}
				}
			}

			return this.variableDeclaration(varKeyword, typeAnnotation);
		}

		// Type-annotated variable declaration without var: int x = 1, float y = 2.0, array<float> z = array.new<float>()
		if (
			this.check([
				TokenType.KEYWORD,
				[
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
				],
			])
		) {
			const checkpoint = this.current;
			let typeAnnotation = this.advance().value;

			// Check for generic type syntax: array<float>, matrix<int>, etc.
			if (this.check(TokenType.COMPARE) && this.peek().value === "<") {
				this.advance(); // consume <
				// Consume the type parameter (e.g., "float")
				if (this.check(TokenType.IDENTIFIER) || this.check(TokenType.KEYWORD)) {
					typeAnnotation += `<${this.advance().value}`;
					// Handle nested generics like array<array<float>>
					while (this.check(TokenType.COMPARE) && this.peek().value === "<") {
						this.advance(); // consume <
						if (
							this.check(TokenType.IDENTIFIER) ||
							this.check(TokenType.KEYWORD)
						) {
							typeAnnotation += `<${this.advance().value}`;
						}
						if (this.check(TokenType.COMPARE) && this.peek().value === ">") {
							this.advance(); // consume >
							typeAnnotation += ">";
						}
					}
					// Consume closing >
					if (this.check(TokenType.COMPARE) && this.peek().value === ">") {
						this.advance(); // consume >
						typeAnnotation += ">";
					}
				}
			}
			// Check for simple array type syntax: float[], int[], etc.
			else if (this.check(TokenType.LBRACKET)) {
				this.advance(); // consume [
				if (this.check(TokenType.RBRACKET)) {
					this.advance(); // consume ]
					typeAnnotation += "[]";
				}
			}

			// Check if next token is identifier followed by =
			if (
				this.check(TokenType.IDENTIFIER) &&
				this.peekNext()?.type === TokenType.ASSIGN
			) {
				// This is a type-annotated variable declaration
				return this.variableDeclaration(null, typeAnnotation);
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
		if (
			this.check(TokenType.IDENTIFIER) &&
			this.peekNext()?.type === TokenType.ASSIGN &&
			this.peekNext()?.value === "="
		) {
			return this.variableDeclaration(null);
		}

		// Check for assignment: target := expr or target = expr
		const checkpoint = this.current;
		try {
			const target = this.expression();
			if (this.match(TokenType.ASSIGN)) {
				const operator = this.previous().value;
				const value = this.expression();
				return {
					type: "AssignmentStatement",
					target,
					operator,
					value,
					line: target.line,
					column: target.column,
				};
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

		// Check for illegal comma-separated declaration (Pine Script v6 doesn't support this)
		// Extract the first variable but skip the rest (pine-lint behavior)
		if (this.check(TokenType.COMMA)) {
			// Skip everything until newline or EOF
			while (!this.isAtEnd() && !this.check(TokenType.NEWLINE)) {
				this.advance();
			}
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

	private expressionStatement(): AST.ExpressionStatement {
		const expr = this.expression();
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
				}

				// Skip newlines between statements
				while (this.check(TokenType.NEWLINE)) {
					this.advance();
				}

				// Check if next token is at lower indentation
				if (!this.isAtEnd()) {
					const nextIndent = this.peek().indent || 0;
					if (bodyIndent !== null && nextIndent < bodyIndent) {
						break;
					}
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

		const body: AST.Statement[] = [];

		// Skip newlines after to expression
		while (this.check(TokenType.NEWLINE)) {
			this.advance();
		}

		// Parse the loop body using indentation tracking
		let bodyIndent: number | null = null;

		while (!this.isAtEnd()) {
			const currentToken = this.peek();
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
				const result = this.expression();
				cases.push({ result });
				continue;
			}

			// Parse condition => result
			const condition = this.expression();
			if (this.match(TokenType.ARROW)) {
				const result = this.expression();
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

	private parseFunctionParams(): AST.FunctionParam[] {
		const params: AST.FunctionParam[] = [];

		if (this.check(TokenType.RPAREN)) {
			return params; // No parameters
		}

		do {
			const paramName = this.consume(
				TokenType.IDENTIFIER,
				"Expected parameter name",
			);

			let defaultValue: AST.Expression | undefined;
			if (this.match(TokenType.ASSIGN)) {
				defaultValue = this.expression();
			}

			params.push({
				name: paramName.value,
				defaultValue,
			});
		} while (this.match(TokenType.COMMA));

		return params;
	}

	private expression(): AST.Expression {
		return this.ternary();
	}

	private ternary(): AST.Expression {
		const expr = this.logicalOr();

		if (this.match(TokenType.TERNARY)) {
			const consequent = this.expression();
			this.consume(TokenType.COLON, 'Expected ":" in ternary expression');
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
						nextToken.type === TokenType.LBRACKET ||
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

				// Consume type identifier(s) - could be "float", "int", "box", etc.
				if (this.check(TokenType.IDENTIFIER) || this.check(TokenType.KEYWORD)) {
					this.advance();
					// Handle nested generics like array<array<float>>
					while (this.check(TokenType.COMPARE) && this.peek().value === "<") {
						this.advance();
						if (
							this.check(TokenType.IDENTIFIER) ||
							this.check(TokenType.KEYWORD)
						) {
							this.advance();
						}
						if (this.check(TokenType.COMPARE) && this.peek().value === ">") {
							this.advance();
						}
					}
					// Consume closing >
					if (this.check(TokenType.COMPARE) && this.peek().value === ">") {
						this.advance();
						// Now should see ( for function call
						if (this.match(TokenType.LPAREN)) {
							expr = this.finishCall(expr);
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

	private finishCall(callee: AST.Expression): AST.CallExpression {
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

		return {
			type: "CallExpression",
			callee,
			arguments: args,
			line: callee.line,
			column: callee.column,
		};
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

		if (this.match([TokenType.KEYWORD, ["na"]])) {
			const token = this.previous();
			return {
				type: "Literal",
				value: "na",
				raw: "na",
				line: token.line,
				column: token.column,
			};
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

		// Switch expression (v6)
		if (this.match([TokenType.KEYWORD, ["switch"]])) {
			return this.switchExpression();
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
