import {
	CONSTANTS_BY_NAMESPACE,
	FUNCTIONS_BY_NAME,
	FUNCTIONS_BY_NAMESPACE,
	PineV6,
	VARIABLES_BY_NAME,
	VARIABLES_BY_NAMESPACE,
} from "../../../../pine-data/v6";
import type { ParsedDocument } from "../documents/ParsedDocument";
import {
	type CompletionItem,
	CompletionItemKind,
	InsertTextFormat,
	type Position,
} from "../types";

// Keywords for Pine Script v6
const V6_KEYWORDS = [
	"if",
	"else",
	"for",
	"while",
	"break",
	"continue",
	"return",
	"var",
	"varip",
	"const",
	"true",
	"false",
	"na",
	"export",
	"import",
	"as",
	"switch",
	"case",
	"default",
	"and",
	"or",
	"not",
	"int",
	"float",
	"bool",
	"string",
	"color",
	"line",
	"label",
	"box",
	"table",
	"array",
	"matrix",
	"map",
	"series",
	"simple",
	"input",
	"to",
	"by",
	"type",
	"enum",
	"method",
];

interface CompletionItemData {
	syntax?: string;
	description?: string;
	returns?: string;
	type?: string;
	example?: string;
	namespace?: string;
}

/**
 * Create a snippet from function syntax.
 */
function createSnippetFromSyntax(
	syntax: string,
	functionName: string,
): string | null {
	try {
		const match = syntax.match(/\(([^)]*)\)/);
		if (!match) return null;

		const paramsString = match[1].trim();
		if (!paramsString) {
			return `${functionName}()`;
		}

		const params = paramsString.split(",").map((p) => p.trim());
		const snippetParams = params.map((param, index) => {
			const paramName = param.split(/[=:]/)[0].trim();
			return `\${${index + 1}:${paramName}}`;
		});

		return `${functionName}(${snippetParams.join(", ")})`;
	} catch {
		return null;
	}
}

/**
 * Create a completion item with rich documentation.
 */
function createCompletionItem(
	label: string,
	kind: CompletionItemKind,
	data?: CompletionItemData,
): CompletionItem {
	const item: CompletionItem = { label, kind };

	if (data) {
		// Build markdown documentation
		const docParts: string[] = [];

		if (data.syntax) {
			docParts.push(`\`\`\`pine\n${data.syntax}\n\`\`\``);
		}

		if (data.description) {
			docParts.push(data.description);
		}

		if (data.returns) {
			docParts.push(`**Returns:** \`${data.returns}\``);
		}

		if (data.type) {
			docParts.push(`**Type:** \`${data.type}\``);
		}

		if (data.example) {
			docParts.push("**Example:**");
			docParts.push(`\`\`\`pine\n${data.example}\n\`\`\``);
		}

		if (data.namespace) {
			docParts.push(`_Namespace: ${data.namespace}_`);
		}

		if (docParts.length > 0) {
			item.documentation = docParts.join("\n\n");
		}

		// Create snippet for functions
		if (kind === CompletionItemKind.Function && data.syntax) {
			const snippet = createSnippetFromSyntax(data.syntax, label);
			if (snippet) {
				item.insertText = snippet;
				item.insertTextFormat = InsertTextFormat.Snippet;
			}
		}

		// Add detail (shows in completion list)
		if (data.returns) {
			item.detail = `→ ${data.returns}`;
		} else if (data.type) {
			item.detail = data.type;
		}
	}

	return item;
}

/**
 * Get completions for a specific namespace (e.g., "ta", "math").
 */
export function getNamespaceCompletions(namespace: string): CompletionItem[] {
	const items: CompletionItem[] = [];

	// Add functions from namespace
	const nsFuncs = FUNCTIONS_BY_NAMESPACE.get(namespace);
	if (nsFuncs) {
		for (const func of nsFuncs) {
			const shortName = func.name.includes(".")
				? func.name.split(".").pop()!
				: func.name;
			items.push(
				createCompletionItem(shortName, CompletionItemKind.Function, {
					syntax: func.syntax,
					description: func.description,
					returns: func.returns,
					example: func.example,
					namespace: func.namespace,
				}),
			);
		}
	}

	// Add variables from namespace
	const nsVars = VARIABLES_BY_NAMESPACE.get(namespace);
	if (nsVars) {
		for (const variable of nsVars) {
			const shortName = variable.name.includes(".")
				? variable.name.split(".").pop()!
				: variable.name;
			items.push(
				createCompletionItem(shortName, CompletionItemKind.Variable, {
					type: variable.type as string,
					description: variable.description,
					namespace: variable.namespace,
				}),
			);
		}
	}

	// Add constants from namespace
	const nsConsts = CONSTANTS_BY_NAMESPACE.get(namespace);
	if (nsConsts) {
		for (const constant of nsConsts) {
			const kind =
				namespace === "color"
					? CompletionItemKind.Color
					: CompletionItemKind.Constant;
			items.push(
				createCompletionItem(constant.shortName, kind, {
					type: constant.type as string,
					description: constant.description,
				}),
			);
		}
	}

	return items;
}

/**
 * Get all completions (no namespace context).
 */
