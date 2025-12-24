#!/usr/bin/env -S node --experimental-strip-types

/**
 * Generate Pine Script test files for function behavior discovery
 *
 * This script generates .pine test files that verify:
 * 1. Argument ordering flexibility (positional, named, mixed, reordered)
 * 2. Polymorphic return types (for functions where return type depends on input)
 *
 * Usage:
 *   pnpm run generate:tests
 */

import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { FUNCTIONS } from "../../../pine-data/v6/functions.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project root is 3 levels up from packages/pipeline/src/
const PROJECT_ROOT = path.resolve(__dirname, "../../..");
const OUTPUT_DIR = path.join(PROJECT_ROOT, "pine-data/tests/generated");

// Reserved keywords that can't be used as named argument names
const RESERVED_KEYWORDS = new Set([
	"var",
	"varip",
	"if",
	"else",
	"for",
	"while",
	"switch",
	"import",
	"export",
	"true",
	"false",
	"na",
	"and",
	"or",
	"not",
]);

interface PineFunction {
	name: string;
	syntax: string;
	parameters: Array<{
		name: string;
		type: string;
		required: boolean;
		default?: string;
	}>;
	returns: string;
}

// Get global (non-namespaced) functions
function getGlobalFunctions(): PineFunction[] {
	return FUNCTIONS.filter((f) => !f.name.includes(".")) as PineFunction[];
}

// Check if any parameter name is a reserved keyword
function hasReservedParamName(func: PineFunction): boolean {
	return func.parameters.some((p) => RESERVED_KEYWORDS.has(p.name));
}

// Generate a test value for a given type
function getTestValue(type: string, paramName: string): string {
	const t = type.toLowerCase();

	if (t.includes("bool")) return "true";
	if (t.includes("int") && !t.includes("float")) return "14";
	if (t.includes("float") || t.includes("number")) return "1.5";
	if (t.includes("string")) return `"test_${paramName}"`;
	if (t.includes("color")) return "color.red";
	if (t.includes("source") || paramName === "source" || paramName === "src")
		return "close";
	if (t.includes("series")) {
		if (t.includes("bool")) return "close > open";
		return "close";
	}

	// Special cases by parameter name
	if (paramName === "condition") return "true";
	if (paramName === "message" || paramName === "title") return `"test"`;
	if (paramName === "freq") return "alert.freq_once_per_bar";
	if (paramName === "length" || paramName === "period") return "14";
	if (paramName === "price") return "50.0";
	if (paramName === "offset") return "0";
	if (paramName === "defval") return "14"; // Default to int for polymorphism testing

	// Fallback
	if (t.includes("plot")) return "plot.style_line";
	if (t.includes("label")) return "label.style_label_down";
	if (t.includes("line")) return "line.style_solid";
	if (t.includes("location")) return "location.top";
	if (t.includes("size")) return "size.small";
	if (t.includes("display")) return "display.all";

	return "na"; // Last resort
}

// Functions that need special handling (complex parameter types)
const SKIP_FUNCTIONS = new Set([
	"fill", // Needs hline or plot objects
	"linefill", // Needs line objects
]);

// Generate argument ordering test for a function
function generateArgumentOrderingTest(func: PineFunction): string {
	const lines: string[] = [];

	if (SKIP_FUNCTIONS.has(func.name)) {
		lines.push(`// ${func.name}: Requires complex objects, tested separately`);
		return lines.join("\n");
	}

	const params = func.parameters.filter(
		(p) => p.required || p.name === "defval",
	);

	if (params.length === 0) {
		lines.push(`// ${func.name}: No required parameters, skip ordering test`);
		lines.push(`// ${func.name}()`);
		return lines.join("\n");
	}

	// Check for reserved keyword params
	if (hasReservedParamName(func)) {
		lines.push(
			`// ${func.name}: Has reserved keyword parameter name, positional only`,
		);
		const args = params.map((p) => getTestValue(p.type, p.name)).join(", ");
		lines.push(`// ${func.name}(${args})`);
		return lines.join("\n");
	}

	// Generate positional call
	const positionalArgs = params
		.map((p) => getTestValue(p.type, p.name))
		.join(", ");
	lines.push(`// Positional`);

	// Some functions need their result captured
	const needsCapture = !["void", ""].includes(func.returns.toLowerCase());
	const prefix = needsCapture ? `_${func.name.replace(".", "_")}_pos = ` : "";
	lines.push(`${prefix}${func.name}(${positionalArgs})`);

	// Generate all-named call
	const namedArgs = params
		.map((p) => `${p.name}=${getTestValue(p.type, p.name)}`)
		.join(", ");
	lines.push(`// All named`);
	const prefix2 = needsCapture
		? `_${func.name.replace(".", "_")}_named = `
		: "";
	lines.push(`${prefix2}${func.name}(${namedArgs})`);

	// Generate reversed named call (if more than 1 param)
	if (params.length > 1) {
		const reversedArgs = [...params]
			.reverse()
			.map((p) => `${p.name}=${getTestValue(p.type, p.name)}`)
			.join(", ");
		lines.push(`// Reversed named`);
		const prefix3 = needsCapture
			? `_${func.name.replace(".", "_")}_rev = `
			: "";
		lines.push(`${prefix3}${func.name}(${reversedArgs})`);
	}

	return lines.join("\n");
}

