// Analyzer module - Semantic analysis for Pine Script
// Re-exports all analyzer components for convenient imports

export {
	buildFunctionSignatures,
	DEPRECATED_V5_CONSTANTS,
	type FunctionSignature,
	getMinArgsForVariadic,
	isTopLevelOnly,
	isVariadicFunction,
	KNOWN_NAMESPACES,
	mapReturnTypeToPineType,
	mapToPineType,
	NAMESPACE_PROPERTIES,
	type ParameterInfo,
} from "./builtins";
export {
	DiagnosticSeverity,
	UnifiedPineValidator,
	type ValidationError,
} from "./checker";
export { Scope, type Symbol, SymbolTable } from "./symbols";
export { type PineType, TypeChecker, TypeInfo } from "./types";
