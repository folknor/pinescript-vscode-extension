import {
	CONSTANTS_BY_NAME,
	FUNCTIONS_BY_NAME,
	VARIABLES_BY_NAME,
} from "../../../../pine-data/v6";
import type { ParsedDocument } from "../documents/ParsedDocument";
import type { Position, Range, TextEdit } from "../types";
import { getReferences } from "./references";

/**
 * Result of a prepare rename request.
 */
export interface PrepareRenameResult {
	range: Range;
	placeholder: string;
}

/**
 * Result of a rename request.
 */
export interface RenameResult {
	changes: TextEdit[];
}

/**
 * Check if a rename is valid at a position.
 * Returns the range and current name if valid, null if not.
 */
export function prepareRename(
	doc: ParsedDocument,
	position: Position,
): PrepareRenameResult | null {
	const symbol = doc.getWordAtPosition(position);
	if (!symbol) return null;

	// Check if it's a built-in (cannot rename)
	if (isBuiltinSymbol(symbol)) {
		return null; // Cannot rename built-ins
	}

	// Find the symbol's range at this position
	const line = doc.getLine(position.line);
	const wordStart = findWordStart(line, position.character);
	const wordEnd = findWordEnd(line, position.character);

	if (wordStart === -1 || wordEnd === -1) return null;

	return {
		range: {
			start: { line: position.line, character: wordStart },
			end: { line: position.line, character: wordEnd },
		},
		placeholder: symbol,
	};
}

/**
 * Rename a symbol at a position.
 */
export function rename(
	doc: ParsedDocument,
	position: Position,
	newName: string,
): RenameResult | null {
	const symbol = doc.getWordAtPosition(position);
	if (!symbol) return null;

	// Check if it's a built-in (cannot rename)
	if (isBuiltinSymbol(symbol)) {
		return null;
	}

	// Validate new name
	if (!isValidIdentifier(newName)) {
		return null;
	}

	// Find all references
	const references = getReferences(doc, position, { includeDeclaration: true });
	if (references.length === 0) return null;

	// Generate text edits for each reference
	const changes: TextEdit[] = references.map((ref) => ({
		range: ref.range,
		newText: newName,
	}));

	return { changes };
}

/**
 * Check if a symbol is a built-in.
 */
function isBuiltinSymbol(name: string): boolean {
	return (
		FUNCTIONS_BY_NAME.has(name) ||
		VARIABLES_BY_NAME.has(name) ||
		CONSTANTS_BY_NAME.has(name)
	);
}

/**
 * Check if a string is a valid Pine Script identifier.
 */
function isValidIdentifier(name: string): boolean {
	// Must start with letter or underscore, followed by letters, digits, or underscores
	return /^[A-Za-z_][A-Za-z0-9_]*$/.test(name);
}

/**
 * Find the start of a word at a position.
 */
function findWordStart(line: string, position: number): number {
	let start = position;
	while (start > 0 && /[A-Za-z0-9_]/.test(line[start - 1])) {
		start--;
	}
	return start;
}

/**
 * Find the end of a word at a position.
 */
function findWordEnd(line: string, position: number): number {
	let end = position;
	while (end < line.length && /[A-Za-z0-9_]/.test(line[end])) {
		end++;
	}
	return end;
}
