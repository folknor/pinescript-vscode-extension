/**
 * Find References handler.
 * Handles textDocument/references requests.
 */

import type {
	Connection,
	Location as LSPLocation,
	ReferenceParams,
} from "vscode-languageserver/node";
import type { PineLanguageService } from "../../../language-service/src";

/**
 * Setup references handler.
 */
export function setupReferencesHandler(
	connection: Connection,
	languageService: PineLanguageService,
): void {
	connection.onReferences((params: ReferenceParams): LSPLocation[] => {
		const locations = languageService.getReferences(
			params.textDocument.uri,
			params.position,
			{ includeDeclaration: params.context.includeDeclaration },
		);

		return locations.map((loc) => ({
			uri: loc.uri,
			range: loc.range,
		}));
	});
}
