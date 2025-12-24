#!/usr/bin/env node
/**
 * Generate TextMate grammar (pine.tmLanguage.json) from pine-data
 *
 * This generates syntax highlighting patterns from the scraped data,
 * ensuring the grammar stays in sync with the actual Pine Script API.
 *
 * Usage: pnpm run generate:syntax
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PINE_DATA_DIR = path.join(__dirname, "../../../pine-data/v6");
const OUTPUT_FILE = path.join(__dirname, "../../../syntaxes/pine.tmLanguage.json");

// Load pine-data
function loadPineData() {
	const functionsPath = path.join(PINE_DATA_DIR, "functions.ts");
	const constantsPath = path.join(PINE_DATA_DIR, "constants.ts");
	const variablesPath = path.join(PINE_DATA_DIR, "variables.ts");

	// Parse TypeScript files to extract data
	// We'll use regex to extract the data since these are simple Map definitions
	const functionsContent = fs.readFileSync(functionsPath, "utf-8");
	const constantsContent = fs.readFileSync(constantsPath, "utf-8");
	const variablesContent = fs.readFileSync(variablesPath, "utf-8");

	return {
		functions: extractFunctions(functionsContent),
		constants: extractConstants(constantsContent),
		variables: extractVariables(variablesContent),
	};
}

function extractFunctions(content: string): Map<string, string[]> {
	// Group functions by namespace
	const byNamespace = new Map<string, string[]>();

	// Match function names like "name": "ta.sma" or "name": "alert"
	const regex = /"name":\s*"([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)?)"/g;
	let match;
	while ((match = regex.exec(content)) !== null) {
		const fullName = match[1];
		if (fullName.includes(".")) {
			const [namespace, funcName] = fullName.split(".");
			if (!byNamespace.has(namespace)) {
				byNamespace.set(namespace, []);
			}
			byNamespace.get(namespace)!.push(funcName);
		} else {
			// Global function
			if (!byNamespace.has("_global")) {
				byNamespace.set("_global", []);
			}
			byNamespace.get("_global")!.push(fullName);
		}
	}

	return byNamespace;
}

function extractConstants(content: string): Map<string, string[]> {
	// Group constants by namespace
	const byNamespace = new Map<string, string[]>();

	// Match constant names like "name": "color.red"
	const regex = /"name":\s*"([a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z_][a-zA-Z0-9_]*)"/g;
	let match;
	while ((match = regex.exec(content)) !== null) {
		const fullName = match[1];
		const [namespace, constName] = fullName.split(".");
		if (!byNamespace.has(namespace)) {
			byNamespace.set(namespace, []);
		}
		byNamespace.get(namespace)!.push(constName);
	}

	return byNamespace;
}

function extractVariables(content: string): { standalone: string[]; namespaced: Map<string, string[]> } {
	const standalone: string[] = [];
	const namespaced = new Map<string, string[]>();

	// Match variable names like "name": "close" or "name": "syminfo.tickerid"
	const regex = /"name":\s*"([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)?)"/g;
	let match;
	while ((match = regex.exec(content)) !== null) {
		const fullName = match[1];
		if (fullName.includes(".")) {
			const [namespace, varName] = fullName.split(".");
			if (!namespaced.has(namespace)) {
				namespaced.set(namespace, []);
			}
			namespaced.get(namespace)!.push(varName);
		} else {
			standalone.push(fullName);
		}
	}

	return { standalone, namespaced };
}

function escapeRegex(str: string): string {
	return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function generateGrammar(data: ReturnType<typeof loadPineData>) {
	const { functions, constants, variables } = data;

	// Get all namespaces
	const allNamespaces = new Set<string>();
	for (const ns of functions.keys()) {
		if (ns !== "_global") allNamespaces.add(ns);
	}
	for (const ns of constants.keys()) {
		allNamespaces.add(ns);
	}
	for (const ns of variables.namespaced.keys()) {
		allNamespaces.add(ns);
	}

	// Build the grammar object
	const grammar = {
		$schema: "https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json",
		name: "Pine Script",
		scopeName: "source.pine",
		patterns: [
			{ include: "#annotations" },
			{ include: "#comments" },
			{ include: "#strings" },
			{ include: "#numbers" },
			{ include: "#booleans" },
			{ include: "#keywords" },
			{ include: "#storage" },
			{ include: "#types" },
			{ include: "#constants" },
			{ include: "#operators" },
			{ include: "#function-declarations" },
			{ include: "#function-calls" },
			{ include: "#method-calls" },
			{ include: "#namespaces" },
			{ include: "#variables" },
		],
		repository: {
			// === HARDCODED GRAMMAR FUNDAMENTALS ===
			annotations: {
				patterns: [
					{
						name: "comment.line.annotation.pine",
						match: "^\\s*(//\\s*@(version|strategy_alert_message|description))\\s*(=)?\\s*(.*)$",
						captures: {
							"1": { name: "keyword.control.annotation.pine" },
							"2": { name: "entity.name.tag.annotation.pine" },
							"3": { name: "keyword.operator.assignment.pine" },
							"4": { name: "constant.numeric.annotation.pine" },
						},
					},
				],
			},
			comments: {
				patterns: [
					{
						name: "comment.block.pine",
						begin: "/\\*",
						end: "\\*/",
						captures: { "0": { name: "punctuation.definition.comment.pine" } },
					},
					{
						name: "comment.line.double-slash.pine",
						match: "//.*$",
						captures: { "0": { name: "punctuation.definition.comment.pine" } },
					},
				],
			},
			strings: {
				patterns: [
					{
						name: "string.quoted.double.pine",
						begin: '"',
						end: '"',
						patterns: [
							{ name: "constant.character.escape.pine", match: '\\\\(["\\\\/bfnrt]|u[0-9a-fA-F]{4})' },
							{ name: "invalid.illegal.unrecognized-string-escape.pine", match: "\\\\." },
						],
					},
					{
						name: "string.quoted.single.pine",
						begin: "'",
						end: "'",
						patterns: [{ name: "constant.character.escape.pine", match: "\\\\(['\\\\/bfnrt]|u[0-9a-fA-F]{4})" }],
					},
				],
			},
			numbers: {
				patterns: [
					{ name: "constant.numeric.hex.pine", match: "\\b0x[0-9A-Fa-f]+\\b" },
					{
						name: "constant.numeric.float.pine",
						match: "\\b([0-9]+\\.[0-9]+([eE][+-]?[0-9]+)?|\\.[0-9]+([eE][+-]?[0-9]+)?)\\b",
					},
					{ name: "constant.numeric.integer.pine", match: "\\b[0-9]+([eE][+-]?[0-9]+)?\\b" },
				],
			},
			booleans: {
				patterns: [{ name: "constant.language.boolean.pine", match: "\\b(true|false)\\b" }],
			},
			keywords: {
				patterns: [
					{ name: "keyword.control.conditional.pine", match: "\\b(if|else|switch|case|default)\\b" },
					{ name: "keyword.control.loop.pine", match: "\\b(for|while|break|continue)\\b" },
					{ name: "keyword.control.flow.pine", match: "\\b(return)\\b" },
					{ name: "keyword.control.import.pine", match: "\\b(import|export|as)\\b" },
					{ name: "keyword.operator.logical.pine", match: "\\b(and|or|not)\\b" },
					{ name: "keyword.other.pine", match: "\\b(method|type|enum|in|to|by)\\b" },
				],
			},
			storage: {
				patterns: [
					{ name: "storage.type.variable.pine", match: "\\b(var|varip)\\b" },
					{ name: "storage.modifier.pine", match: "\\b(const|simple|series|input)\\b" },
				],
			},
			types: {
				patterns: [
					{ name: "support.type.primitive.pine", match: "\\b(int|float|bool|string|color)\\b" },
					{ name: "support.type.object.pine", match: "\\b(line|label|box|table|array|matrix|map|polyline|chart\\.point)\\b" },
					{ name: "support.type.special.pine", match: "\\b(void|na)\\b" },
				],
			},
			operators: {
				patterns: [
					{ name: "keyword.operator.assignment.pine", match: "(:=|=)" },
					{ name: "keyword.operator.comparison.pine", match: "(==|!=|<=|>=|<|>)" },
					{ name: "keyword.operator.arithmetic.pine", match: "(\\+|-|\\*|/|%)" },
					{ name: "keyword.operator.ternary.pine", match: "(\\?|:)" },
					{ name: "keyword.operator.arrow.pine", match: "(=>)" },
				],
			},
			"function-declarations": {
				patterns: [
					{
						name: "meta.function.declaration.pine",
						match: "^\\s*([a-zA-Z_][a-zA-Z0-9_]*)\\s*\\(",
						captures: { "1": { name: "entity.name.function.declaration.pine" } },
					},
					{
						name: "support.function.builtin.declaration.pine",
						match: "\\b(indicator|strategy|library)\\s*\\(",
						captures: { "1": { name: "entity.name.function.builtin.pine" } },
					},
				],
			},

			// === GENERATED FROM PINE-DATA ===
			constants: {
				patterns: generateConstantPatterns(constants),
			},
			"function-calls": {
				patterns: generateGlobalFunctionPatterns(functions.get("_global") || []),
			},
			"method-calls": {
				patterns: generateMethodCallPatterns(functions),
			},
			namespaces: {
				patterns: generateNamespacePatterns(allNamespaces),
			},
			variables: {
				patterns: generateVariablePatterns(variables),
			},
		},
	};

	return grammar;
}

