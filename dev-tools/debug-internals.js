#!/usr/bin/env node
/**
 * Debug internal Pine Script modules directly
 *
 * Usage:
 *   node dev-tools/debug-internals.js lookup <name>       # Check if symbol exists
 *   node dev-tools/debug-internals.js parse 'code'        # Parse and show AST
 *   node dev-tools/debug-internals.js validate 'code'     # Validate with full details
 *   node dev-tools/debug-internals.js tokens 'code'       # Show lexer tokens
 *   node dev-tools/debug-internals.js symbols [filter]    # List built-in symbols
 *   node dev-tools/debug-internals.js symbol-table 'code' # Show symbol table after parsing
 *   node dev-tools/debug-internals.js analyze [options]   # Analyze comparison results
 *   node dev-tools/debug-internals.js corpus [options]    # Analyze pinescripts corpus
 *
 * Analyze options:
 *   --filter <text>     Filter errors/discrepancies by message
 *   --cli-errors        Show CLI errors (default: show discrepancies)
 *   --summary           Show summary counts only
 *   --files             Show which files have matching errors
 *   --limit <n>         Limit output (default: 50)
 *
 * Corpus options:
 *   --v6                Only analyze v6 scripts (default)
 *   --all               Analyze all scripts regardless of version
 *   --errors            Show files with parse errors
 *   --clean             Show files without parse errors
 *   --summary           Show summary counts only
 *
 * Examples:
 *   node dev-tools/debug-internals.js lookup hour
 *   node dev-tools/debug-internals.js lookup array.new
 *   node dev-tools/debug-internals.js parse 'x = 1 + 2'
 *   node dev-tools/debug-internals.js tokens 'x = [1, 2]'
 *   node dev-tools/debug-internals.js validate '//@version=6
 *   indicator("test")
 *   x = hour'
 *   node dev-tools/debug-internals.js symbols hour
 *   node dev-tools/debug-internals.js analyze --filter "Unexpected token"
 *   node dev-tools/debug-internals.js analyze --cli-errors --filter "unknown"
 *   node dev-tools/debug-internals.js analyze --summary
 *   node dev-tools/debug-internals.js corpus --summary
 *   node dev-tools/debug-internals.js corpus --errors
 */

const path = require("node:path");
const fs = require("node:fs");

const DIST_ROOT = path.join(__dirname, "../dist");

// Lazy load modules to avoid errors if not built
function loadModule(modulePath) {
	try {
		return require(path.join(DIST_ROOT, modulePath));
	} catch (e) {
		console.error(`Failed to load ${modulePath}. Did you run 'pnpm run build'?`);
		console.error(e.message);
		process.exit(1);
	}
}

function cmdLookup(name) {
	const { VARIABLES_BY_NAME, FUNCTIONS_BY_NAME, CONSTANTS_BY_NAME } =
		loadModule("pine-data/v6/index.js");

	console.log(`Looking up: "${name}"\n`);

	const variable = VARIABLES_BY_NAME.get(name);
	if (variable) {
		console.log("VARIABLE:", JSON.stringify(variable, null, 2));
	}

	const func = FUNCTIONS_BY_NAME.get(name);
	if (func) {
		console.log("FUNCTION:", JSON.stringify(func, null, 2));
	}

	const constant = CONSTANTS_BY_NAME.get(name);
	if (constant) {
		console.log("CONSTANT:", JSON.stringify(constant, null, 2));
	}

	if (!variable && !func && !constant) {
		console.log("Not found in VARIABLES, FUNCTIONS, or CONSTANTS.");

		// Check if it's namespaced
		if (!name.includes(".")) {
			const { PineV6 } = loadModule("pine-data/v6/index.js");
			const namespaces = PineV6.getAllNamespaces();
			if (namespaces.includes(name)) {
				console.log(`\n"${name}" is a NAMESPACE.`);
				const members = PineV6.getNamespaceMembers(name);
				console.log("Members:", members.slice(0, 10).join(", ") + (members.length > 10 ? "..." : ""));
			}
		}
	}
}

