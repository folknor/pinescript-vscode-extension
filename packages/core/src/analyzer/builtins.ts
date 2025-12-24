// Built-in function and constant data for Pine Script validation
// This module contains data about built-in functions, namespace properties, and validation rules

import {
	getFunctionBehavior as _getFunctionBehavior,
	CONSTANTS_BY_NAME,
	FUNCTIONS_BY_NAME,
	getReturnTypeParam,
	type PineFunction,
	type PineParameter,
	VARIABLES_BY_NAME,
} from "../../../../pine-data/v6";
import type { PineType } from "./types";

// Re-export getFunctionBehavior for use in checker
export const getFunctionBehavior = _getFunctionBehavior;

/**
 * Check if a function can only be called at the top level (not in local scopes).
 * Uses flags.topLevelOnly from pine-data.
 */
export function isTopLevelOnly(functionName: string): boolean {
	const func = FUNCTIONS_BY_NAME.get(functionName);
	return func?.flags?.topLevelOnly === true;
}

// Deprecated v5 constants with their v6 replacements.
// NOTE: This is intentionally hardcoded rather than in pine-data because:
// 1. Only 2 items - not worth the pipeline complexity
// 2. Deprecation info isn't available in TradingView's structured docs
// 3. These are Pine Script v5→v6 migration specific, not general API data
export const DEPRECATED_V5_CONSTANTS: Record<string, string> = {
	"plot.style_dashed": "plot.style_linebr",
	"plot.style_circles": "plot.style_circles", // Actually valid, but often confused
};

// Build namespace properties from pine-data
function buildNamespaceProperties(): Record<string, PineType> {
	const props: Record<string, PineType> = {};

	// Import from CONSTANTS_BY_NAME
	for (const [name, constant] of CONSTANTS_BY_NAME) {
		props[name] = constant.type as PineType;
	}

	// Import from VARIABLES_BY_NAME (namespaced ones)
	for (const [name, variable] of VARIABLES_BY_NAME) {
		if (name.includes(".")) {
			props[name] = variable.type as PineType;
		}
	}

	return props;
}

// Namespace properties for property access type inference
// Built from pine-data with minimal backward-compatibility additions
export const NAMESPACE_PROPERTIES: Record<string, PineType> = {
	// Build from pine-data at initialization time
	...buildNamespaceProperties(),

	// Backward compatibility only (v4/v5 input type constants - not in v6 data)
	"input.source": "string",
	"input.resolution": "string",
	"input.bool": "string",
	"input.integer": "string",
	"input.float": "string",
	"input.string": "string",
	"input.color": "string",
	"input.timeframe": "string",
	"input.symbol": "string",
	"input.session": "string",
	"input.price": "string",
	"input.time": "string",

	// Aliases not in TradingView docs
	"color.grey": "color", // British spelling alias for color.gray
	"color.transparent": "color", // Not in scraped data
};

// Build known namespaces from pine-data
function buildKnownNamespaces(): string[] {
	const namespaces = new Set<string>();

	// Extract namespace prefixes from functions, variables, and constants
	for (const name of FUNCTIONS_BY_NAME.keys()) {
		if (name.includes(".")) {
			namespaces.add(name.split(".")[0]);
		}
	}
	for (const name of VARIABLES_BY_NAME.keys()) {
		if (name.includes(".")) {
			namespaces.add(name.split(".")[0]);
		}
	}
	for (const name of CONSTANTS_BY_NAME.keys()) {
		if (name.includes(".")) {
			namespaces.add(name.split(".")[0]);
		}
	}

	return [...namespaces].sort();
}

// Known namespaces for property validation (derived from pine-data)
export const KNOWN_NAMESPACES = buildKnownNamespaces();

// Function signature interface
export interface FunctionSignature {
	name: string;
	parameters: ParameterInfo[];
	returns?: string;
}

export interface ParameterInfo {
	name: string;
	type?: PineType;
	optional?: boolean;
	defaultValue?: string;
}

/**
 * Map type string from pine-data to internal PineType.
 *
 * NOTE: This typeMap is intentionally separate from TypeChecker.normalizeType() because:
 * 1. This handles scraped API data normalization (e.g., "simple int" → "int")
 * 2. TypeChecker.normalizeType() handles runtime type comparison
 * 3. This strips qualifiers (const, input) that aren't tracked internally
 *
 * The typeMap normalizes various formats from TradingView's documentation:
 * - "series int" → "series<int>"
 * - "simple float" → "float" (simple qualifier stripped)
 * - "const bool" → "bool" (const qualifier stripped)
 * - "input int" → "int" (input qualifier stripped)
 */
