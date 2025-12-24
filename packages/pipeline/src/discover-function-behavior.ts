#!/usr/bin/env -S node --experimental-strip-types

/**
 * Discover Function Behavior
 *
 * This script runs generated .pine test files through the TradingView linter
 * and analyzes the inferred variable types to discover function behavior:
 * - Polymorphism: Which functions return different types based on input
 * - Argument ordering: Which functions support named/reordered arguments
 *
 * Usage:
 *   pnpm run discover:behavior
 */

import * as fs from "node:fs/promises";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import {
	checkPineScriptFile,
	type PineLintResponse,
	type PineLintVariable,
} from "./tradingview-linter/index.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project root is 3 levels up from packages/pipeline/src/
const PROJECT_ROOT = path.resolve(__dirname, "../../..");
const TESTS_DIR = path.join(PROJECT_ROOT, "pine-data/tests/generated");
const OUTPUT_FILE = path.join(
	PROJECT_ROOT,
	"pine-data/v6/function-behavior.json",
);

// Behavior metadata types
interface PolymorphicBehavior {
	returnTypeParam: string;
	strategy: "same-as-input" | "dependent-on-input";
	observedMappings: Record<string, string>; // input type -> return type
	allowedTypes?: string[];
}

interface FunctionBehavior {
	polymorphic: PolymorphicBehavior | false;
	argumentOrdering: "flexible" | "positional-only";
	reason?: string;
	observedReturnTypes?: string[];
}

interface BehaviorMetadata {
	version: string;
	generatedAt: string;
	functions: Record<string, FunctionBehavior>;
}

// Parse variable name to extract function name and test type
// e.g., "_input_int" -> { func: "input", testType: "int" }
// e.g., "_nz_float_result" -> { func: "nz", testType: "float", isResult: true }
function parseVariableName(
	name: string,
): { func: string; testType: string; isResult: boolean } | null {
	if (!name.startsWith("_")) return null;

	const withoutUnderscore = name.substring(1);
	const isResult = withoutUnderscore.endsWith("_result");
	const baseName = isResult
		? withoutUnderscore.replace(/_result$/, "")
		: withoutUnderscore;

	// Split by underscore and try to identify function name
	const parts = baseName.split("_");
	if (parts.length < 2) return null;

	const func = parts[0];
	const testType = parts.slice(1).join("_");

	return { func, testType, isResult };
}

// Normalize type string for comparison
// e.g., "input int" -> "int", "series float" -> "float"
function normalizeType(type: string): string {
	// Remove qualifiers like "input", "series", "simple", "const"
	const qualifiers = ["input", "series", "simple", "const"];
	let normalized = type.toLowerCase();

	for (const q of qualifiers) {
		normalized = normalized.replace(new RegExp(`^${q}\\s+`, "i"), "");
	}

	return normalized.trim();
}

// Analyze polymorphism test results
function analyzePolymorphism(
	variables: PineLintVariable[],
	functionName: string,
): PolymorphicBehavior | false {
	const mappings: Record<string, string> = {};
	const observedTypes = new Set<string>();

	for (const v of variables) {
		const parsed = parseVariableName(v.name);
		if (!parsed || parsed.func !== functionName || parsed.isResult) continue;

		const inputType = parsed.testType;
		const returnType = normalizeType(v.type);

		mappings[inputType] = returnType;
		observedTypes.add(returnType);
	}

	// If we have multiple different return types, it's polymorphic
	if (observedTypes.size > 1) {
		// Determine the strategy
		// "same-as-input" means the return type matches the input type directly
		const isSameAsInput = Object.entries(mappings).every(
			([input, output]) => output.includes(input) || input.includes(output),
		);

		return {
			returnTypeParam: "defval", // Will be refined based on function
			strategy: isSameAsInput ? "same-as-input" : "dependent-on-input",
			observedMappings: mappings,
			allowedTypes: Array.from(observedTypes),
		};
	}

	return false;
}

// Analyze argument ordering test results
function _analyzeArgumentOrdering(
	response: PineLintResponse,
	functionName: string,
): "flexible" | "positional-only" {
	// If the test file has no errors, all orderings work
	if (
		response.success &&
		(!response.result?.errors || response.result.errors.length === 0)
	) {
		return "flexible";
	}

	// Check if errors mention the function
	const errors = response.result?.errors || [];
	const functionErrors = errors.filter((e) =>
		e.message.toLowerCase().includes(functionName.toLowerCase()),
	);

	return functionErrors.length > 0 ? "positional-only" : "flexible";
}

// Run discovery on polymorphism test file
async function discoverPolymorphism(): Promise<
	Record<string, FunctionBehavior>
