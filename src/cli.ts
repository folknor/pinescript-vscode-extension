#!/usr/bin/env node

import * as fs from "node:fs";
import * as path from "node:path";
import {
	ASTExtractor,
	type PineLintError,
	type PineLintOutput,
} from "./parser/astExtractor";
import { Parser } from "./parser/parser";
import { SemanticAnalyzer } from "./parser/semanticAnalyzer";
import {
	DiagnosticSeverity,
	UnifiedPineValidator,
} from "./parser/unifiedValidator";

async function main() {
	const args = process.argv.slice(2);

	if (args.length === 0) {
		console.error("Usage: pine-validate <file.pine>");
		process.exit(1);
	}

	// Match pine-lint behavior: single file
	const filePath = args[0];
	const absolutePath = path.resolve(filePath);

	if (!fs.existsSync(absolutePath)) {
		const output: PineLintOutput = {
			success: false,
			error: `File not found: ${filePath}`,
		};
		console.log(JSON.stringify(output, null, 2));
		process.exit(1);
	}

	try {
		const code = fs.readFileSync(absolutePath, "utf-8");
		const parser = new Parser(code);
		const ast = parser.parse();

		// Get lexer errors first (string validation, etc.)
		const lexerErrors = parser.getLexerErrors();

		// Get detected version for version-aware validation
		const detectedVersion = parser.getDetectedVersion() || "6"; // Default to v6 if not detected

		const extractor = new ASTExtractor();
		const result = extractor.extract(ast);

		// Run validation to get errors (version-aware)
		const validator = new UnifiedPineValidator();
		const validationErrors = validator.validate(ast, detectedVersion);

		// Run semantic analysis to get warnings (only for v6)
		const semanticWarnings = [];
		if (detectedVersion === "6") {
			const semanticAnalyzer = new SemanticAnalyzer();
			semanticWarnings.push(...semanticAnalyzer.analyze(ast));
		}

		// Convert lexer errors to pine-lint format
		const lexerPineLintErrors: PineLintError[] = lexerErrors.map((e) => ({
			start: { line: e.line, column: e.column },
			end: { line: e.line, column: e.column + 1 },
			message: e.message,
		}));

		// Convert validation errors to pine-lint format (only errors, not warnings)
		const validationPineLintErrors: PineLintError[] = validationErrors
			.filter((e) => e.severity === DiagnosticSeverity.Error)
			.map((e) => ({
				start: { line: e.line, column: e.column },
				end: { line: e.line, column: e.column + e.length },
				message: e.message,
			}));

		// Convert semantic warnings to pine-lint format (warnings)
		const semanticPineLintWarnings: PineLintError[] = semanticWarnings
			.filter((w) => w.severity === DiagnosticSeverity.Warning)
			.map((w) => ({
				start: { line: w.line, column: w.column },
				end: { line: w.line, column: w.column + w.length },
				message: w.message,
			}));

		// Combine all errors (lexer errors first)
		const errors: PineLintError[] = [
			...lexerPineLintErrors,
			...validationPineLintErrors,
		];

		// Combine all warnings
		const warnings: PineLintError[] = [...semanticPineLintWarnings];

		if (errors.length > 0) {
			result.errors = errors;
		}

		if (warnings.length > 0) {
			result.warnings = warnings;
		}

		const output: PineLintOutput = {
			success: true,
			result,
		};
		console.log(JSON.stringify(output, null, 2));
		process.exit(0);
	} catch (e: unknown) {
		const error = e as { message?: string };
		const output: PineLintOutput = {
			success: false,
			error: error.message || String(e),
		};
		console.log(JSON.stringify(output, null, 2));
		process.exit(1);
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
