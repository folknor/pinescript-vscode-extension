import * as path from "node:path";
import * as vscode from "vscode";
import {
	LanguageClient,
	type LanguageClientOptions,
	type ServerOptions,
	TransportKind,
} from "vscode-languageclient/node";

let client: LanguageClient | undefined;

export async function activate(context: vscode.ExtensionContext) {
	// Apply file association (*.pine → pine)
	applyFileAssociation();

	// Start LSP client
	client = createLanguageClient(context);
	await client.start();

	// Register VS Code-specific commands
	registerCommands(context);

	console.log("Pine Script extension activated");
}

export async function deactivate() {
	if (client) {
		await client.stop();
	}
}

function createLanguageClient(
	context: vscode.ExtensionContext,
): LanguageClient {
	// Path to the LSP server
	const serverModule = context.asAbsolutePath(
		path.join("dist", "packages", "lsp", "bin", "pine-lsp.js"),
	);

	// Server options - run as Node process with stdio
	const serverOptions: ServerOptions = {
		run: {
			module: serverModule,
			transport: TransportKind.stdio,
		},
		debug: {
			module: serverModule,
			transport: TransportKind.stdio,
			options: { execArgv: ["--nolazy", "--inspect=6009"] },
		},
	};

	// Client options
	const clientOptions: LanguageClientOptions = {
		documentSelector: [{ scheme: "file", language: "pine" }],
		synchronize: {
			fileEvents: vscode.workspace.createFileSystemWatcher("**/*.pine"),
		},
	};

	return new LanguageClient(
		"pineLanguageServer",
		"Pine Script Language Server",
		serverOptions,
		clientOptions,
	);
}

function applyFileAssociation() {
	const cfg = vscode.workspace.getConfiguration();
	const shouldApply = cfg.get<boolean>("pine.applyFileAssociation", true);
	if (!shouldApply) return;

	const assoc = cfg.get<Record<string, string>>("files.associations", {});
	if (assoc["*.pine"] !== "pine") {
		const newAssoc = { ...assoc, "*.pine": "pine" };
		cfg
			.update(
				"files.associations",
				newAssoc,
				vscode.ConfigurationTarget.Workspace,
			)
			.then(undefined, () => {
				/* ignore errors on readonly workspaces */
			});
	}
}

function registerCommands(context: vscode.ExtensionContext) {
	// Command: Validate current file (triggers LSP diagnostics refresh)
	context.subscriptions.push(
		vscode.commands.registerCommand("pine.validate", async () => {
			const editor = vscode.window.activeTextEditor;
			if (!editor || editor.document.languageId !== "pine") {
				vscode.window.showInformationMessage(
					"Open a Pine (.pine) file to validate.",
				);
				return;
			}
			// Force save to trigger re-validation via LSP
			await editor.document.save();
			vscode.window.showInformationMessage("Pine v6 validation completed.");
		}),
	);

	// Command: Show docs for symbol under cursor
	context.subscriptions.push(
		vscode.commands.registerCommand("pine.showDocs", async () => {
			const editor = vscode.window.activeTextEditor;
			if (!editor || editor.document.languageId !== "pine") {
				vscode.window.showInformationMessage(
					"Open a Pine (.pine) file to show docs.",
				);
				return;
			}

			const wordRange = editor.document.getWordRangeAtPosition(
				editor.selection.active,
				/[A-Za-z_.]+/,
			);
			const word = wordRange ? editor.document.getText(wordRange) : "";

			if (!word) {
				vscode.window.showInformationMessage("Place cursor on a symbol.");
				return;
			}

			// Request hover from LSP
			if (!client) {
				vscode.window.showInformationMessage("Language server not ready.");
				return;
			}

			try {
				const hover = await vscode.commands.executeCommand<vscode.Hover[]>(
					"vscode.executeHoverProvider",
					editor.document.uri,
					editor.selection.active,
				);

				if (!hover || hover.length === 0) {
					vscode.window.showInformationMessage(`No docs found for '${word}'.`);
					return;
				}

				// Extract content from hover
				const content = hover[0].contents
					.map((c) => (typeof c === "string" ? c : c.value))
					.join("\n\n");

				// Show in webview panel
				const panel = vscode.window.createWebviewPanel(
					"pineDocs",
					`Pine: ${word}`,
					vscode.ViewColumn.Beside,
					{ enableScripts: false },
				);

				panel.webview.html = `
<!DOCTYPE html>
<html>
<head>
	<style>
		body {
			font-family: var(--vscode-editor-font-family);
			padding: 20px;
			color: var(--vscode-foreground);
		}
		pre {
			background: var(--vscode-textCodeBlock-background);
			padding: 10px;
			border-radius: 4px;
			overflow-x: auto;
		}
		code {
			font-family: var(--vscode-editor-font-family);
		}
	</style>
</head>
<body>
	<h2>${escapeHtml(word)}</h2>
	<div style="white-space: pre-wrap;">${escapeHtml(content)}</div>
</body>
</html>`;
			} catch {
				vscode.window.showInformationMessage(`No docs found for '${word}'.`);
			}
		}),
	);
}

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
}
