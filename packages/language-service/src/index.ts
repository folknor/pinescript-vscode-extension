// Main service export

// Document classes
export { DocumentManager, ParsedDocument } from "./documents";
// Feature implementations (for direct use if needed)
export {
	getAllCompletions,
	getCompletions,
	getNamespaceCompletions,
} from "./features/completions";
export { getDiagnostics } from "./features/diagnostics";
export { format, formatToString } from "./features/formatting";
export { getHover } from "./features/hover";
export {
	getAllConstantNames,
	getAllFunctionNames,
	getAllVariableNames,
	getSymbolInfo,
} from "./features/lookup";
export { getSignatureHelp } from "./features/signatures";
export { getDocumentSymbols } from "./features/symbols";
export type { HoverOptions } from "./PineLanguageService";
export { PineLanguageService } from "./PineLanguageService";
// Types
export {
	type CompletionItem,
	// Completions
	CompletionItemKind,
	type Diagnostic,
	// Diagnostics
	DiagnosticSeverity,
	type DocumentSymbol,
	type FormattingOptions,
	// Hover
	type HoverInfo,
	InsertTextFormat,
	type Location,
	// Signature Help
	type ParameterInfo,
	// Position & Range
	type Position,
	type Range,
	type SignatureHelp,
	type SignatureInfo,
	type SymbolInfo,
	// Symbols
	SymbolKind,
	// Formatting
	type TextEdit,
} from "./types";
