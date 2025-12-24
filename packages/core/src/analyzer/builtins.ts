// Built-in function and constant data for Pine Script validation
// This module contains data about built-in functions, namespace properties, and validation rules

import {
	type PineFunction,
	type PineParameter,
	FUNCTIONS_BY_NAME,
	CONSTANTS_BY_NAME,
	VARIABLES_BY_NAME,
	getFunctionBehavior,
	getReturnTypeParam,
} from "../../../../pine-data/v6";
import type { PineType } from "./types";

// Functions that can only be called at the top level (not in local scopes)
export const TOP_LEVEL_ONLY_FUNCTIONS = new Set([
	"indicator",
	"strategy",
	"library",
	"plot",
	"plotshape",
	"plotchar",
	"plotcandle",
	"plotbar",
	"hline",
	"bgcolor",
	"barcolor",
	"fill",
	"alertcondition",
]);

// Deprecated v5 constants with their v6 replacements
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
// Combined from pine-data and hardcoded values for backward compatibility
export const NAMESPACE_PROPERTIES: Record<string, PineType> = {
	// Build from pine-data at initialization time
	...buildNamespaceProperties(),

	// v4/v5 input type constants (for backward compatibility - not in v6 data)
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

	// Namespace VARIABLES (not constants - these are runtime values, not in scraped data)
	// syminfo namespace
	"syminfo.tickerid": "simple<string>",
	"syminfo.ticker": "simple<string>",
	"syminfo.prefix": "simple<string>",
	"syminfo.type": "simple<string>",
	"syminfo.session": "simple<string>",
	"syminfo.timezone": "simple<string>",
	"syminfo.currency": "simple<string>",
	"syminfo.basecurrency": "simple<string>",
	"syminfo.root": "simple<string>",
	"syminfo.pointvalue": "simple<float>",
	"syminfo.mintick": "simple<float>",
	"syminfo.description": "simple<string>",
	"syminfo.sector": "simple<string>",
	"syminfo.industry": "simple<string>",
	"syminfo.country": "simple<string>",
	"syminfo.volumetype": "simple<string>",

	// barstate namespace
	"barstate.isfirst": "series<bool>",
	"barstate.islast": "series<bool>",
	"barstate.isrealtime": "series<bool>",
	"barstate.isnew": "series<bool>",
	"barstate.isconfirmed": "series<bool>",
	"barstate.ishistory": "series<bool>",
	"barstate.islastconfirmedhistory": "series<bool>",

	// timeframe namespace
	"timeframe.period": "simple<string>",
	"timeframe.multiplier": "simple<int>",
	"timeframe.isseconds": "simple<bool>",
	"timeframe.isminutes": "simple<bool>",
	"timeframe.isdaily": "simple<bool>",
	"timeframe.isweekly": "simple<bool>",
	"timeframe.ismonthly": "simple<bool>",
	"timeframe.isdwm": "simple<bool>",
	"timeframe.isintraday": "simple<bool>",

	// chart namespace
	"chart.bg_color": "color",
	"chart.fg_color": "color",
	"chart.left_visible_bar_time": "series<int>",
	"chart.right_visible_bar_time": "series<int>",
	"chart.is_heikinashi": "simple<bool>",
	"chart.is_kagi": "simple<bool>",
	"chart.is_linebreak": "simple<bool>",
	"chart.is_pnf": "simple<bool>",
	"chart.is_range": "simple<bool>",
	"chart.is_renko": "simple<bool>",
	"chart.is_standard": "simple<bool>",

	// session namespace
	"session.ismarket": "series<bool>",
	"session.ispremarket": "series<bool>",
	"session.ispostmarket": "series<bool>",
	"session.isfirstbar": "series<bool>",
	"session.islastbar": "series<bool>",
	"session.isfirstbar_regular": "series<bool>",
	"session.islastbar_regular": "series<bool>",

	// strategy namespace
	"strategy.position_size": "series<float>",
	"strategy.position_avg_price": "series<float>",
	"strategy.equity": "series<float>",
	"strategy.openprofit": "series<float>",
	"strategy.netprofit": "series<float>",
	"strategy.grossprofit": "series<float>",
	"strategy.grossloss": "series<float>",
	"strategy.max_drawdown": "series<float>",
	"strategy.closedtrades": "series<int>",
	"strategy.opentrades": "series<int>",
	"strategy.wintrades": "series<int>",
	"strategy.losstrades": "series<int>",
	"strategy.eventrades": "series<int>",
	"strategy.initial_capital": "simple<float>",

	// color.grey alias (British spelling, not in TradingView docs)
	"color.grey": "color",
	"color.transparent": "color",
};

// Known namespaces for property validation
export const KNOWN_NAMESPACES = [
	"plot",
	"color",
	"shape",
	"size",
	"location",
	"barstate",
	"timeframe",
	"syminfo",
	"chart",
	"position",
	"scale",
	"display",
	"format",
	"xloc",
	"yloc",
	"input", // v4/v5 input namespace for backward compatibility
];

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

// Map type string to PineType
export function mapToPineType(typeStr?: string): PineType {
	if (!typeStr) return "unknown";

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
	};

	return typeMap[typeStr.toLowerCase()] || "unknown";
}

// Map return type string to PineType
export function mapReturnTypeToPineType(returnTypeStr: string): PineType {
	const typeMap: Record<string, PineType> = {
		int: "int",
		float: "float",
		bool: "bool",
		string: "string",
		color: "color",
		"series float": "series<float>",
		"series int": "series<int>",
		"series bool": "series<bool>",
		"series string": "series<string>",
		"series color": "series<color>",
		"const int": "int",
		"const float": "float",
		"const bool": "bool",
		"const string": "string",
		"simple int": "int",
		"simple float": "float",
		"simple bool": "bool",
		"simple string": "string",
		// Input types (from input.* functions)
		"input int": "int",
		"input float": "float",
		"input bool": "bool",
		"input string": "string",
		"input color": "color",
	};

	return typeMap[returnTypeStr.toLowerCase()] || "unknown";
}

// Build function signature from PineFunction
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
	const behavior = getFunctionBehavior(functionName);

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

		case "element":
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
