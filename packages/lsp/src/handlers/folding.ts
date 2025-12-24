/**
 * Folding Ranges handler.
 * Handles textDocument/foldingRange requests.
 */

import type {
	Connection,
	FoldingRange,
	FoldingRangeParams,
} from "vscode-languageserver/node";
import type { PineLanguageService } from "../../../language-service/src";
import { convertFoldingRange } from "../converters";

/**
 * Setup folding range handler.
 */
export function setupFoldingHandler(
	connection: Connection,
	languageService: PineLanguageService,
): void {
	connection.onFoldingRanges(
		(params: FoldingRangeParams): FoldingRange[] | null => {
			const ranges = languageService.getFoldingRanges(params.textDocument.uri);

			if (ranges.length === 0) return null;

			return ranges.map(convertFoldingRange);
		},
	);
}
