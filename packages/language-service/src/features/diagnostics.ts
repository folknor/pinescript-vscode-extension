import { UnifiedPineValidator } from "../../../core/src/analyzer/checker";
import type { ParsedDocument } from "../documents/ParsedDocument";
import { type Diagnostic, DiagnosticSeverity } from "../types";
import { getUnresolvedImports } from "./imports";

/**
 * Get all diagnostics for a document.
 * Combines parse errors, validation errors, and pattern-based warnings.
 */
export function getDiagnostics(doc: ParsedDocument): Diagnostic[] {
	const diagnostics: Diagnostic[] = [];

	// 1. Parse errors from lexer/parser
	for (const err of doc.parseErrors) {
		diagnostics.push({
			range: {
				start: { line: err.line - 1, character: err.column - 1 },
				end: { line: err.line - 1, character: err.column },
			},
			severity: DiagnosticSeverity.Error,
			message: err.message,
			source: "pine-lint",
		});
	}

	// 2. Validation errors from UnifiedPineValidator
	try {
		const validator = new UnifiedPineValidator();
		const validationErrors = validator.validate(doc.ast, doc.detectedVersion);

		for (const error of validationErrors) {
			// Only include errors, not warnings from validator (warnings come from patterns)
			if (error.severity === 1) {
				// DiagnosticSeverity.Error
				diagnostics.push({
					range: {
						start: { line: error.line - 1, character: error.column - 1 },
						end: {
							line: error.line - 1,
							character: error.column - 1 + error.length,
						},
					},
					severity: DiagnosticSeverity.Error,
					message: error.message,
					source: "pine-lint",
				});
			}
		}
	} catch (e) {
		// If validation fails, add a generic error
		console.error("[Pine Validator] Validation error:", e);
	}

	// 3. Pattern-based warnings (moved from extension.ts)
	diagnostics.push(...getPatternWarnings(doc));

	return diagnostics;
}

/**
 * Pattern-based warnings for common issues.
 * These were previously hardcoded in packages/vscode/src/extension.ts lines 284-448.
 */
