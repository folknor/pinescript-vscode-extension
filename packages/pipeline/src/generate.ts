#!/usr/bin/env -S node --experimental-strip-types

/**
 * Pine Script Data Generator
 *
 * Generates TypeScript data files from scraped Pine Script documentation.
 * Produces a clean, LSP-optimized data structure.
 *
 * Usage: node --experimental-strip-types packages/pipeline/src/generate.ts [version]
 * Default version: v6
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve paths relative to project root
const PROJECT_ROOT = __dirname.includes("/dist/")
	? path.resolve(__dirname, "../../../..")
	: path.resolve(__dirname, "../../..");

const VERSION = process.argv[2] || "v6";
const RAW_DIR = path.join(PROJECT_ROOT, `pine-data/raw/${VERSION}`);
const OUTPUT_DIR = path.join(PROJECT_ROOT, `pine-data/${VERSION}`);

// Input files
const DETAILS_FILE = path.join(RAW_DIR, "complete-v6-details.json");
const CONSTRUCTS_FILE = path.join(RAW_DIR, "v6-language-constructs.json");

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface Parameter {
	name: string;
	type: string;
	description: string;
	optional?: boolean;
	required?: boolean;
	default?: string;
}

interface FunctionDetail {
	name: string;
	syntax: string;
	description: string;
	parameters: Parameter[];
	returns: string;
	example?: string;
	namespace?: string;
	category?: string;
	overloads?: string[];
	variadic?: boolean;
}

interface GeneratedFunction {
	name: string;
	namespace?: string;
	syntax: string;
	description: string;
	parameters: Array<{
		name: string;
		type: string;
		description: string;
		required: boolean;
		default?: string;
	}>;
	returns: string;
	flags?: Record<string, unknown>;
	example?: string;
}

interface GeneratedVariable {
	name: string;
	namespace?: string;
	type: string;
	qualifier: string;
	description: string;
}

interface GeneratedConstant {
	name: string;
	namespace: string;
	shortName: string;
	type: string;
}

interface DetailsData {
	functions: Record<string, FunctionDetail>;
}

interface ConstructsData {
	keywords?: { items?: string[] };
	builtInVariables?: { standalone?: { items?: string[] } };
	constants?: { byNamespace?: Record<string, string[]> };
}

// =============================================================================
// TYPE INFERENCE HELPERS
// =============================================================================

function inferVariableType(name: string): { type: string; qualifier: string } {
	// Price data - series<float>
	if (["close", "open", "high", "low", "hl2", "hlc3", "ohlc4", "hlcc4"].includes(name)) {
		return { type: "float", qualifier: "series" };
	}
	if (["volume", "ask", "bid"].includes(name)) {
		return { type: "float", qualifier: "series" };
	}

	// Time data - series<int>
	if (["time", "time_close", "time_tradingday", "timenow", "last_bar_time"].includes(name)) {
		return { type: "int", qualifier: "series" };
	}
	if (["bar_index", "last_bar_index"].includes(name)) {
		return { type: "int", qualifier: "series" };
	}
	if (["dayofweek", "dayofmonth", "month", "year", "hour", "minute", "second", "weekofyear"].includes(name)) {
		return { type: "int", qualifier: "series" };
	}

	// Special
	if (name === "na") return { type: "na", qualifier: "const" };

	// Namespaced variables
	if (name.startsWith("barstate.")) return { type: "bool", qualifier: "series" };
	if (name.startsWith("chart.")) {
		if (name.includes("color")) return { type: "color", qualifier: "simple" };
		if (name.includes("time")) return { type: "int", qualifier: "series" };
		return { type: "bool", qualifier: "simple" };
	}
	if (name.startsWith("session.")) return { type: "bool", qualifier: "series" };
	if (name.startsWith("syminfo.")) {
		if (name.includes("mintick") || name.includes("pointvalue")) return { type: "float", qualifier: "simple" };
		return { type: "string", qualifier: "simple" };
	}
	if (name.startsWith("timeframe.")) {
		if (name.startsWith("timeframe.is")) return { type: "bool", qualifier: "simple" };
		if (name === "timeframe.multiplier") return { type: "int", qualifier: "simple" };
		return { type: "string", qualifier: "simple" };
	}
	if (name.startsWith("strategy.")) {
		if (name.includes("position_size") || name.includes("equity") || name.includes("profit") || name.includes("loss")) {
			return { type: "float", qualifier: "series" };
		}
		return { type: "int", qualifier: "series" };
	}

	// Default
	return { type: "float", qualifier: "series" };
}

function inferConstantType(namespace: string): string {
	switch (namespace) {
		case "color": return "color";
		case "shape": return "string";
		case "plot": return "string";
		case "hline": return "string";
		case "line": return "string";
		case "label": return "string";
		case "size": return "string";
		case "location": return "string";
		case "position": return "string";
		case "display": return "int";
		case "extend": return "string";
		case "xloc": return "string";
		case "yloc": return "string";
		case "alert": return "string";
		case "adjustment": return "string";
		case "barmerge": return "string";
		case "currency": return "string";
		case "dayofweek": return "int";
		case "format": return "string";
		case "order": return "string";
		case "scale": return "string";
		case "session": return "string";
		case "strategy": return "string";
		case "text": return "string";
		case "font": return "string";
		case "math": return "float";
		default: return "string";
	}
}

function getFunctionFlags(name: string): Record<string, unknown> | undefined {
	const flags: Record<string, unknown> = {};

	// Top-level only functions
	const topLevelOnly = [
		"indicator", "strategy", "library",
		"plot", "plotshape", "plotchar", "plotcandle", "plotbar", "plotarrow",
		"bgcolor", "barcolor", "fill", "hline", "alertcondition",
	];
	if (topLevelOnly.includes(name)) {
		flags.topLevelOnly = true;
	}

	// Variadic functions
	const variadic: Record<string, { minArgs: number }> = {
		"math.max": { minArgs: 2 },
		"math.min": { minArgs: 2 },
		"math.avg": { minArgs: 2 },
		"math.sum": { minArgs: 1 },
		"array.from": { minArgs: 1 },
		"str.format": { minArgs: 1 },
	};
	if (variadic[name]) {
		flags.variadic = true;
		flags.minArgs = variadic[name].minArgs;
	}

	// Polymorphic functions
	const polymorphic: Record<string, string> = {
		"nz": "input",
		"fixnan": "input",
		"array.get": "element",
		"array.first": "element",
		"array.last": "element",
		"array.pop": "element",
		"array.remove": "element",
		"array.shift": "element",
		"array.max": "element",
		"array.min": "element",
		"array.avg": "element",
		"array.sum": "element",
		"array.median": "element",
		"array.mode": "element",
		"array.stdev": "element",
		"array.variance": "element",
		"math.abs": "numeric",
		"math.sign": "numeric",
		"math.max": "numeric",
		"math.min": "numeric",
		"math.avg": "numeric",
		"math.sum": "numeric",
		"math.round": "numeric",
		"math.floor": "numeric",
		"math.ceil": "numeric",
	};
	if (polymorphic[name]) {
		flags.polymorphic = polymorphic[name];
	}

	return Object.keys(flags).length > 0 ? flags : undefined;
}

// =============================================================================
// GENERATORS
// =============================================================================

function isParameterOptional(param: Parameter): boolean {
	if (param.optional === true) return true;

	const desc = (param.description || "").toLowerCase();
	if (desc.includes("optional")) return true;
	if (desc.includes("if not specified")) return true;
	if (desc.includes("default value is")) return true;
	if (desc.includes("default is")) return true;
	if (desc.includes("the default is")) return true;
	if (desc.includes("defaults to")) return true;
	if (desc.includes("if omitted")) return true;
	if (desc.includes("not required")) return true;

	if (param.default !== undefined) return true;

	const commonOptionalParams = [
		"text", "textcolor", "color", "bgcolor", "bordercolor",
		"offset", "show_last", "editable", "display", "format", "precision",
		"size", "location", "style", "force_overlay", "tooltip", "inline",
		"group", "confirm", "options", "minval", "maxval", "step", "xloc", "yloc",
		"overlay", "format", "scale", "max_bars_back", "max_lines_count",
		"max_labels_count", "max_boxes_count", "max_polylines_count",
		"timeframe", "timeframe_gaps", "explicit_plot_zorder", "precision",
		"shorttitle", "trackprice", "histbase", "join", "linewidth",
		"linestyle", "transp", "show_last",
	];
	if (commonOptionalParams.includes(param.name)) {
		if (desc.includes("required argument") || desc.includes("is required")) {
			return false;
		}
		return true;
	}

	if (param.required === false) return true;

	return false;
}

const MISSING_PARAMETERS: Record<string, Parameter[]> = {
	"input.int": [
		{ name: "minval", type: "const int", description: "Minimum value of the input.", required: false },
		{ name: "maxval", type: "const int", description: "Maximum value of the input.", required: false },
		{ name: "step", type: "const int", description: "Step value for the input.", required: false },
	],
	"input.float": [
		{ name: "minval", type: "const float", description: "Minimum value of the input.", required: false },
		{ name: "maxval", type: "const float", description: "Maximum value of the input.", required: false },
		{ name: "step", type: "const float", description: "Step value for the input.", required: false },
	],
};

function generateFunctions(details: DetailsData, _constructs: ConstructsData): GeneratedFunction[] {
	console.log("Generating functions.ts...");

	const functions: GeneratedFunction[] = [];

	for (const [name, detail] of Object.entries(details.functions || {})) {
		if (!detail) continue;

		const namespace = name.includes(".") ? name.split(".")[0] : undefined;
		const flags = getFunctionFlags(name);

		let parameters = (detail.parameters || []).map(p => ({
			name: p.name,
			type: p.type || "unknown",
			description: p.description || "",
			required: !isParameterOptional(p),
			default: p.default,
		}));

		if (MISSING_PARAMETERS[name]) {
			const existingNames = new Set(parameters.map(p => p.name));
			for (const missing of MISSING_PARAMETERS[name]) {
				if (!existingNames.has(missing.name)) {
					parameters.push({
						name: missing.name,
						type: missing.type,
						description: missing.description,
						required: missing.required ?? true,
						default: missing.default,
					});
				}
			}
		}

		const func: GeneratedFunction = {
			name,
			namespace,
			syntax: detail.syntax || `${name}()`,
			description: detail.description || "",
			parameters,
			returns: detail.returns || "void",
			flags,
			example: detail.example,
		};

		functions.push(func);
	}

	const content = `/**
 * Pine Script ${VERSION.toUpperCase()} Functions
 * Auto-generated from TradingView documentation
 * Generated: ${new Date().toISOString()}
 * Total: ${functions.length} functions
 */

