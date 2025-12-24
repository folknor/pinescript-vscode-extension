/**
 * Document synchronization handlers.
 * Manages document lifecycle: open, change, close.
 */

import type { Connection, TextDocuments } from "vscode-languageserver/node";
import type { TextDocument } from "vscode-languageserver-textdocument";
import type { PineLanguageService } from "../../../language-service/src";
import { convertDiagnostic } from "../converters";

/**
 * Setup document sync handlers.
 */
export function setupDocumentHandlers(
	connection: Connection,
	documents: TextDocuments<TextDocument>,
	languageService: PineLanguageService,
): void {
	// Handle document open
	documents.onDidOpen((event) => {
		const doc = event.document;
		languageService.openDocument(doc.uri, doc.getText(), doc.version);
		publishDiagnostics(connection, languageService, doc.uri);
	});

	// Handle document change
	documents.onDidChangeContent((event) => {
		const doc = event.document;
		languageService.updateDocument(doc.uri, doc.getText(), doc.version);
		publishDiagnostics(connection, languageService, doc.uri);
	});

	// Handle document close
	documents.onDidClose((event) => {
		languageService.closeDocument(event.document.uri);
		// Clear diagnostics
		connection.sendDiagnostics({ uri: event.document.uri, diagnostics: [] });
	});
}

/**
 * Validate and publish diagnostics for a document.
 */
function publishDiagnostics(
	connection: Connection,
	languageService: PineLanguageService,
	uri: string,
): void {
	const diagnostics = languageService.getDiagnostics(uri);
	connection.sendDiagnostics({
		uri,
		diagnostics: diagnostics.map(convertDiagnostic),
	});
}