export function mapToPineType(typeStr?: string): PineType {
	if (!typeStr) return "unknown";

	const normalized = typeStr.toLowerCase().trim();

	const typeMap: Record<string, PineType> = {
		int: "int",
		float: "float",
		bool: "bool",
		string: "string",
		color: "color",
		"series int": "series<int>",
		"series float": "series<float>",
		"series bool": "series<bool>",
		"series string": "series<string>",
		"series color": "series<color>",
		// Simple qualifier variants (simple means value doesn't change per bar)
		"simple int": "int",
		"simple float": "float",
		"simple bool": "bool",
		"simple string": "string",
		"simple color": "color",
		// Combined qualifiers
		"simple series int": "series<int>",
		"simple series float": "series<float>",
		"simple series bool": "series<bool>",
		"simple series string": "series<string>",
		"simple series color": "series<color>",
		// Input qualifier variants
		"input int": "int",
		"input float": "float",
		"input bool": "bool",
		"input string": "string",
		"input color": "color",
		// Const qualifier variants
		"const int": "int",
		"const float": "float",
		"const bool": "bool",
		"const string": "string",
		"const color": "color",
	};

	if (typeMap[normalized]) {
		return typeMap[normalized];
	}

	// Handle array types like "array<float>", "array<int>"
	const arrayMatch = normalized.match(/^(?:simple\s+)?array<(\w+)>$/);
	if (arrayMatch) {
		return `array<${arrayMatch[1]}>` as PineType;
	}

	// Handle matrix types like "matrix<float>"
	const matrixMatch = normalized.match(/^(?:simple\s+)?matrix<(\w+)>$/);
	if (matrixMatch) {
		return `matrix<${matrixMatch[1]}>` as PineType;
	}

	// Handle map types like "map<string, float>"
	const mapMatch = normalized.match(/^(?:simple\s+)?map<(\w+),\s*(\w+)>$/);
	if (mapMatch) {
		return `map<${mapMatch[1]}, ${mapMatch[2]}>` as PineType;
	}

	return "unknown";
}

// Map return type string to PineType
// Uses mapToPineType internally - this function exists for API clarity
export function mapReturnTypeToPineType(returnTypeStr: string): PineType {
	return mapToPineType(returnTypeStr);
}

// Build function signature from PineFunction
// Returns null on failure - caller should skip invalid entries.
// NOTE: Silent failure is intentional here. If pine-data contains malformed
// entries (e.g., from scraping errors), we skip them rather than crashing.
// The buildFunctionSignatures() caller handles null by not adding to the map.
export function buildSignatureFromPineFunction(
	name: string,
	func: PineFunction,
): FunctionSignature | null {
	try {
		const parameters: ParameterInfo[] = [];

		// Use the parameters array from PineFunction
		for (const param of func.parameters) {
			parameters.push({
				name: param.name,
				type: mapToPineType(param.type),
				optional: !param.required,
				defaultValue: param.default,
			});
		}

		return {
			name,
			parameters,
			returns: func.returns || undefined,
		};
	} catch (_e) {
		return null;
	}
}

// Build all function signatures from pine-data
export function buildFunctionSignatures(): Map<string, FunctionSignature> {
	const signatures = new Map<string, FunctionSignature>();

	for (const [name, func] of FUNCTIONS_BY_NAME) {
		const sig = buildSignatureFromPineFunction(name, func);
		if (sig) {
			signatures.set(name, sig);
		}
	}

	return signatures;
}

// Check if a function is variadic (accepts variable number of arguments)
export function isVariadicFunction(functionName: string): boolean {
	const func = FUNCTIONS_BY_NAME.get(functionName);
	return func?.flags?.variadic === true;
}

// Get minimum required arguments for variadic functions
export function getMinArgsForVariadic(functionName: string): number {
	const func = FUNCTIONS_BY_NAME.get(functionName);
	if (func?.flags?.minArgs !== undefined) {
		return func.flags.minArgs;
	}
	// Default: require at least the number of required parameters
	if (func) {
		return func.parameters.filter((p) => p.required).length;
	}
	return 1;
}