import type { PineFunction } from "../schema/types";

/**
 * All ${VERSION} functions as an array
 */
export const FUNCTIONS: PineFunction[] = ${JSON.stringify(functions, null, 2)};

/**
 * Functions indexed by name for O(1) lookup
 */
export const FUNCTIONS_BY_NAME: Map<string, PineFunction> = new Map(
	FUNCTIONS.map(f => [f.name, f])
);

/**
 * Functions grouped by namespace
 */
export const FUNCTIONS_BY_NAMESPACE: Map<string, PineFunction[]> = (() => {
	const map = new Map<string, PineFunction[]>();
	for (const f of FUNCTIONS) {
		const ns = f.namespace || "_global";
		if (!map.has(ns)) map.set(ns, []);
		map.get(ns)!.push(f);
	}
	return map;
})();

/**
 * All function names as a Set for fast membership check
 */
export const FUNCTION_NAMES: Set<string> = new Set(FUNCTIONS.map(f => f.name));

/**
 * All namespace names that have functions
 */
export const FUNCTION_NAMESPACES: Set<string> = new Set(
	FUNCTIONS.filter(f => f.namespace).map(f => f.namespace!)
);
`;

	fs.writeFileSync(path.join(OUTPUT_DIR, "functions.ts"), content);
	console.log(`   ${functions.length} functions`);
	return functions;
}

function generateVariables(_details: DetailsData, constructs: ConstructsData): GeneratedVariable[] {
	console.log("Generating variables.ts...");

	const variables: GeneratedVariable[] = [];

	// Standalone variables
	const standalone = constructs.builtInVariables?.standalone?.items || [];
	for (const name of standalone) {
		const { type, qualifier } = inferVariableType(name);
		variables.push({
			name,
			namespace: undefined,
			type: `${qualifier}<${type}>`,
			qualifier,
			description: `Built-in variable: ${name}`,
		});
	}

	// Namespace variables
	const namespaceVars: GeneratedVariable[] = [
		// syminfo
		{ name: "syminfo.tickerid", type: "simple<string>", qualifier: "simple", description: "Ticker ID with exchange prefix" },
		{ name: "syminfo.ticker", type: "simple<string>", qualifier: "simple", description: "Ticker symbol without exchange" },
		{ name: "syminfo.prefix", type: "simple<string>", qualifier: "simple", description: "Exchange prefix" },
		{ name: "syminfo.type", type: "simple<string>", qualifier: "simple", description: "Symbol type (stock, forex, crypto, etc.)" },
		{ name: "syminfo.session", type: "simple<string>", qualifier: "simple", description: "Session type" },
		{ name: "syminfo.timezone", type: "simple<string>", qualifier: "simple", description: "Timezone" },
		{ name: "syminfo.currency", type: "simple<string>", qualifier: "simple", description: "Currency" },
		{ name: "syminfo.basecurrency", type: "simple<string>", qualifier: "simple", description: "Base currency" },
		{ name: "syminfo.description", type: "simple<string>", qualifier: "simple", description: "Symbol description" },
		{ name: "syminfo.mintick", type: "simple<float>", qualifier: "simple", description: "Minimum tick size" },
		{ name: "syminfo.pointvalue", type: "simple<float>", qualifier: "simple", description: "Point value" },
		{ name: "syminfo.country", type: "simple<string>", qualifier: "simple", description: "Country code of the symbol" },
		{ name: "syminfo.industry", type: "simple<string>", qualifier: "simple", description: "Industry of the symbol" },
		{ name: "syminfo.root", type: "simple<string>", qualifier: "simple", description: "Root symbol" },
		// barstate
		{ name: "barstate.isfirst", type: "series<bool>", qualifier: "series", description: "True on first bar" },
		{ name: "barstate.islast", type: "series<bool>", qualifier: "series", description: "True on last bar" },
		{ name: "barstate.ishistory", type: "series<bool>", qualifier: "series", description: "True on historical bars" },
		{ name: "barstate.isrealtime", type: "series<bool>", qualifier: "series", description: "True on realtime bars" },
		{ name: "barstate.isnew", type: "series<bool>", qualifier: "series", description: "True on new bar" },
		{ name: "barstate.isconfirmed", type: "series<bool>", qualifier: "series", description: "True when bar is confirmed" },
		{ name: "barstate.islastconfirmedhistory", type: "series<bool>", qualifier: "series", description: "True on last confirmed historical bar" },
		// timeframe
		{ name: "timeframe.period", type: "simple<string>", qualifier: "simple", description: "Timeframe period string" },
		{ name: "timeframe.multiplier", type: "simple<int>", qualifier: "simple", description: "Timeframe multiplier" },
		{ name: "timeframe.isseconds", type: "simple<bool>", qualifier: "simple", description: "True if seconds timeframe" },
		{ name: "timeframe.isminutes", type: "simple<bool>", qualifier: "simple", description: "True if minutes timeframe" },
		{ name: "timeframe.isdaily", type: "simple<bool>", qualifier: "simple", description: "True if daily timeframe" },
		{ name: "timeframe.isweekly", type: "simple<bool>", qualifier: "simple", description: "True if weekly timeframe" },
		{ name: "timeframe.ismonthly", type: "simple<bool>", qualifier: "simple", description: "True if monthly timeframe" },
		{ name: "timeframe.isdwm", type: "simple<bool>", qualifier: "simple", description: "True if daily/weekly/monthly" },
		{ name: "timeframe.isintraday", type: "simple<bool>", qualifier: "simple", description: "True if intraday timeframe" },
		{ name: "timeframe.isticks", type: "simple<bool>", qualifier: "simple", description: "True if ticks timeframe" },
		{ name: "timeframe.main_period", type: "simple<string>", qualifier: "simple", description: "Main period of the chart timeframe" },
		// chart
		{ name: "chart.bg_color", type: "color", qualifier: "simple", description: "Chart background color" },
		{ name: "chart.fg_color", type: "color", qualifier: "simple", description: "Chart foreground color" },
		{ name: "chart.is_standard", type: "simple<bool>", qualifier: "simple", description: "True if standard chart" },
		{ name: "chart.is_heikinashi", type: "simple<bool>", qualifier: "simple", description: "True if Heikin Ashi chart" },
		{ name: "chart.is_renko", type: "simple<bool>", qualifier: "simple", description: "True if Renko chart" },
		{ name: "chart.is_kagi", type: "simple<bool>", qualifier: "simple", description: "True if Kagi chart" },
		{ name: "chart.is_linebreak", type: "simple<bool>", qualifier: "simple", description: "True if Line Break chart" },
		{ name: "chart.is_pnf", type: "simple<bool>", qualifier: "simple", description: "True if Point & Figure chart" },
		{ name: "chart.is_range", type: "simple<bool>", qualifier: "simple", description: "True if Range chart" },
		{ name: "chart.left_visible_bar_time", type: "series<int>", qualifier: "series", description: "Time of leftmost visible bar" },
		{ name: "chart.right_visible_bar_time", type: "series<int>", qualifier: "series", description: "Time of rightmost visible bar" },
		// session
		{ name: "session.ismarket", type: "series<bool>", qualifier: "series", description: "True during market session" },
		{ name: "session.ispremarket", type: "series<bool>", qualifier: "series", description: "True during pre-market" },
		{ name: "session.ispostmarket", type: "series<bool>", qualifier: "series", description: "True during post-market" },
		{ name: "session.isfirstbar", type: "series<bool>", qualifier: "series", description: "True on first bar of session" },
		{ name: "session.isfirstbar_regular", type: "series<bool>", qualifier: "series", description: "True on first bar of regular session" },
		// strategy
		{ name: "strategy.position_size", type: "series<float>", qualifier: "series", description: "Current position size" },
		{ name: "strategy.position_avg_price", type: "series<float>", qualifier: "series", description: "Average position price" },
		{ name: "strategy.equity", type: "series<float>", qualifier: "series", description: "Current equity" },
		{ name: "strategy.openprofit", type: "series<float>", qualifier: "series", description: "Open profit" },
		{ name: "strategy.netprofit", type: "series<float>", qualifier: "series", description: "Net profit" },
		{ name: "strategy.grossprofit", type: "series<float>", qualifier: "series", description: "Gross profit" },
		{ name: "strategy.grossloss", type: "series<float>", qualifier: "series", description: "Gross loss" },
		{ name: "strategy.closedtrades", type: "series<int>", qualifier: "series", description: "Number of closed trades" },
		{ name: "strategy.opentrades", type: "series<int>", qualifier: "series", description: "Number of open trades" },
		{ name: "strategy.wintrades", type: "series<int>", qualifier: "series", description: "Number of winning trades" },
		{ name: "strategy.losstrades", type: "series<int>", qualifier: "series", description: "Number of losing trades" },
		{ name: "strategy.initial_capital", type: "simple<float>", qualifier: "simple", description: "Initial capital" },
		{ name: "strategy.openprofit_percent", type: "series<float>", qualifier: "series", description: "Open profit as percentage" },
		{ name: "strategy.netprofit_percent", type: "series<float>", qualifier: "series", description: "Net profit as percentage" },
		{ name: "strategy.max_drawdown_percent", type: "series<float>", qualifier: "series", description: "Maximum drawdown as percentage" },
	];

	for (const v of namespaceVars) {
		(v as GeneratedVariable).namespace = v.name.split(".")[0];
		variables.push(v as GeneratedVariable);
	}

	const content = `/**
 * Pine Script ${VERSION.toUpperCase()} Built-in Variables
 * Auto-generated from TradingView documentation
 * Generated: ${new Date().toISOString()}
 * Total: ${variables.length} variables
 */

