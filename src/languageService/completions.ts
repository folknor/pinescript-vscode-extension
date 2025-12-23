import * as vscode from "vscode";
import {
	type PineFunction,
	type PineVariable,
	type PineConstant,
	FUNCTIONS_BY_NAME,
	FUNCTIONS_BY_NAMESPACE,
	VARIABLES_BY_NAME,
	VARIABLES_BY_NAMESPACE,
	CONSTANTS_BY_NAMESPACE,
	PineV6,
} from "../../pine-data/v6";

// Keywords for Pine Script v6
export const V6_KEYWORDS = [
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
	"const",
];

// Unified item type for completion
interface CompletionItemData {
	syntax?: string;
	description?: string;
	returns?: string;
	type?: string;
	example?: string;
	namespace?: string;
}

// Helper to create completion item with rich documentation
export function createCompletionItem(
	label: string,
	kind: vscode.CompletionItemKind,
	item?: CompletionItemData,
): vscode.CompletionItem {
	const completion = new vscode.CompletionItem(label, kind);

	if (item) {
		// Create rich markdown documentation
		const md = new vscode.MarkdownString();

		// Add syntax if available
		if (item.syntax) {
			md.appendCodeblock(item.syntax, "pine");
			md.appendMarkdown("\n\n");
		}

		// Add description
		if (item.description) {
			md.appendMarkdown(item.description);
		}

		// Add returns information
		if (item.returns) {
			md.appendMarkdown(`\n\n**Returns:** \`${item.returns}\``);
		}

		// Add type for variables
		if (item.type) {
			md.appendMarkdown(`\n\n**Type:** \`${item.type}\``);
		}

		// Add example if available
		if (item.example) {
			md.appendMarkdown("\n\n**Example:**");
			md.appendCodeblock(item.example, "pine");
		}

		// Add namespace info
		if (item.namespace) {
			md.appendMarkdown(`\n\n_Namespace: ${item.namespace}_`);
		}

		completion.documentation = md;

		// Create snippet for functions with syntax
		if (kind === vscode.CompletionItemKind.Function && item.syntax) {
			const snippet = createSnippetFromSyntax(item.syntax, label);
			if (snippet) {
				completion.insertText = new vscode.SnippetString(snippet);
			}
		}

		// Add detail (shows in completion list)
		if (item.returns) {
			completion.detail = `→ ${item.returns}`;
		} else if (item.type) {
			completion.detail = item.type;
		}
	}

	return completion;
}

// Convert function syntax to VS Code snippet
function createSnippetFromSyntax(
	syntax: string,
	functionName: string,
): string | null {
	try {
		// Extract parameters from syntax
		const match = syntax.match(/\(([^)]*)\)/);
		if (!match) return null;

		const paramsString = match[1].trim();
		if (!paramsString) {
			return `${functionName}()`;
		}

		// Split parameters and create placeholders
		const params = paramsString.split(",").map((p) => p.trim());
		const snippetParams = params.map((param, index) => {
			// Extract parameter name (before any type annotation or default)
			const paramName = param.split(/[=:]/)[0].trim();
			return `\${${index + 1}:${paramName}}`;
		});

		return `${functionName}(${snippetParams.join(", ")})`;
	} catch {
		return null;
	}
}

