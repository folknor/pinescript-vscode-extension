/**
 * Type converters between language-service types and LSP types.
 *
 * The language-service uses protocol-agnostic types, while LSP uses vscode-languageserver types.
 * These converters bridge the gap.
 */

import {
	type CompletionItem as LSPCompletionItem,
	type CompletionItemKind as LSPCompletionItemKind,
	type Diagnostic as LSPDiagnostic,
	type DiagnosticSeverity as LSPDiagnosticSeverity,
	type Hover as LSPHover,
	type InsertTextFormat as LSPInsertTextFormat,
	type SignatureHelp as LSPSignatureHelp,
	type TextEdit as LSPTextEdit,
	MarkupKind,
	type ParameterInformation,
	SignatureInformation,
} from "vscode-languageserver/node";

import type {
	CompletionItem,
	CompletionItemKind,
	Diagnostic,
	DiagnosticSeverity,
	HoverInfo,
	InsertTextFormat,
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
