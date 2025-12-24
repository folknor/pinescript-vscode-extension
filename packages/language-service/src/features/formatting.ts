import type { ParsedDocument } from "../documents/ParsedDocument";
import type { FormattingOptions, TextEdit } from "../types";

/**
 * Format a document.
 * - Trims trailing whitespace
 * - Normalizes consecutive blank lines (max 1)
 * - Ensures final newline
 */
export function format(
	doc: ParsedDocument,
	_options?: FormattingOptions,
): TextEdit[] {
	const edits: TextEdit[] = [];
	const lines = doc.lines;

	let lastWasEmpty = false;
	const resultLines: string[] = [];
	const linesToDelete: number[] = [];

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const trimmed = line.replace(/[\t ]+$/g, ""); // Trim trailing whitespace
		const isEmpty = trimmed.length === 0;

		if (isEmpty && lastWasEmpty) {
			// Mark extra blank line for deletion
			linesToDelete.push(i);
		} else {
			resultLines.push(trimmed);
		}

		lastWasEmpty = isEmpty;
	}

	// Build the formatted content
	let formatted = resultLines.join("\n");

	// Ensure final newline
	if (!formatted.endsWith("\n")) {
		formatted += "\n";
	}

	// If there are changes, return a single edit replacing the entire document
	if (formatted !== doc.content) {
		edits.push({
			range: {
				start: { line: 0, character: 0 },
				end: {
					line: lines.length - 1,
					character: lines[lines.length - 1]?.length ?? 0,
				},
			},
			newText: formatted,
		});
	}

	return edits;
}

/**
 * Format and return the formatted string directly.
 * Useful for MCP and CLI tools that just want the result.
 */
export function formatToString(code: string): string {
	const lines = code.split("\n");
	const resultLines: string[] = [];
	let lastWasEmpty = false;

	for (const line of lines) {
		const trimmed = line.replace(/[\t ]+$/g, "");
		const isEmpty = trimmed.length === 0;

		if (isEmpty && lastWasEmpty) {
			// Skip extra blank lines
			continue;
		}

		resultLines.push(trimmed);
		lastWasEmpty = isEmpty;
	}

	let formatted = resultLines.join("\n");

	// Ensure final newline
	if (!formatted.endsWith("\n")) {
		formatted += "\n";
	}

	return formatted;
}