// Get completions for a specific namespace
export function getNamespaceCompletions(
	namespace: string,
): vscode.CompletionItem[] {
	const items: vscode.CompletionItem[] = [];

	// Add functions from namespace
	const nsFuncs = FUNCTIONS_BY_NAMESPACE.get(namespace);
	if (nsFuncs) {
		for (const func of nsFuncs) {
			// Get short name (without namespace prefix)
			const shortName = func.name.includes(".")
				? func.name.split(".").pop()!
				: func.name;
			items.push(
				createCompletionItem(shortName, vscode.CompletionItemKind.Function, {
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
				createCompletionItem(shortName, vscode.CompletionItemKind.Variable, {
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
					? vscode.CompletionItemKind.Color
					: vscode.CompletionItemKind.Constant;
			const item = createCompletionItem(constant.shortName, kind, {
				type: constant.type as string,
				description: constant.description,
			});
			items.push(item);
		}
	}

	return items;
}

// Get all completions (no namespace context)
export function getAllCompletions(): vscode.CompletionItem[] {
	const items: vscode.CompletionItem[] = [];

	// Add variables (standalone only - namespaced ones are accessed via namespace)
	for (const [name, variable] of VARIABLES_BY_NAME) {
		if (!variable.namespace) {
			items.push(
				createCompletionItem(name, vscode.CompletionItemKind.Variable, {
					type: variable.type as string,
					description: variable.description,
				}),
			);
		}
	}

	// Add functions (global functions only)
	const globalFuncs = FUNCTIONS_BY_NAMESPACE.get("_global");
	if (globalFuncs) {
		for (const func of globalFuncs) {
			items.push(
				createCompletionItem(func.name, vscode.CompletionItemKind.Function, {
					syntax: func.syntax,
					description: func.description,
					returns: func.returns,
					example: func.example,
				}),
			);
		}
	}

	// Add keywords
	V6_KEYWORDS.forEach((keyword) => {
		items.push(
			createCompletionItem(keyword, vscode.CompletionItemKind.Keyword),
		);
	});

	// Add namespace prefixes (for discoverability)
	const namespaces = PineV6.getAllNamespaces();
	for (const ns of namespaces) {
		const item = new vscode.CompletionItem(
			ns,
			vscode.CompletionItemKind.Module,
		);
		item.detail = `${ns} namespace`;
		item.insertText = new vscode.SnippetString(`${ns}.$1`);
		item.command = {
			command: "editor.action.triggerSuggest",
			title: "Trigger suggest",
		};
		items.push(item);
	}

	return items;
}

// Get completions for function parameters
export function getParameterCompletions(
	functionName: string,
): vscode.CompletionItem[] {
	const items: vscode.CompletionItem[] = [];
	const func = FUNCTIONS_BY_NAME.get(functionName);
	if (!func) return items;

	for (const param of func.parameters) {
		const item = new vscode.CompletionItem(
			param.name,
			vscode.CompletionItemKind.Field,
		);
		item.insertText = new vscode.SnippetString(`${param.name} = $0`);
		item.detail = `Parameter for ${functionName}`;
		if (param.description) {
			item.documentation = new vscode.MarkdownString(param.description);
		}
		items.push(item);
	}

	return items;
}

// Get completions for constants based on parameter name
export function getConstantCompletions(
	functionName: string,
	paramName: string,
): vscode.CompletionItem[] {
	const items: vscode.CompletionItem[] = [];

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
	const nsConsts = CONSTANTS_BY_NAMESPACE.get(ns);
	if (nsConsts) {
		for (const constant of nsConsts) {
			const item = new vscode.CompletionItem(
				constant.name,
				vscode.CompletionItemKind.Constant,
			);
			item.detail = `Constant for ${ns}`;
			if (constant.description) {
				item.documentation = new vscode.MarkdownString(constant.description);
			}
			items.push(item);
		}
	}

	return items;
}

// Get hover information for a symbol
export function getHoverInfo(symbol: string): vscode.Hover | undefined {
	const cfg = vscode.workspace.getConfiguration("pine");
	const mode = cfg.get<"full" | "summary">("docsMode", "full");

	let description = "";
	let syntax = "";
	let returns = "";
	let type = "";
	let example = "";
	let namespace = "";

	// Check variables
	const variable = VARIABLES_BY_NAME.get(symbol);
	if (variable) {
		description = variable.description;
		type = variable.type as string;
		namespace = variable.namespace || "";
	}

	// Check functions
	if (!variable) {
		const func = FUNCTIONS_BY_NAME.get(symbol);
		if (func) {
			description = func.description;
			syntax = func.syntax;
			returns = func.returns;
			example = func.example || "";
			namespace = func.namespace || "";
		}
	}

	// No match found
	if (!description && !syntax && !type) {
		return undefined;
	}

	const md = new vscode.MarkdownString();

	// Add header with symbol name
	md.appendMarkdown(`### ${symbol}\n\n`);

	// Add syntax
	if (syntax) {
		md.appendCodeblock(syntax, "pine");
		md.appendMarkdown("\n\n");
	}

	// Add description (full or summary based on settings)
	if (description) {
		const desc =
			mode === "summary"
				? `${description.split(".")[0]}.`
				: description;
		md.appendMarkdown(desc);
	}

	// Add return type/type
	if (returns) {
		md.appendMarkdown(`\n\n**Returns:** \`${returns}\``);
	} else if (type) {
		md.appendMarkdown(`\n\n**Type:** \`${type}\``);
	}

	// Add example in full mode
	if (mode === "full" && example) {
		md.appendMarkdown("\n\n**Example:**\n\n");
		md.appendCodeblock(example, "pine");
	}

	// Add namespace info
	if (namespace) {
		md.appendMarkdown(`\n\n_Namespace: ${namespace}_`);
	}

	md.isTrusted = true;
	md.supportHtml = true;

	return new vscode.Hover(md);
}

// Legacy exports for compatibility
export const BUILTIN_VARS = VARIABLES_BY_NAME;
export const BUILTIN_FUNCTIONS = FUNCTIONS_BY_NAME;
export const KEYWORDS = V6_KEYWORDS;
