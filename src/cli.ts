#!/usr/bin/env node

import * as fs from "node:fs";
import * as path from "node:path";
import {
	ComprehensiveValidator,
	type ValidationError,
} from "./parser/comprehensiveValidator";
import { Parser } from "./parser/parser";

interface FileResult {
	file: string;
	errors: ValidationError[];
	success: boolean;
}

async function main() {
	const args = process.argv.slice(2);

	if (args.length === 0) {
		console.error("Usage: pine-validate <file1.pine> [file2.pine ...]");
		process.exit(1);
	}

	const results: FileResult[] = [];

	for (const filePath of args) {
		const absolutePath = path.resolve(filePath);
		if (!fs.existsSync(absolutePath)) {
			results.push({
				file: filePath,
				errors: [
					{
						line: 0,
						column: 0,
						message: `File not found: ${filePath}`,
						severity: 0,
					},
				],
				success: false,
			});
			continue;
		}

		try {
			const code = fs.readFileSync(absolutePath, "utf-8");
			const parser = new Parser(code);
			const ast = parser.parse();
			const validator = new ComprehensiveValidator();
			const errors = validator.validate(ast);

			results.push({
				file: filePath,
				errors: errors,
				success: errors.filter((e) => e.severity === 0).length === 0,
			});
		} catch (e: unknown) {
			const error = e as {
				loc?: { line: number; column: number };
				message?: string;
			};
			results.push({
				file: filePath,
				errors: [
					{
						line: error.loc?.line || 0,
						column: error.loc?.column || 0,
						length: 0,
						message: error.message || String(e),
						severity: 0,
					},
				],
				success: false,
			});
		}
	}

	console.log(JSON.stringify(results, null, 2));

	const hasErrors = results.some((r) => !r.success);
	process.exit(hasErrors ? 1 : 0);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
