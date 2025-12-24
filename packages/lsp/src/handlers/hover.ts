/**
 * Hover handler.
 * Provides documentation on hover.
 */

import type { Connection, HoverParams } from "vscode-languageserver/node";
import type { PineLanguageService } from "../../../language-service/src";
import { convertHover } from "../converters";

/**
 * Setup hover handler.
 */
export function setupHoverHandler(
	connection: Connection,
	languageService: PineLanguageService,
): void {
	connection.onHover((params: HoverParams) => {
		const hover = languageService.getHover(
			params.textDocument.uri,
			params.position,
		);

		if (!hover) return null;

		return convertHover(hover);
	});
}
