/**
 * Rename Symbol handler.
 * Handles textDocument/rename and textDocument/prepareRename requests.
 */

import type {
	Connection,
	PrepareRenameParams,
	Range,
	RenameParams,
	WorkspaceEdit,
} from "vscode-languageserver/node";
import type { PineLanguageService } from "../../../language-service/src";

/**
 * Setup rename handlers.
 */
export function setupRenameHandler(
	connection: Connection,
	languageService: PineLanguageService,
): void {
	// Prepare rename - check if symbol can be renamed
	connection.onPrepareRename(
		(params: PrepareRenameParams): Range | null => {
			const result = languageService.prepareRename(
				params.textDocument.uri,
				params.position,
			);

			if (!result) return null;

			return result.range;
		},
	);

	// Rename - perform the rename
	connection.onRenameRequest((params: RenameParams): WorkspaceEdit | null => {
		const result = languageService.rename(
			params.textDocument.uri,
			params.position,
			params.newName,
		);

		if (!result) return null;

		// Convert to WorkspaceEdit format
		return {
			changes: {
				[params.textDocument.uri]: result.changes.map((edit) => ({
					range: edit.range,
					newText: edit.newText,
				})),
			},
		};
	});
}