import type { PineVariable } from "../schema/types";

/**
 * All ${VERSION} built-in variables
 */
export const VARIABLES: PineVariable[] = ${JSON.stringify(variables, null, 2)};

/**
 * Variables indexed by name for O(1) lookup
 */
export const VARIABLES_BY_NAME: Map<string, PineVariable> = new Map(
	VARIABLES.map(v => [v.name, v])
);

/**
 * Variables grouped by namespace
 */
export const VARIABLES_BY_NAMESPACE: Map<string, PineVariable[]> = (() => {
	const map = new Map<string, PineVariable[]>();
	for (const v of VARIABLES) {
		const ns = v.namespace || "_standalone";
		if (!map.has(ns)) map.set(ns, []);
		map.get(ns)!.push(v);
	}
	return map;
})();

/**
 * All variable names as a Set for fast membership check
 */
export const VARIABLE_NAMES: Set<string> = new Set(VARIABLES.map(v => v.name));

/**
 * Standalone variables (no namespace)
 */
export const STANDALONE_VARIABLES: Set<string> = new Set(
	VARIABLES.filter(v => !v.namespace).map(v => v.name)
);

/**
 * All namespace names that have variables
 */
export const VARIABLE_NAMESPACES: Set<string> = new Set(
	VARIABLES.filter(v => v.namespace).map(v => v.namespace!)
);
`;

	fs.writeFileSync(path.join(OUTPUT_DIR, "variables.ts"), content);
	console.log(`   ${variables.length} variables`);
	return variables;
}

function generateConstants(_details: DetailsData, constructs: ConstructsData): GeneratedConstant[] {
	console.log("Generating constants.ts...");

	const constants: GeneratedConstant[] = [];

	const byNamespace = constructs.constants?.byNamespace || {};
	for (const [namespace, items] of Object.entries(byNamespace)) {
		const type = inferConstantType(namespace);
		for (const shortName of items) {
			constants.push({
				name: `${namespace}.${shortName}`,
				namespace,
				shortName,
				type,
			});
		}
	}

	const content = `/**
 * Pine Script ${VERSION.toUpperCase()} Constants
 * Auto-generated from TradingView documentation
 * Generated: ${new Date().toISOString()}
 * Total: ${constants.length} constants
 */

