import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
	FUNCTIONS_BY_NAME,
	PineV6,
	VARIABLES_BY_NAME,
} from "../../../pine-data/v6/index.js";
import { PineLanguageService } from "../../language-service/src/index.js";

export async function main() {
	const server = new McpServer({
		name: "pine-script",
		version: "1.0.0",
	});

	const languageService = new PineLanguageService();

	// Tool: Validate Pine Script code
	server.registerTool(
		"pine_validate",
		{
			title: "Validate Pine Script",
			description:
				"Validate Pine Script code and return any errors or warnings",
			inputSchema: z.object({
				code: z.string().describe("Pine Script code to validate"),
			}),
		},
		async ({ code }) => {
			// Create a temporary document
			const uri = "mcp://temp/validate.pine";
			languageService.openDocument(uri, code, 1);

			try {
				const diagnostics = languageService.getDiagnostics(uri);

				const errors = diagnostics.filter((d) => d.severity === 1);
				const warnings = diagnostics.filter((d) => d.severity === 2);

				return {
					content: [
						{
							type: "text" as const,
							text: JSON.stringify(
								{
									success: errors.length === 0,
									errors: errors.map((e) => ({
										line: e.range.start.line + 1,
										column: e.range.start.character + 1,
										message: e.message,
									})),
									warnings: warnings.map((w) => ({
										line: w.range.start.line + 1,
										column: w.range.start.character + 1,
										message: w.message,
									})),
								},
								null,
								2,
							),
						},
					],
				};
			} finally {
				languageService.closeDocument(uri);
			}
		},
	);

	// Tool: Look up symbol documentation
	server.registerTool(
		"pine_lookup",
		{
			title: "Look up Pine Script symbol",
			description:
				"Look up documentation for a Pine Script symbol (function, variable, or constant)",
			inputSchema: z.object({
				symbol: z
					.string()
					.describe("Symbol name to look up (e.g., 'ta.sma', 'close', 'plot')"),
			}),
		},
		async ({ symbol }) => {
			const info = PineLanguageService.getSymbolInfo(symbol);

			if (!info) {
				return {
					content: [
						{
							type: "text" as const,
							text: JSON.stringify({
								found: false,
								message: `Symbol '${symbol}' not found`,
							}),
						},
					],
				};
			}

			return {
				content: [
					{
						type: "text" as const,
						text: JSON.stringify(
							{
								found: true,
								name: info.name,
								kind: info.kind,
								syntax: info.syntax,
								description: info.description,
								returns: info.returns,
								type: info.type,
								parameters: info.parameters,
								namespace: info.namespace,
								deprecated: info.deprecated,
							},
							null,
							2,
						),
					},
				],
			};
		},
	);

	// Tool: List functions
	server.registerTool(
		"pine_list_functions",
		{
			title: "List Pine Script functions",
			description:
				"List available Pine Script functions, optionally filtered by namespace",
			inputSchema: z.object({
				namespace: z
					.string()
					.optional()
					.describe("Optional namespace filter (e.g., 'ta', 'math', 'str')"),
			}),
		},
		async ({ namespace }) => {
			let functions: string[];

			if (namespace) {
				const members = PineV6.getNamespaceMembers(namespace);
				functions = members.functions.map((f) => f.name);
			} else {
				functions = Array.from(PineV6.functions.keys());
			}

			return {
				content: [
					{
						type: "text" as const,
						text: JSON.stringify(
							{
								count: functions.length,
								namespace: namespace || "all",
								functions: functions.sort(),
							},
							null,
							2,
						),
					},
				],
			};
		},
	);

	// Tool: Format code
	server.registerTool(
		"pine_format",
		{
			title: "Format Pine Script code",
			description: "Format Pine Script code",
			inputSchema: z.object({
				code: z.string().describe("Pine Script code to format"),
			}),
		},
		async ({ code }) => {
			const formatted = PineLanguageService.formatCode(code);

			return {
				content: [
					{
						type: "text" as const,
						text: JSON.stringify(
							{
								formatted,
							},
							null,
							2,
						),
					},
				],
			};
		},
	);

	// Resource: List all functions
	server.registerResource(
		"functions",
		"pine://reference/functions",
		{
			title: "Pine Script Functions",
			description: "List of all Pine Script functions",
			mimeType: "application/json",
		},
		async () => {
			const functions = Array.from(FUNCTIONS_BY_NAME.values()).map((f) => ({
				name: f.name,
				returns: f.returns,
				description:
					f.description.length > 100
						? f.description.substring(0, 100) + "..."
						: f.description,
			}));

			return {
				contents: [
					{
						uri: "pine://reference/functions",
						mimeType: "application/json",
						text: JSON.stringify(functions, null, 2),
					},
				],
			};
		},
	);

	// Resource: List all variables
	server.registerResource(
		"variables",
		"pine://reference/variables",
		{
			title: "Pine Script Variables",
			description: "List of all Pine Script built-in variables",
			mimeType: "application/json",
		},
		async () => {
			const variables = Array.from(VARIABLES_BY_NAME.values()).map((v) => ({
				name: v.name,
				type: v.type,
				description: v.description,
			}));

			return {
				contents: [
					{
						uri: "pine://reference/variables",
						mimeType: "application/json",
						text: JSON.stringify(variables, null, 2),
					},
				],
			};
		},
	);

	// Resource: List all namespaces
	server.registerResource(
		"namespaces",
		"pine://reference/namespaces",
		{
			title: "Pine Script Namespaces",
			description: "List of all Pine Script namespaces (ta, math, str, etc.)",
			mimeType: "application/json",
		},
		async () => {
			const namespaces = Array.from(PineV6.getAllNamespaces()).sort();

			return {
				contents: [
					{
						uri: "pine://reference/namespaces",
						mimeType: "application/json",
						text: JSON.stringify(namespaces, null, 2),
					},
				],
			};
		},
	);

	// Start server with stdio transport
	const transport = new StdioServerTransport();
	await server.connect(transport);

	console.error("Pine Script MCP server started");
}

main().catch((error) => {
	console.error("Fatal error in MCP server:", error);
	process.exit(1);
});
