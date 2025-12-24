#!/usr/bin/env node
/**
 * Test Pine Script snippets via CLI without manual temp file management
 *
 * Usage:
 *   node dev-tools/test-snippet.js 'code here'
 *   node dev-tools/test-snippet.js -f file.pine
 *   node dev-tools/test-snippet.js --errors 'code here'     # Only show errors
 *   node dev-tools/test-snippet.js --filter unknown 'code'  # Filter by message
 *   echo 'code' | node dev-tools/test-snippet.js -
 *
 * Examples:
 *   node dev-tools/test-snippet.js '//@version=6
 *   indicator("test")
 *   bool isOpen = hour >= 9'
 *
 *   node dev-tools/test-snippet.js --errors '//@version=6
 *   indicator("test")
 *   x = unknownVar'
 */

const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { spawnSync } = require("node:child_process");

const CLI_PATH = path.join(__dirname, "../dist/packages/cli/src/cli.js");

function runCli(code) {
	const tmpFile = path.join(
		os.tmpdir(),
		`pine-test-${Date.now()}-${Math.random().toString(36).slice(2)}.pine`,
	);

	try {
		fs.writeFileSync(tmpFile, code);

		const result = spawnSync("node", [CLI_PATH, tmpFile], {
			encoding: "utf8",
			maxBuffer: 10 * 1024 * 1024,
		});

		const output = result.stdout || "";

		try {
			return JSON.parse(output);
		} catch {
			return {
				success: false,
				parseError: true,
				stdout: output,
				stderr: result.stderr,
			};
		}
	} finally {
		try {
			fs.unlinkSync(tmpFile);
		} catch {
			// Ignore cleanup errors
		}
	}
}

function main() {
	const args = process.argv.slice(2);
	let code = null;
	let onlyErrors = false;
	let filter = null;
	let fromFile = null;
	let fromStdin = false;

	// Parse arguments
	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (arg === "--errors" || arg === "-e") {
			onlyErrors = true;
		} else if (arg === "--filter") {
			filter = args[++i];
		} else if (arg === "-f" || arg === "--file") {
			fromFile = args[++i];
		} else if (arg === "-") {
			fromStdin = true;
		} else if (!arg.startsWith("-")) {
			code = arg;
		}
	}

	// Get code from appropriate source
	if (fromFile) {
		code = fs.readFileSync(fromFile, "utf8");
	} else if (fromStdin) {
		code = fs.readFileSync(0, "utf8"); // stdin
	} else if (!code) {
		console.error("Usage: node dev-tools/test-snippet.js [options] 'code'");
		console.error("       node dev-tools/test-snippet.js -f file.pine");
		console.error("       echo 'code' | node dev-tools/test-snippet.js -");
		console.error("");
		console.error("Options:");
		console.error("  --errors, -e     Only show errors");
		console.error("  --filter <text>  Filter errors by message substring");
		console.error("  -f, --file       Read code from file");
		console.error("  -                Read code from stdin");
		process.exit(1);
	}

	const result = runCli(code);

	if (result.parseError) {
		console.error("Failed to parse CLI output:");
		console.error(result.stdout);
		console.error(result.stderr);
		process.exit(1);
	}

	if (onlyErrors || filter) {
		let errors = result.result?.errors || [];
		if (filter) {
			errors = errors.filter((e) =>
				e.message?.toLowerCase().includes(filter.toLowerCase()),
			);
		}
		if (errors.length === 0) {
			console.log("No matching errors.");
		} else {
			for (const err of errors) {
				const loc = err.start ? `${err.start.line}:${err.start.column}` : "?:?";
				console.log(`[${loc}] ${err.message}`);
			}
			console.log(`\nTotal: ${errors.length} error(s)`);
		}
	} else {
		console.log(JSON.stringify(result, null, 2));
	}
}

main();