function generateConstantPatterns(constants: Map<string, string[]>) {
	const patterns: object[] = [];

	// Add na as a special constant
	patterns.push({
		name: "constant.language.na.pine",
		match: "\\bna\\b",
	});

	// Generate patterns for each namespace
	for (const [namespace, constNames] of constants.entries()) {
		if (constNames.length === 0) continue;

		// Escape and join constant names
		const escaped = constNames.map(escapeRegex);
		const alternation = escaped.join("|");

		patterns.push({
			name: `support.constant.${namespace}.pine`,
			match: `\\b${escapeRegex(namespace)}\\.(${alternation})\\b`,
		});
	}

	return patterns;
}

function generateGlobalFunctionPatterns(globalFuncs: string[]) {
	const patterns: object[] = [];

	if (globalFuncs.length > 0) {
		// Split into categories for better highlighting
		const plotFuncs = globalFuncs.filter((f) =>
			["plot", "plotshape", "plotchar", "plotarrow", "plotbar", "plotcandle", "hline", "fill", "bgcolor", "barcolor", "alertcondition", "alert"].includes(f),
		);
		const otherFuncs = globalFuncs.filter((f) => !plotFuncs.includes(f));

		if (plotFuncs.length > 0) {
			patterns.push({
				name: "meta.function-call.plot.pine",
				match: `\\b(${plotFuncs.join("|")})\\s*(?=\\()`,
				captures: { "1": { name: "entity.name.function.plot.pine" } },
			});
		}

		if (otherFuncs.length > 0) {
			patterns.push({
				name: "meta.function-call.builtin.pine",
				match: `\\b(${otherFuncs.join("|")})\\s*(?=\\()`,
				captures: { "1": { name: "support.function.builtin.pine" } },
			});
		}
	}

	return patterns;
}

