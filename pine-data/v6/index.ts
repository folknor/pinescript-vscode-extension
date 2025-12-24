/**
 * Pine Script V6 Language Data
 * Auto-generated - single entry point for all v6 data
 * Generated: 2025-12-23T22:02:17.733Z
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
 * Convenience namespace for v6 language data
 * Provides unified access to all language constructs
 */
export const PineV6 = {
	version: "v6" as const,

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
export default PineV6;