// Generate polymorphism test for input function
function generateInputPolymorphismTest(): string {
	return `
// === input() polymorphism test ===
// Each call should infer a different return type based on defval

_input_int = input(14)
_input_int_result = _input_int + 1  // Should work if type is int

_input_float = input(1.5)
_input_float_result = _input_float * 2.0  // Should work if type is float

_input_bool = input(true)
if _input_bool  // Should work if type is bool
    na

_input_string = input("hello")
_input_string_result = _input_string + " world"  // Should work if type is string

_input_series = input(close)
_input_series_result = ta.sma(_input_series, 14)  // Should work if type is series float

// Named defval argument
_input_named = input(defval=42, title="Test")
_input_named_result = _input_named + 1

// Reordered named arguments
_input_reorder = input(title="Test2", defval=100)
_input_reorder_result = _input_reorder + 1
`;
}

// Generate polymorphism test for nz function
function generateNzPolymorphismTest(): string {
	return `
// === nz() polymorphism test ===
// nz should return same type as input (int or float, not bool)

_nz_float = nz(close)
_nz_float_result = _nz_float * 2.0  // Should work if type is series float

_nz_int = nz(bar_index)
_nz_int_result = _nz_int + 1  // Should work if type is series int

// With replacement value
_nz_replace = nz(close, 0.0)
_nz_replace_result = _nz_replace * 2.0

// Named arguments
_nz_named = nz(source=close, replacement=0.0)
_nz_named_rev = nz(replacement=0.0, source=close)
`;
}

// Generate the main test file
async function generateTests(): Promise<void> {
	await fs.mkdir(OUTPUT_DIR, { recursive: true });

	const globalFunctions = getGlobalFunctions();
	console.log(`Found ${globalFunctions.length} global functions`);

	// Generate main argument ordering test file
	const orderingLines: string[] = [
		"//@version=6",
		"// AUTO-GENERATED: Test argument ordering for global functions",
		"// This file tests positional, named, and reordered argument styles",
		"",
		'indicator("Argument Ordering Tests", overlay=true)',
		"",
	];

	for (const func of globalFunctions) {
		// Skip functions that are hard to test automatically
		if (["indicator", "strategy", "library"].includes(func.name)) {
			orderingLines.push(`// ${func.name}: Script declaration, skip`);
			continue;
		}

		orderingLines.push(`// === ${func.name} ===`);
		orderingLines.push(generateArgumentOrderingTest(func));
		orderingLines.push("");
	}

	// Add a plot to make it valid
	orderingLines.push("plot(close)");

	await fs.writeFile(
		path.join(OUTPUT_DIR, "test-argument-ordering.pine"),
		orderingLines.join("\n"),
	);
	console.log("Generated: test-argument-ordering.pine");

	// Generate polymorphism test file
	const polyLines: string[] = [
		"//@version=6",
		"// AUTO-GENERATED: Test polymorphic function behavior",
		"// This file tests functions that return different types based on input",
		"",
		'indicator("Polymorphism Tests", overlay=true)',
		"",
		generateInputPolymorphismTest(),
		generateNzPolymorphismTest(),
		"",
		"// Plot to make script valid",
		"plot(_input_int + _nz_float)",
	];

	await fs.writeFile(
		path.join(OUTPUT_DIR, "test-polymorphism.pine"),
		polyLines.join("\n"),
	);
	console.log("Generated: test-polymorphism.pine");

	console.log(`\nTest files written to: ${OUTPUT_DIR}`);
}

// Run if executed directly
generateTests().catch(console.error);
