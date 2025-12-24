import { FUNCTIONS_BY_NAME } from "../../../../pine-data/v6";
import type { ParsedDocument } from "../documents/ParsedDocument";
import type {
	ParameterInfo,
	Position,
	SignatureHelp,
	SignatureInfo,
} from "../types";

interface ParsedParameter {
	label: string;
	documentation?: string;
}

/**
 * Parse function syntax to extract parameters.
 */
function parseParameters(syntax: string): ParsedParameter[] {
	try {
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
					params.push({ label: current.trim() });
				}
				current = "";
				continue;
			}
			current += char;
		}
		if (current.trim()) {
			params.push({ label: current.trim() });
		}

		return params;
	} catch {
		return [];
	}
}

/**
 * Calculate which parameter is active based on cursor position in text.
 */
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

/**
 * Find function name before cursor position.
 */
function findFunctionName(line: string, character: number): string | null {
	const beforeCursor = line.substring(0, character);

	// Match function call pattern: functionName( or namespace.functionName(
	const match = beforeCursor.match(
		/([a-z_][a-z0-9_]*(?:\.[a-z_][a-z0-9_]*)?)\s*\([^)]*$/i,
	);
	if (!match) return null;

	return match[1];
}

/**
 * Get signature help at a position in a document.
 */
export function getSignatureHelp(
	doc: ParsedDocument,
	position: Position,
): SignatureHelp | null {
	const line = doc.getLine(position.line);
	const functionName = findFunctionName(line, position.character);

	if (!functionName) return null;

	// Look up function in pine-data
	const func = FUNCTIONS_BY_NAME.get(functionName);
	if (!func || !func.syntax) return null;

	// Parse parameters from syntax
	const parsedParams = parseParameters(func.syntax);
	if (parsedParams.length === 0) return null;

	// Build parameter info with descriptions from pine-data
	const parameters: ParameterInfo[] = parsedParams.map((parsed, index) => {
		const pineParam = func.parameters[index];
		return {
			label: parsed.label,
			documentation: pineParam?.description,
		};
	});

	// Create signature info
	const signature: SignatureInfo = {
		label: func.syntax,
		parameters,
	};

	// Add function documentation
	if (func.description) {
		let doc = func.description;
		if (func.returns) {
			doc += `\n\n**Returns:** \`${func.returns}\``;
		}
		signature.documentation = doc;
	}

	// Calculate active parameter
	const beforeCursor = line.substring(0, position.character);
	const activeParam = calculateActiveParameter(beforeCursor);

	return {
		signatures: [signature],
		activeSignature: 0,
		activeParameter: Math.min(activeParam, parameters.length - 1),
	};
}
