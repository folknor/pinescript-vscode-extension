# pine-tools

Pine Script v6 support for VS Code. Syntax highlighting, IntelliSense, diagnostics.

## Requirements

- VS Code 1.108+
- Node 22.18+
- pnpm

## Install

```
pnpm install
pnpm run build
```

## Build

```
pnpm run build          # dev build
pnpm run build:prod     # production build
pnpm run package        # create .vsix
```

Output goes to `dist/`.

## Use Locally

Build it first:

```
pnpm install
pnpm run build
```

Then symlink to VS Code extensions dir:

```
ln -s $(pwd) ~/.vscode/extensions/pine-tools
```

Or package and install:

```
pnpm run package
code --install-extension dist/pine-tools-*.vsix
```

Reload VS Code window after install. Use `pnpm run watch` for live development.

## Test

```
pnpm test
```

## CLI

```
node dist/packages/cli/src/cli.js file.pine
```

Or after install:

```
pine-validate file.pine
```

## LSP Server

```
node dist/packages/lsp/bin/pine-lsp.js --stdio
```

For editors that speak Language Server Protocol.

## MCP Server

```
node dist/packages/mcp/bin/pine-mcp.js
```

For AI assistants. See `packages/mcp/README.md`.

## Structure

```
packages/
  core/               parser, analyzer
  language-service/   editor-agnostic API
  cli/                command-line validator
  lsp/                language server
  mcp/                model context protocol server
  vscode/             extension client

pine-data/v6/         function signatures, constants
syntaxes/             TextMate grammar
```

## Data Pipeline

Regenerate language data from crawling and scraping TradingView.com docs:

```
pnpm run crawl
pnpm run scrape
pnpm run generate
pnpm run generate:syntax
```

## License

MIT

## Credits

Original barebones vscode extension by Jaroslav Pantsjoha. Completely rewritten by folknor.
