/**
 * Type converters between language-service types and LSP types.
 *
 * The language-service uses protocol-agnostic types, while LSP uses vscode-languageserver types.
 * These converters bridge the gap.
 */

import {
	type CodeAction as LSPCodeAction,
	type CodeActionKind as LSPCodeActionKind,
	type CompletionItem as LSPCompletionItem,
	type CompletionItemKind as LSPCompletionItemKind,
	type Diagnostic as LSPDiagnostic,
	type DiagnosticSeverity as LSPDiagnosticSeverity,
	type DocumentSymbol as LSPDocumentSymbol,
	type FoldingRange as LSPFoldingRange,
	FoldingRangeKind as LSPFoldingRangeKind,
	type Hover as LSPHover,
	type InlayHint as LSPInlayHint,
	type InlayHintKind as LSPInlayHintKind,
	type InsertTextFormat as LSPInsertTextFormat,
	type SignatureHelp as LSPSignatureHelp,
	type SymbolKind as LSPSymbolKind,
	type TextEdit as LSPTextEdit,
	MarkupKind,
	type ParameterInformation,
} from "vscode-languageserver/node";

import type {
	CodeAction,
	CompletionItem,
	Diagnostic,
	DocumentSymbol,
	FoldingRange,
	HoverInfo,
	InlayHint,
	SignatureHelp,
	TextEdit,
} from "../../language-service/src/types";

/**
 * Convert language-service Diagnostic to LSP Diagnostic.
 */
export function convertDiagnostic(diagnostic: Diagnostic): LSPDiagnostic {
	return {
		range: diagnostic.range,
		severity: diagnostic.severity as LSPDiagnosticSeverity,
		message: diagnostic.message,
		source: diagnostic.source,
		code: diagnostic.code,
	};
}

/**
 * Convert language-service CompletionItem to LSP CompletionItem.
 */
export function convertCompletionItem(item: CompletionItem): LSPCompletionItem {
	return {
		label: item.label,
		kind: item.kind as LSPCompletionItemKind,
		detail: item.detail,
		documentation: item.documentation
			? { kind: MarkupKind.Markdown, value: item.documentation }
			: undefined,
		insertText: item.insertText,
		insertTextFormat: item.insertTextFormat as LSPInsertTextFormat,
	};
}

/**
 * Convert language-service HoverInfo to LSP Hover.
 */
export function convertHover(hover: HoverInfo): LSPHover {
	return {
		contents: {
			kind: MarkupKind.Markdown,
			value: hover.contents,
		},
		range: hover.range,
	};
}

/**
 * Convert language-service SignatureHelp to LSP SignatureHelp.
 */
export function convertSignatureHelp(
	signatureHelp: SignatureHelp,
): LSPSignatureHelp {
	return {
		signatures: signatureHelp.signatures.map((sig) => ({
			label: sig.label,
			documentation: sig.documentation
				? { kind: MarkupKind.Markdown, value: sig.documentation }
				: undefined,
			parameters: sig.parameters.map(
				(param): ParameterInformation => ({
					label: param.label,
					documentation: param.documentation
						? { kind: MarkupKind.Markdown, value: param.documentation }
						: undefined,
				}),
			),
		})),
		activeSignature: signatureHelp.activeSignature,
		activeParameter: signatureHelp.activeParameter,
	};
}

/**
 * Convert language-service TextEdit to LSP TextEdit.
 */
export function convertTextEdit(edit: TextEdit): LSPTextEdit {
	return {
		range: edit.range,
		newText: edit.newText,
	};
}

/**
 * Convert language-service DocumentSymbol to LSP DocumentSymbol.
 */
export function convertDocumentSymbol(symbol: DocumentSymbol): LSPDocumentSymbol {
	return {
		name: symbol.name,
		kind: symbol.kind as LSPSymbolKind,
		range: symbol.range,
		selectionRange: symbol.selectionRange,
		children: symbol.children?.map(convertDocumentSymbol),
	};
}

/**
 * Convert LSP Diagnostic to language-service Diagnostic.
 * (reverse direction for code action context)
 */
export function convertLSPDiagnostic(diagnostic: LSPDiagnostic): Diagnostic {
	return {
		range: diagnostic.range,
		severity: diagnostic.severity as number,
		message: diagnostic.message,
		source: diagnostic.source,
		code: diagnostic.code?.toString(),
	};
}

/**
 * Convert language-service CodeAction to LSP CodeAction.
 */
export function convertCodeAction(action: CodeAction): LSPCodeAction {
	return {
		title: action.title,
		kind: action.kind as LSPCodeActionKind,
		diagnostics: action.diagnostics?.map(convertDiagnostic),
		isPreferred: action.isPreferred,
		edit: action.edit
			? {
					changes: Object.fromEntries(
						Object.entries(action.edit.changes).map(([uri, edits]) => [
							uri,
							edits.map(convertTextEdit),
						]),
					),
				}
			: undefined,
	};
}

/**
 * Convert language-service InlayHint to LSP InlayHint.
 */
export function convertInlayHint(hint: InlayHint): LSPInlayHint {
	return {
		position: hint.position,
		label: hint.label,
		kind: hint.kind as LSPInlayHintKind,
		paddingLeft: hint.paddingLeft,
		paddingRight: hint.paddingRight,
	};
}

/**
 * Convert language-service FoldingRange to LSP FoldingRange.
 */
export function convertFoldingRange(range: FoldingRange): LSPFoldingRange {
	return {
		startLine: range.startLine,
		endLine: range.endLine,
		kind: range.kind as LSPFoldingRangeKind | undefined,
	};
}
