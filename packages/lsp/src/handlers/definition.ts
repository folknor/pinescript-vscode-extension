/**
 * Go to Definition handler.
 * Handles textDocument/definition requests.
 */

import type {
	Connection,
	DefinitionParams,
	Location as LSPLocation,
} from "vscode-languageserver/node";
import type { PineLanguageService } from "../../../language-service/src";

/**
 * Setup definition handler.
 */
export function setupDefinitionHandler(
	connection: Connection,
	languageService: PineLanguageService,
): void {
	connection.onDefinition((params: DefinitionParams): LSPLocation | null => {
		const result = languageService.getDefinition(
			params.textDocument.uri,
			params.position,
		);

		if (!result) return null;

		// If it's a built-in, we can't go to its definition
		// (could optionally show a message or open docs)
		if (result.isBuiltin) {
			// Return null - VS Code will show "No definition found"
			// In the future, we could open documentation instead
			return null;
		}

		// Return the location for user-defined symbols
		if (result.location) {
			return {
				uri: result.location.uri,
				range: result.location.range,
			};
		}

		return null;
	});
}
