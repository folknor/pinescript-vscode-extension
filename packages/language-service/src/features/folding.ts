/**
 * Folding ranges for code collapsing in the editor.
 */

import type { Statement } from "../../../core/src/parser/ast";
import type { ParsedDocument } from "../documents/ParsedDocument";
import { type FoldingRange, FoldingRangeKind } from "../types";

/**
 * Get folding ranges for a document.
 */
export function getFoldingRanges(doc: ParsedDocument): FoldingRange[] {
	const ranges: FoldingRange[] = [];

	// Collect multi-line comments
	collectCommentFolds(doc, ranges);

	// Collect import blocks
	collectImportFolds(doc, ranges);

	// Collect statement folds (functions, if/else, for, while)
	for (const stmt of doc.ast.body) {
		collectStatementFolds(stmt, doc, ranges);
	}

	return ranges;
}

/**
 * Collect folding ranges for multi-line comments.
 */
function collectCommentFolds(doc: ParsedDocument, ranges: FoldingRange[]): void {
	const lines = doc.content.split("\n");
	let blockStart = -1;

	for (let i = 0; i < lines.length; i++) {
		const trimmed = lines[i].trim();
		if (trimmed.startsWith("//")) {
			if (blockStart === -1) {
				blockStart = i;
			}
		} else {
			if (blockStart !== -1 && i - blockStart > 1) {
				// Block of comments ending at i-1
				ranges.push({
					startLine: blockStart,
					endLine: i - 1,
					kind: FoldingRangeKind.Comment,
				});
			}
			blockStart = -1;
		}
	}

	// Handle trailing comment block
	if (blockStart !== -1 && lines.length - blockStart > 1) {
		ranges.push({
			startLine: blockStart,
			endLine: lines.length - 1,
			kind: FoldingRangeKind.Comment,
		});
	}
}

/**
 * Collect folding ranges for import blocks.
 */
function collectImportFolds(doc: ParsedDocument, ranges: FoldingRange[]): void {
	const imports = doc.ast.body.filter((s) => s.type === "ImportStatement");

	if (imports.length < 2) return;

	const firstImport = imports[0];
	const lastImport = imports[imports.length - 1];

	if (
		firstImport.line !== undefined &&
		lastImport.line !== undefined &&
		lastImport.line > firstImport.line
	) {
		ranges.push({
			startLine: firstImport.line - 1, // Convert to 0-indexed
			endLine: lastImport.line - 1,
			kind: FoldingRangeKind.Imports,
		});
	}
}

/**
 * Collect folding ranges from statements.
 */
function collectStatementFolds(
	stmt: Statement,
	doc: ParsedDocument,
	ranges: FoldingRange[],
): void {
	switch (stmt.type) {
		case "FunctionDeclaration":
		case "MethodDeclaration":
			if (stmt.body.length > 0 && stmt.line !== undefined) {
				const lastStmt = stmt.body[stmt.body.length - 1];
				if (lastStmt.line !== undefined && lastStmt.line > stmt.line) {
					ranges.push({
						startLine: stmt.line - 1,
						endLine: lastStmt.line - 1,
					});
				}
			}
			// Recurse into body
			for (const s of stmt.body) {
				collectStatementFolds(s, doc, ranges);
			}
			break;

		case "IfStatement":
			if (stmt.consequent.length > 0 && stmt.line !== undefined) {
				const lastConsequent = stmt.consequent[stmt.consequent.length - 1];
				if (
					lastConsequent.line !== undefined &&
					lastConsequent.line > stmt.line
				) {
					ranges.push({
						startLine: stmt.line - 1,
						endLine: lastConsequent.line - 1,
					});
				}
			}
			// Recurse
			for (const s of stmt.consequent) {
				collectStatementFolds(s, doc, ranges);
			}
			if (stmt.alternate) {
				for (const s of stmt.alternate) {
					collectStatementFolds(s, doc, ranges);
				}
			}
			break;

		case "ForStatement":
		case "ForInStatement":
		case "WhileStatement":
			if (stmt.body.length > 0 && stmt.line !== undefined) {
				const lastBody = stmt.body[stmt.body.length - 1];
				if (lastBody.line !== undefined && lastBody.line > stmt.line) {
					ranges.push({
						startLine: stmt.line - 1,
						endLine: lastBody.line - 1,
					});
				}
			}
			for (const s of stmt.body) {
				collectStatementFolds(s, doc, ranges);
			}
			break;

		case "SequenceStatement":
			for (const s of stmt.statements) {
				collectStatementFolds(s, doc, ranges);
			}
			break;
	}
}