import type { PineConstant } from "../schema/types";

/**
 * All ${VERSION} constants
 */
export const CONSTANTS: PineConstant[] = ${JSON.stringify(constants, null, 2)};

/**
 * Constants indexed by full name for O(1) lookup
 */
export const CONSTANTS_BY_NAME: Map<string, PineConstant> = new Map(
	CONSTANTS.map(c => [c.name, c])
);

/**
 * Constants grouped by namespace
 */
export const CONSTANTS_BY_NAMESPACE: Map<string, PineConstant[]> = (() => {
	const map = new Map<string, PineConstant[]>();
	for (const c of CONSTANTS) {
		if (!map.has(c.namespace)) map.set(c.namespace, []);
		map.get(c.namespace)!.push(c);
	}
	return map;
})();

/**
 * All constant names as a Set for fast membership check
 */
export const CONSTANT_NAMES: Set<string> = new Set(CONSTANTS.map(c => c.name));

/**
 * All namespace names that have constants
 */
export const CONSTANT_NAMESPACES: Set<string> = new Set(CONSTANTS.map(c => c.namespace));
`;

	fs.writeFileSync(path.join(OUTPUT_DIR, "constants.ts"), content);
	console.log(`   ${constants.length} constants`);
	return constants;
}

function generateKeywords(constructs: ConstructsData): string[] {
	console.log("Generating keywords.ts...");

	const keywords = constructs.keywords?.items || [];

	const allKeywords = new Set([
		...keywords,
		"if", "else", "for", "while", "switch", "case", "default",
		"break", "continue", "return",
		"var", "varip", "const", "type", "enum", "export", "import",
		"method", "library", "indicator", "strategy",
		"and", "or", "not", "true", "false", "na",
	]);

	const keywordList = [...allKeywords].sort();

	const content = `/**
 * Pine Script ${VERSION.toUpperCase()} Keywords
 * Auto-generated from TradingView documentation
 * Generated: ${new Date().toISOString()}
 * Total: ${keywordList.length} keywords
 */

