// Analyzer module - Semantic analysis for Pine Script
// Re-exports all analyzer components for convenient imports

export { type PineType, TypeInfo, TypeChecker } from "./types";
export { type Symbol, Scope, SymbolTable } from "./symbols";
export { UnifiedPineValidator, type ValidationError, DiagnosticSeverity } from "./checker";
export {
	type FunctionSignature,
	type ParameterInfo,
	TOP_LEVEL_ONLY_FUNCTIONS,
	DEPRECATED_V5_CONSTANTS,
	NAMESPACE_PROPERTIES,
	KNOWN_NAMESPACES,
	buildFunctionSignatures,
	mapToPineType,
	mapReturnTypeToPineType,
	isVariadicFunction,
	getMinArgsForVariadic,
} from "./builtins";