function cmdParse(code) {
	const { Parser } = loadModule("packages/core/src/parser/parser.js");

	// Add version header if missing
	if (!code.includes("@version")) {
		code = `//@version=6\nindicator("test")\n${code}`;
	}

	const parser = new Parser(code);
	const ast = parser.parse();

	console.log("AST:");
	console.log(JSON.stringify(ast, null, 2));

	if (parser.errors && parser.errors.length > 0) {
		console.log("\nParse Errors:");
		for (const err of parser.errors) {
			console.log(`  [${err.line}:${err.column}] ${err.message}`);
		}
	}
}

function cmdTokens(code) {
	const { Lexer } = loadModule("packages/core/src/parser/lexer.js");

	const lexer = new Lexer(code);
	const tokens = lexer.tokenize();

	console.log("Tokens:\n");
	console.log("  #   Type            Value              Line  Col   Indent");
	console.log("  " + "-".repeat(65));

	let idx = 0;
	for (const t of tokens) {
		// Skip whitespace for cleaner output
		if (t.type === "WHITESPACE") continue;

		const value = t.value.replace(/\n/g, "\\n").replace(/\t/g, "\\t");
		const displayValue = value.length > 16 ? value.slice(0, 13) + "..." : value;

		console.log(
			`  ${idx.toString().padStart(3)}  ` +
			`${t.type.padEnd(15)} ` +
			`${JSON.stringify(displayValue).padEnd(18)} ` +
			`${t.line.toString().padStart(4)}  ` +
			`${(t.column || 0).toString().padStart(4)}  ` +
			`${(t.indent ?? "-").toString().padStart(6)}`
		);
		idx++;
	}

	console.log(`\nTotal: ${idx} tokens (excluding whitespace)`);
}

function cmdValidate(code) {
	const { Parser } = loadModule("packages/core/src/parser/parser.js");
	const { UnifiedPineValidator } = loadModule("packages/core/src/analyzer/checker.js");

	// Add version header if missing
	if (!code.includes("@version")) {
		code = `//@version=6\nindicator("test")\n${code}`;
	}

	const parser = new Parser(code);
	const ast = parser.parse();

	if (parser.errors && parser.errors.length > 0) {
		console.log("Parse Errors:");
		for (const err of parser.errors) {
			console.log(`  [${err.line}:${err.column}] ${err.message}`);
		}
		console.log("");
	}

	const validator = new UnifiedPineValidator();
	const errors = validator.validate(ast);

	if (errors.length === 0) {
		console.log("No validation errors.");
	} else {
		console.log("Validation Errors:");
		for (const err of errors) {
			const loc = err.start ? `${err.start.line}:${err.start.column}` : "?:?";
			console.log(`  [${loc}] ${err.message}`);
		}
		console.log(`\nTotal: ${errors.length} error(s)`);
	}
}

function cmdSymbols(filter) {
	const { VARIABLES_BY_NAME, FUNCTIONS_BY_NAME, CONSTANTS_BY_NAME } =
		loadModule("pine-data/v6/index.js");

	const results = [];

	for (const [name, v] of VARIABLES_BY_NAME) {
		if (!filter || name.includes(filter)) {
			results.push({ name, kind: "variable", type: v.type });
		}
	}

	for (const [name, f] of FUNCTIONS_BY_NAME) {
		if (!filter || name.includes(filter)) {
			results.push({ name, kind: "function", returns: f.returns });
		}
	}

	for (const [name, c] of CONSTANTS_BY_NAME) {
		if (!filter || name.includes(filter)) {
			results.push({ name, kind: "constant", type: c.type });
		}
	}

	// Sort by name
	results.sort((a, b) => a.name.localeCompare(b.name));

	if (results.length === 0) {
		console.log(`No symbols matching "${filter}"`);
	} else {
		console.log(`Found ${results.length} symbol(s):\n`);
		for (const r of results.slice(0, 50)) {
			const typeInfo = r.type || r.returns || "?";
			console.log(`  [${r.kind.padEnd(8)}] ${r.name}: ${typeInfo}`);
		}
		if (results.length > 50) {
			console.log(`  ... and ${results.length - 50} more`);
		}
	}
}

