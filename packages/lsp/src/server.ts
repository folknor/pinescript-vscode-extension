/**
 * Pine Script Language Server.
 * Communicates via JSON-RPC over stdio.
 */

import {
	createConnection,
	type InitializeParams,
	type InitializeResult,
	ProposedFeatures,
	TextDocuments,
} from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";
import { PineLanguageService } from "../../language-service/src";
import { getCapabilities } from "./capabilities";
import { setupCompletionHandler } from "./handlers/completion";
import { setupDefinitionHandler } from "./handlers/definition";
import { setupDocumentHandlers } from "./handlers/documents";
import { setupFormattingHandler } from "./handlers/formatting";
import { setupHoverHandler } from "./handlers/hover";
import { setupSignatureHandler } from "./handlers/signature";
import { setupSymbolsHandler } from "./handlers/symbols";

// Create LSP connection using stdio
const connection = createConnection(ProposedFeatures.all);

// Document manager from vscode-languageserver
const documents = new TextDocuments(TextDocument);

// Language service instance
const languageService = new PineLanguageService();

// ========== Lifecycle Handlers ==========

connection.onInitialize((_params: InitializeParams): InitializeResult => {
	connection.console.log("Pine Script Language Server initialized");

	return {
		capabilities: getCapabilities(),
	};
});

connection.onInitialized(() => {
	connection.console.log("Pine Script Language Server ready");
});

connection.onShutdown(() => {
	connection.console.log("Pine Script Language Server shutting down");
});

// ========== Setup Feature Handlers ==========

setupDocumentHandlers(connection, documents, languageService);
setupCompletionHandler(connection, languageService);
setupHoverHandler(connection, languageService);
setupSignatureHandler(connection, languageService);
setupFormattingHandler(connection, languageService);
setupSymbolsHandler(connection, languageService);
setupDefinitionHandler(connection, languageService);

// ========== Start Listening ==========

// Listen for document events
documents.listen(connection);

// Start listening for incoming messages
connection.listen();
