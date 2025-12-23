import * as vscode from "vscode";
import {
	type PineFunction,
	FUNCTIONS_BY_NAME,
} from "../pine-data/v6";

interface ParsedParameter {
	label: string;
	documentation?: string;
}

// Parse function syntax to extract parameters
function parseParameters(syntax: string): ParsedParameter[] {
	try {
		// Extract content between parentheses
		const match = syntax.match(/\(([^)]*)\)/);
		if (!match || !match[1].trim()) return [];

		const paramsString = match[1].trim();
		const params: ParsedParameter[] = [];

		// Split by comma, handling nested structures
		let current = "";
		let depth = 0;
		for (const char of paramsString) {
			if (char === "(" || char === "[" || char === "<") depth++;
			else if (char === ")" || char === "]" || char === ">") depth--;
			else if (char === "," && depth === 0) {
				if (current.trim()) {
					params.push(parseParameter(current.trim()));
				}
				current = "";
				continue;
			}
			current += char;
		}
		if (current.trim()) {
			params.push(parseParameter(current.trim()));
		}

		return params;
	} catch {
		return [];
	}
}

// Parse individual parameter
function parseParameter(param: string): ParsedParameter {
	// Remove default values and type annotations for display
	const cleanParam = param.split("=")[0].trim();
	const _paramName = cleanParam.split(":")[0].trim();

	return {
		label: param,
		documentation: undefined, // Could be enhanced with per-parameter docs
	};
}

// Calculate which parameter is active based on cursor position
function calculateActiveParameter(text: string): number {
	let depth = 0;
	let paramIndex = 0;

	for (const char of text) {
		if (char === "(" || char === "[") depth++;
		else if (char === ")" || char === "]") depth--;
		else if (char === "," && depth === 1) paramIndex++;
	}

	return paramIndex;
}

// Find function name before cursor
function findFunctionName(line: string, character: number): string | null {
	const beforeCursor = line.substring(0, character);

	// Match function call pattern: functionName( or namespace.functionName(
	const match = beforeCursor.match(
		/([a-z_][a-z0-9_]*(?:\.[a-z_][a-z0-9_]*)?)\s*\([^)]*$/i,
	);
	if (!match) return null;

	return match[1];
}

export function createSignatureHelpProvider(): vscode.SignatureHelpProvider {
	return {
		provideSignatureHelp(document, position, _token, _context) {
			const line = document.lineAt(position.line).text;
			const functionName = findFunctionName(line, position.character);

			if (!functionName) return undefined;

			// Look up function in our v6 data (unified Map handles both global and namespaced)
			const func: PineFunction | undefined = FUNCTIONS_BY_NAME.get(functionName);

			if (!func || !func.syntax) return undefined;

			// Parse parameters from syntax
			const params = parseParameters(func.syntax);
			if (params.length === 0) return undefined;

			// Create signature information
			const sigInfo = new vscode.SignatureInformation(func.syntax);

			// Add function documentation
			if (func.description) {
				const md = new vscode.MarkdownString();
				md.appendMarkdown(func.description);
				if (func.returns) {
					md.appendMarkdown(`\n\n**Returns:** \`${func.returns}\``);
				}
				sigInfo.documentation = md;
			}

			// Add parameters
			params.forEach((param) => {
				const paramInfo = new vscode.ParameterInformation(
					param.label,
					param.documentation,
				);
				sigInfo.parameters.push(paramInfo);
			});

			// Calculate active parameter
			const beforeCursor = line.substring(0, position.character);
			const activeParam = calculateActiveParameter(beforeCursor);

			const sigHelp = new vscode.SignatureHelp();
			sigHelp.signatures = [sigInfo];
			sigHelp.activeSignature = 0;
			sigHelp.activeParameter = Math.min(activeParam, params.length - 1);

			return sigHelp;
		},
	};
}