function cmdSymbolTable(code) {
	const { Parser } = loadModule("packages/core/src/parser/parser.js");
	const { UnifiedPineValidator } = loadModule("packages/core/src/analyzer/checker.js");
	const { SymbolTable } = loadModule("packages/core/src/analyzer/symbols.js");

	// Add version header if missing
	if (!code.includes("@version")) {
		code = `//@version=6\nindicator("test")\n${code}`;
	}

	const parser = new Parser(code);
	const ast = parser.parse();

	// Create fresh symbol table and show initial state
	const st = new SymbolTable();

	console.log("Initial Symbol Table (built-ins):");
	const globalSymbols = st.getGlobalScope().getAllSymbols();
	const userRelevant = globalSymbols.filter(s =>
		!s.name.includes(".") &&
		["hour", "minute", "close", "open", "high", "low", "volume", "time", "na"].includes(s.name)
	);
	for (const s of userRelevant) {
		console.log(`  [${s.kind.padEnd(8)}] ${s.name}: ${s.type}`);
	}
	console.log(`  ... and ${globalSymbols.length - userRelevant.length} more built-ins\n`);

	// Now validate to populate user-defined symbols
	const validator = new UnifiedPineValidator();
	validator.validate(ast);

	// Show what lookup returns for common names
	console.log("Symbol Lookups:");
	const testNames = ["hour", "minute", "close", "na", "x", "y"];
	for (const name of testNames) {
		const sym = st.lookup(name);
		if (sym) {
			console.log(`  ${name}: ${sym.type} (${sym.kind})`);
		}
	}
}

function cmdAnalyze(args) {
	const DIFF_DIR = path.join(__dirname, "../plan/pine-lint-vs-cli-differences");

	// Parse options
	let filter = null;
	let showCliErrors = false;
	let summaryOnly = false;
	let showFiles = false;
	let limit = 50;

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (arg === "--filter" && args[i + 1]) {
			filter = args[++i];
		} else if (arg === "--cli-errors") {
			showCliErrors = true;
		} else if (arg === "--summary") {
			summaryOnly = true;
		} else if (arg === "--files") {
			showFiles = true;
		} else if (arg === "--limit" && args[i + 1]) {
			limit = parseInt(args[++i], 10);
		}
	}

	// Check if directory exists
	if (!fs.existsSync(DIFF_DIR)) {
		console.error(`Differences directory not found: ${DIFF_DIR}`);
		console.error("Run 'node dev-tools/analysis/compare-validation-results.js' first.");
		process.exit(1);
	}

	// Read all JSON files
	const files = fs.readdirSync(DIFF_DIR)
		.filter(f => f.endsWith(".json") && !f.startsWith("_"))
		.map(f => path.join(DIFF_DIR, f));

	if (files.length === 0) {
		console.error("No comparison result files found.");
		process.exit(1);
	}

	// Collect errors/discrepancies
	const results = [];
	const messageCounts = new Map();
	const fileMatches = new Map();

	for (const file of files) {
		try {
			const data = JSON.parse(fs.readFileSync(file, "utf8"));
			const basename = path.basename(file);

			if (showCliErrors) {
				// Show CLI errors from raw.cliErrors
				const errors = data.raw?.cliErrors || [];
				for (const err of errors) {
					const msg = err.message || "";
					if (!filter || msg.toLowerCase().includes(filter.toLowerCase())) {
						results.push({ file: basename, line: err.start?.line, message: msg });
						messageCounts.set(msg, (messageCounts.get(msg) || 0) + 1);
						if (!fileMatches.has(basename)) fileMatches.set(basename, []);
						fileMatches.get(basename).push(msg);
					}
				}
			} else {
				// Show discrepancies
				const discrepancies = data.discrepancies || [];
				for (const disc of discrepancies) {
					const msg = disc.message || "";
					if (!filter || msg.toLowerCase().includes(filter.toLowerCase())) {
						results.push({ file: basename, type: disc.type, message: msg });
						messageCounts.set(msg, (messageCounts.get(msg) || 0) + 1);
						if (!fileMatches.has(basename)) fileMatches.set(basename, []);
						fileMatches.get(basename).push(msg);
					}
				}
			}
		} catch (e) {
			// Skip invalid JSON files
		}
	}

	// Output
	if (summaryOnly) {
		// Group by message and show counts
		const sorted = [...messageCounts.entries()].sort((a, b) => b[1] - a[1]);
		console.log(`Found ${results.length} matching ${showCliErrors ? "CLI errors" : "discrepancies"} across ${fileMatches.size} files:\n`);
		for (const [msg, count] of sorted.slice(0, limit)) {
			console.log(`  [${count.toString().padStart(4)}] ${msg.slice(0, 80)}${msg.length > 80 ? "..." : ""}`);
		}
		if (sorted.length > limit) {
			console.log(`  ... and ${sorted.length - limit} more unique messages`);
		}
	} else if (showFiles) {
		// Show files with matches
		console.log(`Files with matching ${showCliErrors ? "CLI errors" : "discrepancies"}:\n`);
		const sorted = [...fileMatches.entries()].sort((a, b) => b[1].length - a[1].length);
		for (const [file, msgs] of sorted.slice(0, limit)) {
			console.log(`  ${file}: ${msgs.length} match(es)`);
		}
		if (sorted.length > limit) {
			console.log(`  ... and ${sorted.length - limit} more files`);
		}
	} else {
		// Show individual results
		console.log(`Found ${results.length} matching ${showCliErrors ? "CLI errors" : "discrepancies"}:\n`);
		for (const r of results.slice(0, limit)) {
			const loc = r.line ? `:${r.line}` : "";
			console.log(`  [${r.file}${loc}] ${r.message}`);
		}
		if (results.length > limit) {
			console.log(`\n  ... and ${results.length - limit} more (use --limit to see more)`);
		}
	}

	console.log(`\nTotal: ${results.length} result(s) in ${fileMatches.size} file(s)`);
}