export function getAllCompletions(): CompletionItem[] {
	const items: CompletionItem[] = [];

	// Add variables (standalone only)
	for (const [name, variable] of VARIABLES_BY_NAME) {
		if (!variable.namespace) {
			items.push(
				createCompletionItem(name, CompletionItemKind.Variable, {
					type: variable.type as string,
					description: variable.description,
				}),
			);
		}
	}

	// Add global functions
	const globalFuncs = FUNCTIONS_BY_NAMESPACE.get("_global");
	if (globalFuncs) {
		for (const func of globalFuncs) {
			items.push(
				createCompletionItem(func.name, CompletionItemKind.Function, {
					syntax: func.syntax,
					description: func.description,
					returns: func.returns,
					example: func.example,
				}),
			);
		}
	}

	// Add keywords
	for (const keyword of V6_KEYWORDS) {
		items.push(createCompletionItem(keyword, CompletionItemKind.Keyword));
	}

	// Add namespace prefixes (for discoverability)
	const namespaces = PineV6.getAllNamespaces();
	for (const ns of namespaces) {
		const item = createCompletionItem(ns, CompletionItemKind.Module);
		item.detail = `${ns} namespace`;
		item.insertText = `${ns}.$1`;
		item.insertTextFormat = InsertTextFormat.Snippet;
		items.push(item);
	}

	return items;
}

/**
 * Get completions for function parameters.
 */
export function getParameterCompletions(
	functionName: string,
): CompletionItem[] {
	const items: CompletionItem[] = [];
	const func = FUNCTIONS_BY_NAME.get(functionName);
	if (!func) return items;

	for (const param of func.parameters) {
		const item = createCompletionItem(param.name, CompletionItemKind.Field);
		item.insertText = `${param.name} = $0`;
		item.insertTextFormat = InsertTextFormat.Snippet;
		item.detail = `Parameter for ${functionName}`;
		if (param.description) {
			item.documentation = param.description;
		}
		items.push(item);
	}

	return items;
}

/**
 * Get constant completions based on parameter name.
 */
export function getConstantCompletions(
	functionName: string,
	paramName: string,
): CompletionItem[] {
	const items: CompletionItem[] = [];

	// Map common parameter names to constant namespaces
	const paramToNamespace: Record<string, string> = {
		location: "location",
		color: "color",
		textcolor: "color",
		wickcolor: "color",
		bordercolor: "color",
		size: "size",
		format: "format",
		timeframe: "timeframe",
		session: "session",
		style:
			functionName === "plotshape"
				? "shape"
				: functionName === "plot"
					? "plot"
					: functionName === "label.new"
						? "label"
						: "plot",
	};

	const ns = paramToNamespace[paramName];
	if (!ns) return items;

	const nsConsts = CONSTANTS_BY_NAMESPACE.get(ns);
	if (nsConsts) {
		for (const constant of nsConsts) {
			const item = createCompletionItem(
				constant.name,
				CompletionItemKind.Constant,
			);
			item.detail = `Constant for ${ns}`;
			if (constant.description) {
				item.documentation = constant.description;
			}
			items.push(item);
		}
	}

	return items;
}

/**
 * Get completions at a position in a document.
 */
export function getCompletions(
	doc: ParsedDocument,
	position: Position,
): CompletionItem[] {
	const line = doc.getLine(position.line);
	const beforeCursor = line.substring(0, position.character);

	// 1. Check if we're completing after a named parameter assignment (e.g., style=)
	const namedParamMatch = beforeCursor.match(
		/([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*$/,
	);
	if (namedParamMatch) {
		const paramName = namedParamMatch[1];
		// Find the function name by looking back for the last open paren
		const lastOpenParen = beforeCursor.lastIndexOf("(");
		if (lastOpenParen !== -1) {
			const beforeParen = beforeCursor.substring(0, lastOpenParen).trim();
			const funcMatch = beforeParen.match(/([a-zA-Z_][a-zA-Z0-9_.]*)$/);
			if (funcMatch) {
				const functionName = funcMatch[1];
				const constantItems = getConstantCompletions(functionName, paramName);
				if (constantItems.length > 0) {
					return constantItems;
				}
			}
		}
	}

	// 2. Check if we're completing after a namespace dot (e.g., ta.)
	const namespaceMatch = beforeCursor.match(/([a-z]+)\.\s*$/);
	if (namespaceMatch) {
		const namespace = namespaceMatch[1];
		const nsItems = getNamespaceCompletions(namespace);
		if (nsItems.length > 0) {
			return nsItems;
		}
	}

	// 3. Check if we're inside a function call and should suggest parameters
	const lastOpenParen = beforeCursor.lastIndexOf("(");
	if (lastOpenParen !== -1) {
		const beforeParen = beforeCursor.substring(0, lastOpenParen).trim();
		const funcMatch = beforeParen.match(/([a-zA-Z_][a-zA-Z0-9_.]*)$/);
		if (funcMatch) {
			const functionName = funcMatch[1];
			const paramItems = getParameterCompletions(functionName);
			if (paramItems.length > 0) {
				// Combine with all completions for better UX
				return [...paramItems, ...getAllCompletions()];
			}
		}
	}

	// 4. Return all completions (includes built-ins, keywords, and namespace hints)
	return getAllCompletions();
}