/**
 * All ${VERSION} language keywords
 */
export const KEYWORDS: Set<string> = new Set(${JSON.stringify(keywordList, null, 2)});

/**
 * Control flow keywords
 */
export const CONTROL_KEYWORDS: Set<string> = new Set([
	"if", "else", "for", "while", "switch", "case", "default",
	"break", "continue", "return",
]);

/**
 * Declaration keywords
 */
export const DECLARATION_KEYWORDS: Set<string> = new Set([
	"var", "varip", "const", "type", "enum", "export", "import",
	"method", "library", "indicator", "strategy",
]);

/**
 * Operator keywords
 */
export const OPERATOR_KEYWORDS: Set<string> = new Set([
	"and", "or", "not",
]);

/**
 * Literal keywords
 */
export const LITERAL_KEYWORDS: Set<string> = new Set([
	"true", "false", "na",
]);

/**
 * Type keywords (basic types)
 */
export const TYPE_KEYWORDS: Set<string> = new Set([
	"int", "float", "bool", "string", "color",
	"array", "matrix", "map",
	"line", "label", "box", "table", "polyline", "linefill",
]);
`;

	fs.writeFileSync(path.join(OUTPUT_DIR, "keywords.ts"), content);
	console.log(`   ${keywordList.length} keywords`);
	return keywordList;
}

function generateVersionIndex(
	functions: GeneratedFunction[],
	variables: GeneratedVariable[],
	constants: GeneratedConstant[],
	keywords: string[],
): void {
	console.log("Generating index.ts...");

	const content = `/**
 * Pine Script ${VERSION.toUpperCase()} Language Data
 * Auto-generated - single entry point for all ${VERSION} data
 * Generated: ${new Date().toISOString()}
 */

