#!/usr/bin/env node

/**
 * Build script for the VS Code extension.
 * Bundles the extension client and LSP server using esbuild.
 */

const esbuild = require("esbuild");
const fs = require("node:fs");
const path = require("node:path");

const production = process.argv.includes("--production");
const watch = process.argv.includes("--watch");

// Ensure output directories exist
const outDir = path.join(__dirname, "..", "dist");
const vscodeDist = path.join(outDir, "packages", "vscode", "src");
const lspDist = path.join(outDir, "packages", "lsp", "bin");
const pineDataDist = path.join(outDir, "pine-data", "v6");

fs.mkdirSync(vscodeDist, { recursive: true });
fs.mkdirSync(lspDist, { recursive: true });
fs.mkdirSync(pineDataDist, { recursive: true });

// Copy JSON files from pine-data
const pineDataSrc = path.join(__dirname, "..", "pine-data", "v6");
for (const file of fs.readdirSync(pineDataSrc)) {
	if (file.endsWith(".json")) {
		fs.copyFileSync(
			path.join(pineDataSrc, file),
			path.join(pineDataDist, file),
		);
	}
}

// Common build options
const commonOptions = {
	bundle: true,
	platform: "node",
	target: "node18",
	format: "cjs",
	sourcemap: !production,
	minify: production,
	treeShaking: true,
};

// Build the extension client
const extensionConfig = {
	...commonOptions,
	entryPoints: ["packages/vscode/src/extension.ts"],
	outfile: "dist/packages/vscode/src/extension.js",
	external: ["vscode"], // vscode is provided by VS Code runtime
};

// Build the LSP server
const lspConfig = {
	...commonOptions,
	entryPoints: ["packages/lsp/bin/pine-lsp.ts"],
	outfile: "dist/packages/lsp/bin/pine-lsp.js",
	external: [], // Bundle everything for the LSP server
};

// Build the MCP server
const mcpConfig = {
	...commonOptions,
	entryPoints: ["packages/mcp/bin/pine-mcp.ts"],
	outfile: "dist/packages/mcp/bin/pine-mcp.js",
	external: [], // Bundle everything for the MCP server
};

// Build the CLI
const cliConfig = {
	...commonOptions,
	entryPoints: ["packages/cli/src/cli.ts"],
	outfile: "dist/packages/cli/src/cli.js",
	external: [],
	banner: {
		js: "#!/usr/bin/env node",
	},
};

async function build() {
	try {
		if (watch) {
			// Watch mode
			const contexts = await Promise.all([
				esbuild.context(extensionConfig),
				esbuild.context(lspConfig),
				esbuild.context(mcpConfig),
				esbuild.context(cliConfig),
			]);

			await Promise.all(contexts.map((ctx) => ctx.watch()));
			console.log("Watching for changes...");
		} else {
			// One-time build
			await Promise.all([
				esbuild.build(extensionConfig),
				esbuild.build(lspConfig),
				esbuild.build(mcpConfig),
				esbuild.build(cliConfig),
			]);

			// Make CLI executable
			fs.chmodSync("dist/packages/cli/src/cli.js", 0o755);

			console.log("Build complete!");
		}
	} catch (error) {
		console.error("Build failed:", error);
		process.exit(1);
	}
}

build();
