/**
 * Pine Script Language Data Schema
 *
 * Unified type definitions for all Pine Script language constructs.
 * Version-agnostic - used by v4, v5, and v6 data.
 *
 * Design Principles:
 * - Single source of truth for each construct type
 * - Optimized for LSP operations (completion, hover, validation)
 * - Strong typing throughout
 */

// =============================================================================
// PRIMITIVE TYPES
// =============================================================================

/**
 * Pine Script type qualifiers
 * - const: Compile-time constant, never changes
 * - input: User input, constant after script start
 * - simple: Calculated once, doesn't change per bar
 * - series: Can change on every bar
 */
export type TypeQualifier = "const" | "input" | "simple" | "series";

/**
 * Pine Script base types
 */
export type BaseType =
	| "int"
	| "float"
	| "bool"
	| "string"
	| "color"
	| "line"
	| "label"
	| "box"
	| "table"
	| "polyline"
	| "chart.point"
	| "linefill"
	| "void"
	| "na"
	| "unknown";

/**
 * Pine Script qualified types (qualifier + base type)
 * Examples: "series<float>", "simple<string>", "const<int>"
 */
export type QualifiedType =
	| `${TypeQualifier}<${BaseType}>`
	| `array<${BaseType}>`
	| `matrix<${BaseType}>`
	| `map<${BaseType},${BaseType}>`;

/**
 * Full Pine Script type - can be base type, qualified type, or special
 */
export type PineType = BaseType | QualifiedType;

// =============================================================================
// FUNCTION SCHEMA
// =============================================================================

/**
 * Function parameter definition
 */
export interface PineParameter {
	/** Parameter name */
	name: string;
	/** Parameter type */
	type: string; // Using string to allow complex types like "series int/float"
	/** Parameter description */
	description: string;
	/** Whether this parameter is required */
	required: boolean;
	/** Default value if optional */
	default?: string;
}

/**
 * Function behavior flags
 */
export interface FunctionFlags {
	/** Can only be called at script top-level (indicator, plot, etc.) */
	topLevelOnly?: boolean;
	/** Returns a series type */
	seriesReturning?: boolean;
	/** Accepts variable number of arguments (math.max, str.format, etc.) */
	variadic?: boolean;
	/** Minimum arguments for variadic functions */
	minArgs?: number;
	/** Maximum arguments for variadic functions (undefined = unlimited) */
	maxArgs?: number;
}

/**
 * Complete function definition
 */
export interface PineFunction {
	/** Full function name (e.g., "ta.sma", "plot") */
	name: string;
	/** Namespace if applicable (e.g., "ta", "math") */
	namespace?: string;
	/** Function syntax/signature (e.g., "ta.sma(source, length) → series float") */
	syntax: string;
	/** Function description */
	description: string;
	/** Function parameters */
	parameters: PineParameter[];
	/** Return type */
	returns: string;
	/** Behavior flags */
	flags?: FunctionFlags;
	/** Deprecation message if deprecated */
	deprecated?: string;
	/** Version when introduced */
	since?: "v4" | "v5" | "v6";
	/** Example code */
	example?: string;
}

// =============================================================================
// VARIABLE SCHEMA
// =============================================================================

/**
 * Built-in variable definition
 */
export interface PineVariable {
	/** Variable name (e.g., "close", "syminfo.ticker") */
	name: string;
	/** Namespace if applicable (e.g., "syminfo", "barstate") */
	namespace?: string;
	/** Variable type */
	type: PineType;
	/** Type qualifier (series, simple, const) */
	qualifier: TypeQualifier;
	/** Variable description */
	description: string;
	/** Version when introduced */
	since?: "v4" | "v5" | "v6";
}

// =============================================================================
// CONSTANT SCHEMA
// =============================================================================

/**
 * Constant definition (e.g., color.red, shape.circle)
 */
export interface PineConstant {
	/** Full constant name (e.g., "color.red", "shape.circle") */
	name: string;
	/** Namespace (e.g., "color", "shape") */
	namespace: string;
	/** Short name without namespace (e.g., "red", "circle") */
	shortName: string;
	/** Constant type */
	type: PineType;
	/** Description */
	description?: string;
}

// =============================================================================
// KEYWORD SCHEMA
// =============================================================================

/**
 * Language keyword definition
 */
export interface PineKeyword {
	/** Keyword name */
	name: string;
	/** Keyword category */
	category: "control" | "declaration" | "operator" | "literal" | "type";
	/** Description */
	description?: string;
}

// =============================================================================
// NAMESPACE SCHEMA
// =============================================================================

/**
 * Namespace definition with all members
 */
export interface PineNamespace {
	/** Namespace name (e.g., "ta", "math", "color") */
	name: string;
	/** Functions in this namespace */
	functions: string[];
	/** Variables in this namespace */
	variables: string[];
	/** Constants in this namespace */
	constants: string[];
	/** Description */
	description?: string;
}

// =============================================================================
// VERSION DATA SCHEMA
// =============================================================================

/**
 * Complete language data for a Pine Script version
 */
export interface PineVersionData {
	/** Version identifier */
	version: "v4" | "v5" | "v6";
	/** All functions indexed by name */
	functions: Map<string, PineFunction>;
	/** All variables indexed by name */
	variables: Map<string, PineVariable>;
	/** All constants indexed by name */
	constants: Map<string, PineConstant>;
	/** All keywords */
	keywords: Set<string>;
	/** All namespaces indexed by name */
	namespaces: Map<string, PineNamespace>;
}

// =============================================================================
// LSP HELPER TYPES
// =============================================================================

/**
 * Completion item for LSP
 */
export interface CompletionItem {
	label: string;
	kind: "function" | "variable" | "constant" | "keyword" | "namespace";
	detail?: string;
	documentation?: string;
	insertText?: string;
	sortText?: string;
}

/**
 * Hover information for LSP
 */
export interface HoverInfo {
	name: string;
	type: string;
	description: string;
	syntax?: string;
	example?: string;
}

/**
 * Signature help for LSP
 */
export interface SignatureInfo {
	label: string;
	documentation?: string;
	parameters: {
		label: string;
		documentation?: string;
	}[];
	activeParameter?: number;
}