// Re-export everything
export * from "./functions";
export * from "./variables";
export * from "./constants";
export * from "./keywords";
export * from "./function-behavior";

// Re-export types
export type {
	PineFunction,
	PineVariable,
	PineConstant,
	PineParameter,
	PineType,
	FunctionFlags,
} from "../schema/types";

// Import for convenience object
import { FUNCTIONS_BY_NAME, FUNCTION_NAMES, FUNCTIONS_BY_NAMESPACE } from "./functions";
import { VARIABLES_BY_NAME, VARIABLE_NAMES, VARIABLES_BY_NAMESPACE, STANDALONE_VARIABLES } from "./variables";
import { CONSTANTS_BY_NAME, CONSTANT_NAMES, CONSTANTS_BY_NAMESPACE } from "./constants";
import { KEYWORDS } from "./keywords";

/**
 * Convenience namespace for ${VERSION} language data
 * Provides unified access to all language constructs
 */
export const Pine${VERSION.toUpperCase()} = {
	version: "${VERSION}" as const,

	// Data stores
	functions: FUNCTIONS_BY_NAME,
	variables: VARIABLES_BY_NAME,
	constants: CONSTANTS_BY_NAME,
	keywords: KEYWORDS,

	// Namespace groupings
	functionsByNamespace: FUNCTIONS_BY_NAMESPACE,
	variablesByNamespace: VARIABLES_BY_NAMESPACE,
	constantsByNamespace: CONSTANTS_BY_NAMESPACE,

	// Fast lookups
	getFunction: (name: string) => FUNCTIONS_BY_NAME.get(name),
	getVariable: (name: string) => VARIABLES_BY_NAME.get(name),
	getConstant: (name: string) => CONSTANTS_BY_NAME.get(name),

	// Membership checks
	isFunction: (name: string) => FUNCTION_NAMES.has(name),
	isVariable: (name: string) => VARIABLE_NAMES.has(name),
	isConstant: (name: string) => CONSTANT_NAMES.has(name),
	isKeyword: (name: string) => KEYWORDS.has(name),
	isStandaloneVariable: (name: string) => STANDALONE_VARIABLES.has(name),

	// Completion helpers
	getNamespaceMembers: (namespace: string) => {
		const funcs = FUNCTIONS_BY_NAMESPACE.get(namespace) || [];
		const vars = VARIABLES_BY_NAMESPACE.get(namespace) || [];
		const consts = CONSTANTS_BY_NAMESPACE.get(namespace) || [];
		return { functions: funcs, variables: vars, constants: consts };
	},

	// All namespaces
	getAllNamespaces: () => {
		const namespaces = new Set<string>();
		for (const ns of FUNCTIONS_BY_NAMESPACE.keys()) {
			if (ns !== "_global") namespaces.add(ns);
		}
		for (const ns of VARIABLES_BY_NAMESPACE.keys()) {
			if (ns !== "_standalone") namespaces.add(ns);
		}
		for (const ns of CONSTANTS_BY_NAMESPACE.keys()) {
			namespaces.add(ns);
		}
		return namespaces;
	},
};

