/**
 * Protocol-agnostic types for the Pine Script language service.
 * These types are intentionally similar to LSP types but have no external dependencies.
 */

// Position & Range (0-indexed, like LSP)
export interface Position {
	line: number; // 0-indexed
	character: number; // 0-indexed (UTF-16 code units)
}

export interface Range {
	start: Position;
	end: Position;
}

export interface Location {
	uri: string;
	range: Range;
}

// Diagnostics
export enum DiagnosticSeverity {
	Error = 1,
	Warning = 2,
	Information = 3,
	Hint = 4,
}

export interface Diagnostic {
	range: Range;
	severity: DiagnosticSeverity;
	message: string;
	source?: string; // "pine-lint"
	code?: string; // Error code for lookup
}

// Completions
export enum CompletionItemKind {
	Text = 1,
	Method = 2,
	Function = 3,
	Constructor = 4,
	Field = 5,
	Variable = 6,
	Class = 7,
	Interface = 8,
	Module = 9,
	Property = 10,
	Unit = 11,
	Value = 12,
	Enum = 13,
	Keyword = 14,
	Snippet = 15,
	Color = 16,
	File = 17,
	Reference = 18,
	Folder = 19,
	EnumMember = 20,
	Constant = 21,
	Struct = 22,
	Event = 23,
	Operator = 24,
	TypeParameter = 25,
}

export enum InsertTextFormat {
	PlainText = 1,
	Snippet = 2,
}

export interface CompletionItem {
	label: string;
	kind: CompletionItemKind;
	detail?: string; // Short description (shown inline)
	documentation?: string; // Full markdown docs
	insertText?: string; // Text to insert (may differ from label)
	insertTextFormat?: InsertTextFormat;
}

// Hover
export interface HoverInfo {
	contents: string; // Markdown
	range?: Range;
}

// Signature Help
export interface ParameterInfo {
	label: string;
	documentation?: string;
}

export interface SignatureInfo {
	label: string; // Full signature: "ta.sma(source, length)"
	documentation?: string; // Markdown description
	parameters: ParameterInfo[];
}

export interface SignatureHelp {
	signatures: SignatureInfo[];
	activeSignature: number;
	activeParameter: number;
}

// Formatting
export interface TextEdit {
	range: Range;
	newText: string;
}

export interface FormattingOptions {
	tabSize: number;
	insertSpaces: boolean;
}

// Document Symbols
export enum SymbolKind {
	File = 1,
	Module = 2,
	Namespace = 3,
	Package = 4,
	Class = 5,
	Method = 6,
	Property = 7,
	Field = 8,
	Constructor = 9,
	Enum = 10,
	Interface = 11,
	Function = 12,
	Variable = 13,
	Constant = 14,
	String = 15,
	Number = 16,
	Boolean = 17,
	Array = 18,
	Object = 19,
	Key = 20,
	Null = 21,
	EnumMember = 22,
	Struct = 23,
	Event = 24,
	Operator = 25,
	TypeParameter = 26,
}

export interface DocumentSymbol {
	name: string;
	kind: SymbolKind;
	range: Range;
	selectionRange: Range;
	children?: DocumentSymbol[];
}

// Symbol lookup (static, no document needed)
export interface SymbolInfo {
	name: string;
	kind: "function" | "variable" | "constant";
	syntax?: string;
	description: string;
	returns?: string;
	type?: string;
	parameters?: ParameterInfo[];
	namespace?: string;
	deprecated?: boolean;
}

// Code Actions
export enum CodeActionKind {
	Empty = "",
	QuickFix = "quickfix",
	Refactor = "refactor",
	RefactorExtract = "refactor.extract",
	RefactorInline = "refactor.inline",
	RefactorRewrite = "refactor.rewrite",
	Source = "source",
	SourceOrganizeImports = "source.organizeImports",
	SourceFixAll = "source.fixAll",
}

export interface CodeAction {
	title: string;
	kind: CodeActionKind;
	diagnostics?: Diagnostic[];
	isPreferred?: boolean;
	edit?: WorkspaceEdit;
}

export interface WorkspaceEdit {
	changes: { [uri: string]: TextEdit[] };
}

// Inlay Hints
export enum InlayHintKind {
	Type = 1,
	Parameter = 2,
}

export interface InlayHint {
	position: Position;
	label: string;
	kind: InlayHintKind;
	paddingLeft?: boolean;
	paddingRight?: boolean;
}

// Folding Ranges
export enum FoldingRangeKind {
	Comment = "comment",
	Imports = "imports",
	Region = "region",
}

export interface FoldingRange {
	startLine: number;
	endLine: number;
	kind?: FoldingRangeKind;
}