function getPatternWarnings(doc: ParsedDocument): Diagnostic[] {
	const warnings: Diagnostic[] = [];
	const text = doc.content;

	// 1. Version header check
	if (!/^\s*\/\/@version=6/m.test(text)) {
		warnings.push({
			range: {
				start: { line: 0, character: 0 },
				end: { line: 0, character: 1 },
			},
			severity: DiagnosticSeverity.Warning,
			message: "Recommend using //@version=6 for Pine v6.",
			source: "pine-lint",
		});
	}

	// 2. input.timeframe suggestion
	if (
		/input\.string\s*\(\s*"\d+"\s*,\s*"HTF/m.test(text) &&
		!/input\.timeframe/m.test(text)
	) {
		const match = /input\.string\s*\(\s*"\d+"\s*,\s*"HTF/m.exec(text);
		if (match) {
			const pos = doc.positionAt(match.index);
			warnings.push({
				range: {
					start: pos,
					end: { line: pos.line, character: pos.character + 1 },
				},
				severity: DiagnosticSeverity.Warning,
				message: "Use input.timeframe(...) for timeframe inputs in v6.",
				source: "pine-lint",
			});
		}
	}

	// 3. time()/session boolean usage
	if (
		/\btime\(timeframe\.period,\s*\w+\)/m.test(text) &&
		!/not\s+na\(time\(timeframe\.period,/m.test(text)
	) {
		const match = /time\(timeframe\.period,\s*\w+\)/m.exec(text);
		if (match) {
			const pos = doc.positionAt(match.index);
			warnings.push({
				range: {
					start: pos,
					end: { line: pos.line, character: pos.character + 1 },
				},
				severity: DiagnosticSeverity.Warning,
				message:
					"Wrap session checks as: not na(time(timeframe.period, session)) to avoid bool-NA pitfalls.",
				source: "pine-lint",
			});
		}
	}

	// 4. ta.change in condition hint
	if (/ta\.change\s*\(/m.test(text) && /\?\s*\(|\)\s*and|\)\s*or/.test(text)) {
		const match = /ta\.change\s*\(/m.exec(text);
		if (match) {
			const pos = doc.positionAt(match.index);
			warnings.push({
				range: {
					start: pos,
					end: { line: pos.line, character: pos.character + 1 },
				},
				severity: DiagnosticSeverity.Warning,
				message:
					"Consider assigning ta.change(...) to a variable before using in conditions for consistent evaluation.",
				source: "pine-lint",
			});
		}
	}

	// 5. timenow milliseconds reminder
	if (/timenow\s*-\s*\w+\s*<=\s*\w+\s*\*\s*60(?!\s*\*\s*1000)/m.test(text)) {
		const match =
			/timenow\s*-\s*\w+\s*<=\s*\w+\s*\*\s*60(?!\s*\*\s*1000)/m.exec(text);
		if (match) {
			const pos = doc.positionAt(match.index);
			warnings.push({
				range: {
					start: pos,
					end: { line: pos.line, character: pos.character + 1 },
				},
				severity: DiagnosticSeverity.Warning,
				message: "timenow is in milliseconds. Multiply seconds by 1000.",
				source: "pine-lint",
			});
		}
	}

	// 6. Invalid functions (e.g., math.clamp)
	if (/\bmath\.clamp\b/.test(text)) {
		const match = /math\.clamp/.exec(text);
		if (match) {
			const pos = doc.positionAt(match.index);
			warnings.push({
				range: {
					start: pos,
					end: { line: pos.line, character: pos.character + 10 },
				},
				severity: DiagnosticSeverity.Warning,
				message:
					"Pine v6: use math.min/math.max pattern; math.clamp is not available.",
				source: "pine-lint",
			});
		}
	}

	// 7. plotshape with wrong parameter name (shape= instead of style=)
	const plotshapeShapeMatch = /plotshape\s*\([^)]*\bshape\s*=/g;
	let match: RegExpExecArray | null;

	match = plotshapeShapeMatch.exec(text);
	while (match !== null) {
		const shapeIndex = match[0].indexOf("shape=");
		const pos = doc.positionAt(match.index + shapeIndex);
		warnings.push({
			range: {
				start: pos,
				end: { line: pos.line, character: pos.character + 6 },
			},
			severity: DiagnosticSeverity.Error,
			message: 'Invalid parameter "shape". Did you mean "style"?',
			source: "pine-lint",
		});
		match = plotshapeShapeMatch.exec(text);
	}

	// 8. plotchar with wrong parameter name (shape= instead of char=)
	const plotcharShapeMatch = /plotchar\s*\([^)]*\bshape\s*=/g;
	match = plotcharShapeMatch.exec(text);
	while (match !== null) {
		const shapeIndex = match[0].indexOf("shape=");
		const pos = doc.positionAt(match.index + shapeIndex);
		warnings.push({
			range: {
				start: pos,
				end: { line: pos.line, character: pos.character + 6 },
			},
			severity: DiagnosticSeverity.Error,
			message: 'Invalid parameter "shape". Did you mean "char"?',
			source: "pine-lint",
		});
		match = plotcharShapeMatch.exec(text);
	}

	// 9. timeframe_gaps without timeframe parameter
	const indicatorMatch =
		/(indicator|strategy)\s*\([^)]*timeframe_gaps\s*=\s*true[^)]*\)/g;
	match = indicatorMatch.exec(text);
	while (match !== null) {
		const fullCall = match[0];
		if (!/\btimeframe\s*=/.test(fullCall)) {
			const gapsIndex = fullCall.indexOf("timeframe_gaps");
			const pos = doc.positionAt(match.index + gapsIndex);
			warnings.push({
				range: {
					start: pos,
					end: { line: pos.line, character: pos.character + 14 },
				},
				severity: DiagnosticSeverity.Warning,
				message:
					'"timeframe_gaps" has no effect without a "timeframe" argument in indicator/strategy call',
				source: "pine-lint",
			});
		}
		match = indicatorMatch.exec(text);
	}

	// 10. alertcondition with too many arguments
	const alertCondMatch = /alertcondition\s*\(([^)]+)\)/g;
	match = alertCondMatch.exec(text);
	while (match !== null) {
		const args = match[1].split(",").map((a) => a.trim());
		if (args.length > 3) {
			const pos = doc.positionAt(match.index);
			warnings.push({
				range: {
					start: pos,
					end: { line: pos.line, character: pos.character + 14 },
				},
				severity: DiagnosticSeverity.Error,
				message: `alertcondition() expects 3 parameters (condition, title, message), but got ${args.length}`,
				source: "pine-lint",
			});
		}
		match = alertCondMatch.exec(text);
	}

	// 11. input.string() without required defval parameter
	const inputStringMatch = /input\.string\s*\(\s*\)/g;
	match = inputStringMatch.exec(text);
	while (match !== null) {
		const pos = doc.positionAt(match.index);
		warnings.push({
			range: {
				start: pos,
				end: { line: pos.line, character: pos.character + 12 },
			},
			severity: DiagnosticSeverity.Error,
			message:
				"input.string() requires at least one parameter: defval (default value)",
			source: "pine-lint",
		});
		match = inputStringMatch.exec(text);
	}

	// 12. Library imports without /// @source directive
	const unresolvedImports = getUnresolvedImports(doc);
	for (const unresolved of unresolvedImports) {
		warnings.push({
			range: {
				start: { line: unresolved.line - 1, character: 0 },
				end: { line: unresolved.line - 1, character: 100 },
			},
			severity: DiagnosticSeverity.Information,
			message: `Library "${unresolved.libraryPath}" has no local source. Add \`/// @source <path>\` above import for IntelliSense.`,
			source: "pine-lint",
		});
	}

	return warnings;
}