// Default export
export default Pine${VERSION.toUpperCase()};
`;

	fs.writeFileSync(path.join(OUTPUT_DIR, "index.ts"), content);
	console.log("   index.ts");
}

// =============================================================================
// MAIN
// =============================================================================

function main(): void {
	console.log(`\nGenerating Pine Script ${VERSION} data...\n`);
	console.log(`Raw data: ${RAW_DIR}`);
	console.log(`Output: ${OUTPUT_DIR}\n`);

	// Ensure output directory exists
	if (!fs.existsSync(OUTPUT_DIR)) {
		fs.mkdirSync(OUTPUT_DIR, { recursive: true });
	}

	// Load raw data
	if (!fs.existsSync(DETAILS_FILE)) {
		console.error(`Details file not found: ${DETAILS_FILE}`);
		process.exit(1);
	}
	if (!fs.existsSync(CONSTRUCTS_FILE)) {
		console.error(`Constructs file not found: ${CONSTRUCTS_FILE}`);
		process.exit(1);
	}

	const details: DetailsData = JSON.parse(fs.readFileSync(DETAILS_FILE, "utf8"));
	const constructs: ConstructsData = JSON.parse(fs.readFileSync(CONSTRUCTS_FILE, "utf8"));

	// Generate all files
	const functions = generateFunctions(details, constructs);
	const variables = generateVariables(details, constructs);
	const constants = generateConstants(details, constructs);
	const keywords = generateKeywords(constructs);
	generateVersionIndex(functions, variables, constants, keywords);

	console.log(`\nPine Script ${VERSION} data generated successfully!`);
	console.log(`   ${functions.length} functions`);
	console.log(`   ${variables.length} variables`);
	console.log(`   ${constants.length} constants`);
	console.log(`   ${keywords.length} keywords\n`);
}

main();
