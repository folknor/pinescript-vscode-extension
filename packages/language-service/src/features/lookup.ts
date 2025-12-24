import type { PineParameter } from "../../../../pine-data/schema/types";
import {
	CONSTANTS_BY_NAME,
	FUNCTIONS_BY_NAME,
	VARIABLES_BY_NAME,
} from "../../../../pine-data/v6";
import type { ParameterInfo, SymbolInfo } from "../types";

/**
 * Look up documentation for a symbol (function, variable, or constant).
 * This is a static lookup that doesn't require a document context.
 */
export function getSymbolInfo(symbol: string): SymbolInfo | null {
	// Check variables first
	const variable = VARIABLES_BY_NAME.get(symbol);
	if (variable) {
		return {
			name: variable.name,
			kind: "variable",
			type: variable.type as string,
			description: variable.description,
			namespace: variable.namespace,
		};
	}

	// Check functions
	const func = FUNCTIONS_BY_NAME.get(symbol);
	if (func) {
		const parameters: ParameterInfo[] = func.parameters.map(
			(p: PineParameter) => ({
				label: p.name,
				documentation: p.description,
			}),
		);

		return {
			name: func.name,
			kind: "function",
			syntax: func.syntax,
			description: func.description,
			returns: func.returns,
			parameters,
			namespace: func.namespace,
			deprecated: func.deprecated !== undefined,
		};
	}

	// Check constants
	const constant = CONSTANTS_BY_NAME.get(symbol);
	if (constant) {
		return {
			name: constant.name,
			kind: "constant",
			type: constant.type as string,
			description: constant.description || "",
			namespace: constant.namespace,
		};
	}

	return null;
}

/**
 * Get all function names, optionally filtered by namespace.
 */
export function getAllFunctionNames(namespace?: string): string[] {
	const names: string[] = [];
	for (const [name, func] of FUNCTIONS_BY_NAME) {
		if (!namespace || func.namespace === namespace) {
			names.push(name);
		}
	}
	return names.sort();
}

/**
 * Get all variable names, optionally filtered by namespace.
 */
export function getAllVariableNames(namespace?: string): string[] {
	const names: string[] = [];
	for (const [name, variable] of VARIABLES_BY_NAME) {
		if (!namespace || variable.namespace === namespace) {
			names.push(name);
		}
	}
	return names.sort();
}

/**
 * Get all constant names, optionally filtered by namespace.
 */
export function getAllConstantNames(namespace?: string): string[] {
	const names: string[] = [];
	for (const [name, constant] of CONSTANTS_BY_NAME) {
		if (!namespace || constant.namespace === namespace) {
			names.push(name);
		}
	}
	return names.sort();
}