function generateMethodCallPatterns(functions: Map<string, string[]>) {
	const patterns: object[] = [];

	for (const [namespace, funcNames] of functions.entries()) {
		if (namespace === "_global" || funcNames.length === 0) continue;

		// Escape and join function names
		const escaped = funcNames.map(escapeRegex);
		const alternation = escaped.join("|");

		patterns.push({
			name: `meta.method-call.${namespace}.pine`,
			match: `\\b(${escapeRegex(namespace)})\\.(${alternation})\\s*(?=\\()`,
			captures: {
				"1": { name: `support.namespace.${namespace}.pine` },
				"2": { name: `entity.name.function.${namespace}.pine` },
			},
		});
	}

	return patterns;
}

function generateNamespacePatterns(namespaces: Set<string>) {
	const patterns: object[] = [];

	for (const namespace of namespaces) {
		patterns.push({
			name: `support.namespace.${namespace}.pine`,
			match: `\\b${escapeRegex(namespace)}(?=\\.)`,
		});
	}

	return patterns;
}

function generateVariablePatterns(variables: { standalone: string[]; namespaced: Map<string, string[]> }) {
	const patterns: object[] = [];

	// Standalone built-in variables
	if (variables.standalone.length > 0) {
		patterns.push({
			name: "variable.language.builtin.pine",
			match: `\\b(${variables.standalone.join("|")})\\b`,
		});
	}

	// Namespaced variables (like syminfo.tickerid)
	for (const [namespace, varNames] of variables.namespaced.entries()) {
		if (varNames.length === 0) continue;
		patterns.push({
			name: "variable.other.property.pine",
			match: `\\b${escapeRegex(namespace)}\\.(${varNames.join("|")})\\b`,
		});
	}

	// Generic variable patterns (catch-all)
	patterns.push({
		name: "variable.parameter.pine",
		match: "\\b[a-zA-Z_][a-zA-Z0-9_]*(?=\\s*[,)])",
	});
	patterns.push({
		name: "variable.other.pine",
		match: "\\b[a-zA-Z_][a-zA-Z0-9_]*\\b",
	});

	return patterns;
}

// Main
function main() {
	console.log("Generating TextMate grammar from pine-data...");

	try {
		const data = loadPineData();

		console.log(`  Functions: ${Array.from(data.functions.values()).flat().length} total`);
		console.log(`    Namespaces: ${data.functions.size}`);
		console.log(`  Constants: ${Array.from(data.constants.values()).flat().length} total`);
		console.log(`    Namespaces: ${data.constants.size}`);
		console.log(`  Variables: ${data.variables.standalone.length} standalone, ${Array.from(data.variables.namespaced.values()).flat().length} namespaced`);

		const grammar = generateGrammar(data);
		const output = JSON.stringify(grammar, null, "\t");

		fs.writeFileSync(OUTPUT_FILE, output + "\n");
		console.log(`\nWritten: ${OUTPUT_FILE}`);
		console.log(`  Size: ${(output.length / 1024).toFixed(1)} KB`);
	} catch (error) {
		console.error("Error generating grammar:", error);
		process.exit(1);
	}
}

main();