> {
	const testFile = path.join(TESTS_DIR, "test-polymorphism.pine");
	console.log(`\nAnalyzing: ${path.basename(testFile)}`);

	const response = await checkPineScriptFile(testFile);
	const behaviors: Record<string, FunctionBehavior> = {};

	if (!response.success) {
		console.error(`  Error: ${response.error}`);
		return behaviors;
	}

	if (response.result?.errors?.length) {
		console.log(`  Errors: ${response.result.errors.length}`);
		for (const e of response.result.errors) {
			console.log(`    - Line ${e.start.line}: ${e.message}`);
		}
	}

	const variables = response.result?.variables || [];
	console.log(`  Variables found: ${variables.length}`);

	// Group variables by function
	const byFunction = new Map<string, PineLintVariable[]>();
	for (const v of variables) {
		const parsed = parseVariableName(v.name);
		if (!parsed) continue;

		const existing = byFunction.get(parsed.func) || [];
		existing.push(v);
		byFunction.set(parsed.func, existing);
	}

	// Analyze each function
	for (const [funcName, vars] of byFunction) {
		console.log(`  Analyzing ${funcName}: ${vars.length} variables`);

		const polymorphic = analyzePolymorphism(vars, funcName);

		// Log observed types
		for (const v of vars) {
			const parsed = parseVariableName(v.name);
			if (parsed && !parsed.isResult) {
				console.log(`    ${v.name}: ${v.type}`);
			}
		}

		behaviors[funcName] = {
			polymorphic,
			argumentOrdering: "flexible", // Will be refined by ordering tests
			observedReturnTypes: polymorphic ? polymorphic.allowedTypes : undefined,
		};
	}

	return behaviors;
}

// Run discovery on argument ordering test file
async function discoverArgumentOrdering(
	existingBehaviors: Record<string, FunctionBehavior>,
): Promise<Record<string, FunctionBehavior>> {
	const testFile = path.join(TESTS_DIR, "test-argument-ordering.pine");
	console.log(`\nAnalyzing: ${path.basename(testFile)}`);

	const response = await checkPineScriptFile(testFile);

	if (!response.success) {
		console.error(`  Error: ${response.error}`);
		return existingBehaviors;
	}

	if (response.result?.errors?.length) {
		console.log(`  Errors: ${response.result.errors.length}`);
		for (const e of response.result.errors) {
			console.log(`    - Line ${e.start.line}: ${e.message}`);
		}
	} else {
		console.log("  No errors - all argument orderings are valid!");
	}

	const variables = response.result?.variables || [];
	console.log(`  Variables found: ${variables.length}`);

	// If no errors, all tested functions support flexible ordering
	if (!response.result?.errors?.length) {
		// Mark all functions we found as flexible
		for (const v of variables) {
			const parsed = parseVariableName(v.name);
			if (!parsed) continue;

			if (!existingBehaviors[parsed.func]) {
				existingBehaviors[parsed.func] = {
					polymorphic: false,
					argumentOrdering: "flexible",
				};
			}
		}
	}

	return existingBehaviors;
}

// Add known special cases that can't be discovered automatically
function addSpecialCases(
	behaviors: Record<string, FunctionBehavior>,
): Record<string, FunctionBehavior> {
	// max_bars_back has reserved keyword parameter 'var'
	behaviors.max_bars_back = {
		polymorphic: false,
		argumentOrdering: "positional-only",
		reason: "parameter 'var' is reserved keyword",
	};

	// Refine input polymorphism
	if (behaviors.input?.polymorphic) {
		behaviors.input.polymorphic = {
			...behaviors.input.polymorphic,
			returnTypeParam: "defval",
		};
	}

	// Refine nz polymorphism
	if (behaviors.nz?.polymorphic) {
		behaviors.nz.polymorphic = {
			...behaviors.nz.polymorphic,
			returnTypeParam: "source",
		};
	}

	return behaviors;
}

// Main discovery function
async function discover(): Promise<void> {
	console.log("=== Function Behavior Discovery ===");
	console.log(`Tests directory: ${TESTS_DIR}`);
	console.log(`Output file: ${OUTPUT_FILE}`);

	// Check if test files exist
	try {
		await fs.access(TESTS_DIR);
	} catch {
		console.error(`\nError: Tests directory not found: ${TESTS_DIR}`);
		console.error(
			"Run 'pnpm run generate:tests' first to generate test files.",
		);
		process.exit(1);
	}

	// Discover polymorphism
	let behaviors = await discoverPolymorphism();

	// Discover argument ordering
	behaviors = await discoverArgumentOrdering(behaviors);

	// Add known special cases
	behaviors = addSpecialCases(behaviors);

	// Create output metadata
	const metadata: BehaviorMetadata = {
		version: "6",
		generatedAt: new Date().toISOString(),
		functions: behaviors,
	};

	// Write output
	await fs.writeFile(OUTPUT_FILE, JSON.stringify(metadata, null, 2));
	console.log(`\n=== Output written to: ${OUTPUT_FILE} ===`);

	// Summary
	const functionCount = Object.keys(behaviors).length;
	const polymorphicCount = Object.values(behaviors).filter(
		(b) => b.polymorphic !== false,
	).length;
	const positionalOnlyCount = Object.values(behaviors).filter(
		(b) => b.argumentOrdering === "positional-only",
	).length;

	console.log(`\nSummary:`);
	console.log(`  Functions analyzed: ${functionCount}`);
	console.log(`  Polymorphic: ${polymorphicCount}`);
	console.log(`  Positional-only: ${positionalOnlyCount}`);
	console.log(`  Flexible ordering: ${functionCount - positionalOnlyCount}`);
}

// Run if executed directly
discover().catch((error) => {
	console.error("Discovery failed:", error);
	process.exit(1);
});