// Check if a function is polymorphic (return type depends on input)
export function getPolymorphicType(functionName: string): string | undefined {
	const func = FUNCTIONS_BY_NAME.get(functionName);
	return func?.flags?.polymorphic;
}

// Check if a function has overloads (detected by having parameters with unknown type)
// Functions with overloads have merged parameters from all overloads, some with type "unknown"
export function hasOverloads(functionName: string): boolean {
	const func = FUNCTIONS_BY_NAME.get(functionName);
	if (!func) return false;
	return func.parameters.some((p) => p.type === "unknown");
}

// Argument info for polymorphic return type inference
export interface ArgumentInfo {
	name?: string; // Named argument name (undefined for positional)
	type: PineType;
}

// Get the return type for a polymorphic function based on argument types
// Supports both positional and named arguments using function-behavior.json data
export function getPolymorphicReturnType(
	functionName: string,
	argTypes: PineType[],
	argInfos?: ArgumentInfo[],
): PineType | null {
	// Try data-driven approach first using function-behavior.json
	const behavior = _getFunctionBehavior(functionName);

	if (behavior?.polymorphic) {
		const returnTypeParam = behavior.polymorphic.returnTypeParam;

		// Find the argument that determines return type
		let determiningType: PineType | null = null;

		if (argInfos && argInfos.length > 0) {
			// First, check for named argument matching returnTypeParam
			const namedArg = argInfos.find((arg) => arg.name === returnTypeParam);
			if (namedArg) {
				determiningType = namedArg.type;
			} else {
				// Fall back to positional: find position of returnTypeParam in function signature
				const func = FUNCTIONS_BY_NAME.get(functionName);
				if (func) {
					const paramIndex = func.parameters.findIndex(
						(p) => p.name === returnTypeParam,
					);
					if (paramIndex >= 0 && paramIndex < argInfos.length) {
						// Only use positional if no named args before this position
						const positionalArgs = argInfos.filter((a) => !a.name);
						if (paramIndex < positionalArgs.length) {
							determiningType = positionalArgs[paramIndex].type;
						}
					}
				}
			}
		} else if (argTypes.length > 0) {
			// Legacy: use first argument if no argInfos provided
			// This maintains backward compatibility
			const func = FUNCTIONS_BY_NAME.get(functionName);
			if (func) {
				const paramIndex = func.parameters.findIndex(
					(p) => p.name === returnTypeParam,
				);
				if (paramIndex >= 0 && paramIndex < argTypes.length) {
					determiningType = argTypes[paramIndex];
				} else {
					// Default to first argument
					determiningType = argTypes[0];
				}
			} else {
				determiningType = argTypes[0];
			}
		}

		if (determiningType && determiningType !== "unknown") {
			return determiningType;
		}
	}

	// Fall back to flags-based polymorphic handling from pine-data
	const polyType = getPolymorphicType(functionName);
	if (!polyType || argTypes.length === 0) {
		return null;
	}

	const firstArgType = argTypes[0];

	switch (polyType) {
		case "input":
			// Returns the same type as the first argument
			// e.g., nz(float) -> float, nz(int) -> int
			return firstArgType !== "unknown" ? firstArgType : null;

		case "element": {
			// Returns the element type of an array
			// e.g., array.get(array<float>) -> float
			if (firstArgType === "unknown") return null;
			// If it's an array type like "array<float>", extract the element type
			const arrayMatch = firstArgType.match(/array<(.+)>/);
			if (arrayMatch) {
				return arrayMatch[1] as PineType;
			}
			// For series types, return the base type
			const seriesMatch = firstArgType.match(/series<(.+)>/);
			if (seriesMatch) {
				return `series<${seriesMatch[1]}>` as PineType;
			}
			return firstArgType;
		}

		case "numeric":
			// Returns the same numeric type (int stays int, float stays float)
			// If any arg is float, result is float; otherwise int
			if (firstArgType === "unknown") return null;
			// Check if any argument is float
			for (const argType of argTypes) {
				if (argType === "float" || argType === "series<float>") {
					return argType.includes("series") ? "series<float>" : "float";
				}
			}
			// Default to same type as first arg for int
			if (firstArgType === "int" || firstArgType === "series<int>") {
				return firstArgType;
			}
			// For other numeric types, return float as safe default
			return firstArgType.includes("series") ? "series<float>" : "float";

		default:
			return null;
	}
}
