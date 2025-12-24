/**
 * Completion handler.
 * Provides IntelliSense suggestions.
 */

import type { CompletionParams, Connection } from "vscode-languageserver/node";
import type { PineLanguageService } from "../../../language-service/src";
import { convertCompletionItem } from "../converters";

/**
 * Setup completion handler.
 */
export function setupCompletionHandler(
	connection: Connection,
	languageService: PineLanguageService,
): void {
	connection.onCompletion((params: CompletionParams) => {
		const completions = languageService.getCompletions(
			params.textDocument.uri,
			params.position,
		);

		return completions.map(convertCompletionItem);
	});
}