function cmdCorpus(args) {
	const { execSync } = require("node:child_process");

	const CORPUS_BASE = path.join(__dirname, "../pinescripts");
	const CLI_PATH = path.join(__dirname, "../dist/packages/cli/src/cli.js");
	const DIRS = ["indicators-processed", "strategies-todo"];

	// Parse options
	let v6Only = true;
	let showErrors = false;
	let showClean = false;
	let summaryOnly = false;

	for (const arg of args) {
		if (arg === "--all") v6Only = false;
		else if (arg === "--v6") v6Only = true;
		else if (arg === "--errors") showErrors = true;
		else if (arg === "--clean") showClean = true;
		else if (arg === "--summary") summaryOnly = true;
	}

	// Default to summary if no specific view requested
	if (!showErrors && !showClean) {
		summaryOnly = true;
	}

	const results = {
		total: 0,
		clean: [],
		withErrors: [],
		failed: [],
	};
	const errorCounts = new Map();

	for (const dir of DIRS) {
		const dirPath = path.join(CORPUS_BASE, dir);
		if (!fs.existsSync(dirPath)) continue;

		const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".pine"));

		for (const file of files) {
			const filePath = path.join(dirPath, file);
			const content = fs.readFileSync(filePath, "utf8");

			// Check version if v6Only
			if (v6Only) {
				const versionMatch = content.match(/@version=(\d+)/);
				if (!versionMatch || versionMatch[1] !== "6") continue;
			}

			results.total++;

			try {
				const output = execSync(`node "${CLI_PATH}" "${filePath}"`, {
					encoding: "utf8",
					maxBuffer: 10 * 1024 * 1024,
					timeout: 30000,
				});
				const json = JSON.parse(output);
				const errors = json.result?.errors || [];

				// Filter to parse errors only
				const parseErrors = errors.filter(
					(e) =>
						e.message.includes("Unexpected token") ||
						e.message.includes("Expected") ||
						e.message.includes("mismatched character")
				);

				if (parseErrors.length > 0) {
					results.withErrors.push({
						file: `${dir}/${file}`,
						count: parseErrors.length,
						first: parseErrors[0].message,
					});
					for (const e of parseErrors) {
						const key = e.message.replace(/at line \d+/, "at line N");
						errorCounts.set(key, (errorCounts.get(key) || 0) + 1);
					}
				} else {
					results.clean.push(`${dir}/${file}`);
				}
			} catch (e) {
				results.failed.push(`${dir}/${file}`);
			}
		}
	}

	// Output
	const versionLabel = v6Only ? "v6" : "all";
	console.log(`=== Pine Script Corpus Analysis (${versionLabel}) ===\n`);
	console.log(`Total scripts: ${results.total}`);
	console.log(`Clean (no parse errors): ${results.clean.length}`);
	console.log(`With parse errors: ${results.withErrors.length}`);
	console.log(`Failed to analyze: ${results.failed.length}`);

	if (results.total > 0) {
		const pct = ((results.clean.length / results.total) * 100).toFixed(1);
		console.log(`\nSuccess rate: ${pct}%`);
	}

	if (showErrors && results.withErrors.length > 0) {
		console.log("\nFiles with parse errors:");
		for (const f of results.withErrors) {
			console.log(`  ${f.file}: ${f.count} errors - "${f.first}"`);
		}
	}

	if (showClean && results.clean.length > 0) {
		console.log("\nClean files:");
		for (const f of results.clean.slice(0, 50)) {
			console.log(`  ${f}`);
		}
		if (results.clean.length > 50) {
			console.log(`  ... and ${results.clean.length - 50} more`);
		}
	}

	if (summaryOnly && errorCounts.size > 0) {
		console.log("\nParse error types by frequency:");
		const sorted = [...errorCounts.entries()].sort((a, b) => b[1] - a[1]);
		for (const [msg, count] of sorted.slice(0, 20)) {
			const displayMsg = msg.length > 60 ? msg.slice(0, 57) + "..." : msg;
			console.log(`  ${count.toString().padStart(4)} x ${displayMsg}`);
		}
		if (sorted.length > 20) {
			console.log(`  ... and ${sorted.length - 20} more error types`);
		}
	}

	if (results.failed.length > 0) {
		console.log("\nFailed files (timeout/crash):");
		for (const f of results.failed) {
			console.log(`  ${f}`);
		}
	}
}

