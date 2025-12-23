// Built-in function and constant data for Pine Script validation
// This module contains data about built-in functions, namespace properties, and validation rules

import {
	type PineFunction,
	type PineParameter,
	FUNCTIONS_BY_NAME,
	CONSTANTS_BY_NAME,
	VARIABLES_BY_NAME,
} from "../../pine-data/v6";
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
	return /^(math\.(max|min|avg|sum)|array\.(concat|covariance|avg|min|max|sum))/.test(
		functionName,
	);
}

// Get minimum required arguments for variadic functions
export function getMinArgsForVariadic(functionName: string): number {
	if (/^math\.(max|min)/.test(functionName)) return 2;
	return 1;
}
