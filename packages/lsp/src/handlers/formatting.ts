/**
 * Formatting handler.
 * Provides code formatting.
 */

import type {
	Connection,
	DocumentFormattingParams,
} from "vscode-languageserver/node";
import type { PineLanguageService } from "../../../language-service/src";
import { convertTextEdit } from "../converters";

/**
 * Setup formatting handler.
 */
export function setupFormattingHandler(
	connection: Connection,
	languageService: PineLanguageService,
): void {
	connection.onDocumentFormatting((params: DocumentFormattingParams) => {
		const edits = languageService.format(params.textDocument.uri, {
			tabSize: params.options.tabSize,
			insertSpaces: params.options.insertSpaces,
		});

		return edits.map(convertTextEdit);
	});
}