function main() {
	const args = process.argv.slice(2);
	const command = args[0];

	if (!command) {
		console.log("Usage: node dev-tools/debug-internals.js <command> [args]");
		console.log("");
		console.log("Commands:");
		console.log("  lookup <name>        Check if symbol exists in pine-data");
		console.log("  parse 'code'         Parse code and show AST");
		console.log("  validate 'code'      Validate code with full error details");
		console.log("  tokens 'code'        Show lexer tokens with type/line/indent");
		console.log("  symbols [filter]     List built-in symbols (optionally filtered)");
		console.log("  symbol-table 'code'  Show symbol table state");
		console.log("  analyze [options]    Analyze comparison results");
		console.log("  corpus [options]     Analyze pinescripts corpus for parse errors");
		console.log("");
		console.log("Analyze options:");
		console.log("  --filter <text>      Filter by message content");
		console.log("  --cli-errors         Show CLI errors (default: discrepancies)");
		console.log("  --summary            Show grouped counts");
		console.log("  --files              Show files with matches");
		console.log("  --limit <n>          Limit results (default: 50)");
		console.log("");
		console.log("Corpus options:");
		console.log("  --v6                 Only v6 scripts (default)");
		console.log("  --all                All scripts regardless of version");
		console.log("  --errors             Show files with parse errors");
		console.log("  --clean              Show clean files");
		console.log("  --summary            Show error type frequency");
		process.exit(1);
	}

	switch (command) {
		case "lookup":
			if (!args[1]) {
				console.error("Usage: lookup <name>");
				process.exit(1);
			}
			cmdLookup(args[1]);
			break;

		case "parse":
			if (!args[1]) {
				console.error("Usage: parse 'code'");
				process.exit(1);
			}
			cmdParse(args[1]);
			break;

		case "tokens":
			if (!args[1]) {
				console.error("Usage: tokens 'code'");
				process.exit(1);
			}
			cmdTokens(args[1]);
			break;

		case "validate":
			if (!args[1]) {
				console.error("Usage: validate 'code'");
				process.exit(1);
			}
			cmdValidate(args[1]);
			break;

		case "symbols":
			cmdSymbols(args[1] || null);
			break;

		case "symbol-table":
			if (!args[1]) {
				console.error("Usage: symbol-table 'code'");
				process.exit(1);
			}
			cmdSymbolTable(args[1]);
			break;

		case "analyze":
			cmdAnalyze(args.slice(1));
			break;

		case "corpus":
			cmdCorpus(args.slice(1));
			break;

		default:
			console.error(`Unknown command: ${command}`);
			process.exit(1);
	}
}

main();
