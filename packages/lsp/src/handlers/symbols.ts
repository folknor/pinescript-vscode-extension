/**
 * Document symbols handler.
 * Provides outline view and breadcrumbs support.
 */

import type {
	Connection,
	DocumentSymbolParams,
} from "vscode-languageserver/node";
import type { PineLanguageService } from "../../../language-service/src";
import { convertDocumentSymbol } from "../converters";

/**
 * Setup document symbols handler.
 */
export function setupSymbolsHandler(
	connection: Connection,
	languageService: PineLanguageService,
): void {
	connection.onDocumentSymbol((params: DocumentSymbolParams) => {
		const symbols = languageService.getDocumentSymbols(params.textDocument.uri);
		return symbols.map(convertDocumentSymbol);
	});
}
