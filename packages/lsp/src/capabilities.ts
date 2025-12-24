import {
	type ServerCapabilities,
	TextDocumentSyncKind,
} from "vscode-languageserver/node";

/**
 * Returns the server capabilities for the Pine Script LSP.
 */
export function getCapabilities(): ServerCapabilities {
	return {
		textDocumentSync: {
			openClose: true,
			change: TextDocumentSyncKind.Full,
		},
		completionProvider: {
			triggerCharacters: [".", "="],
			resolveProvider: false,
		},
		hoverProvider: true,
		signatureHelpProvider: {
			triggerCharacters: ["(", ","],
		},
		documentFormattingProvider: true,
	};
}
