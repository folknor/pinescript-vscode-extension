# packages/lsp

Language Server Protocol (LSP) server for Pine Script v6. Communicates via JSON-RPC over stdio.

## Critical Constraint

This package is a **thin adapter** between the LSP protocol and `packages/language-service/`. All intelligence logic lives in language-service, not here.

---

## Purpose

Provide a standalone LSP server that:
- Works with any LSP-compatible editor (VS Code, Neovim, Sublime, Emacs, etc.)
- Runs as a separate process (spawned by editor)
- Communicates via stdio (stdin/stdout JSON-RPC)

---

## Dependencies

### Internal (imports allowed)
```typescript
import { PineLanguageService } from "../../language-service/src";
import type {
  CompletionItem,
  Diagnostic,
  HoverInfo,
  SignatureHelp,
  TextEdit,
  DocumentSymbol
} from "../../language-service/src/types";
```

### External (npm - already in package.json)
```typescript
import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  TextDocumentSyncKind,
  CompletionItem as LSPCompletionItem,
  Hover as LSPHover,
  // ... other LSP types
} from "vscode-languageserver/node";

import { TextDocument } from "vscode-languageserver-textdocument";
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       LSP Server                                │
├─────────────────────────────────────────────────────────────────┤
│ Transport: stdio (stdin/stdout)                                 │
│ Protocol: JSON-RPC 2.0                                          │
├─────────────────────────────────────────────────────────────────┤
│ Lifecycle:                                                      │
│   initialize    → Return server capabilities                    │
│   initialized   → Server ready                                  │
│   shutdown      → Prepare to exit                               │
│   exit          → Terminate process                             │
├─────────────────────────────────────────────────────────────────┤
│ Document Sync:                                                  │
│   textDocument/didOpen   → Parse & validate                     │
│   textDocument/didChange → Re-parse & validate                  │
│   textDocument/didClose  → Cleanup                              │
├─────────────────────────────────────────────────────────────────┤
│ Features:                                                       │
│   textDocument/completion      → Completions                    │
│   textDocument/hover           → Documentation                  │
│   textDocument/signatureHelp   → Parameter hints                │
│   textDocument/formatting      → Code formatting                │
│   textDocument/definition      → Go to definition               │
│   textDocument/documentSymbol  → Outline                        │
│   textDocument/publishDiagnostics → Errors & warnings           │
├─────────────────────────────────────────────────────────────────┤
│ Delegates to: PineLanguageService                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
packages/lsp/
├── src/
│   ├── index.ts           # Re-exports
│   ├── server.ts          # Main server setup & connection
│   ├── capabilities.ts    # Server capability configuration
│   └── handlers/
│       ├── lifecycle.ts   # initialize, shutdown, exit
│       ├── documents.ts   # didOpen, didChange, didClose
│       ├── completion.ts  # textDocument/completion
│       ├── hover.ts       # textDocument/hover
│       ├── signature.ts   # textDocument/signatureHelp
│       ├── formatting.ts  # textDocument/formatting
│       ├── definition.ts  # textDocument/definition
│       └── symbols.ts     # textDocument/documentSymbol
├── bin/
│   └── pine-lsp.ts        # CLI entry point (#!/usr/bin/env node)
└── test/
    └── lsp.test.ts        # Integration tests
```

---

## Implementation Guide

### 1. Server Setup (src/server.ts)

```typescript
import {
  createConnection,
  TextDocuments,
  ProposedFeatures,
  InitializeParams,
  InitializeResult,
} from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";
import { PineLanguageService } from "../../language-service/src";
import { getCapabilities } from "./capabilities";

// Create connection (stdio transport)
const connection = createConnection(ProposedFeatures.all);

// Document manager from vscode-languageserver
const documents = new TextDocuments(TextDocument);

// Our language service
const languageService = new PineLanguageService();

// Initialize handler
connection.onInitialize((params: InitializeParams): InitializeResult => {
  return {
    capabilities: getCapabilities()
  };
});

// Document sync - forward to language service
documents.onDidOpen((event) => {
  const doc = event.document;
  languageService.openDocument(doc.uri, doc.getText(), doc.version);
  validateAndPublish(doc.uri);
});

documents.onDidChangeContent((event) => {
  const doc = event.document;
  languageService.updateDocument(doc.uri, doc.getText(), doc.version);
  validateAndPublish(doc.uri);
});

documents.onDidClose((event) => {
  languageService.closeDocument(event.document.uri);
  connection.sendDiagnostics({ uri: event.document.uri, diagnostics: [] });
});

// Validation helper
function validateAndPublish(uri: string) {
  const diagnostics = languageService.getDiagnostics(uri);
  connection.sendDiagnostics({
    uri,
    diagnostics: diagnostics.map(d => convertDiagnostic(d))
  });
}

// Wire up feature handlers
import { setupCompletionHandler } from "./handlers/completion";
import { setupHoverHandler } from "./handlers/hover";
import { setupSignatureHandler } from "./handlers/signature";
import { setupFormattingHandler } from "./handlers/formatting";
import { setupDefinitionHandler } from "./handlers/definition";
import { setupSymbolsHandler } from "./handlers/symbols";

setupCompletionHandler(connection, languageService);
setupHoverHandler(connection, languageService);
setupSignatureHandler(connection, languageService);
setupFormattingHandler(connection, languageService);
setupDefinitionHandler(connection, languageService);
setupSymbolsHandler(connection, languageService);

// Start listening
documents.listen(connection);
connection.listen();
```

### 2. Capabilities (src/capabilities.ts)

```typescript
import {
  TextDocumentSyncKind,
  ServerCapabilities,
} from "vscode-languageserver/node";

export function getCapabilities(): ServerCapabilities {
  return {
    textDocumentSync: TextDocumentSyncKind.Incremental,
    completionProvider: {
      triggerCharacters: [".", "="],
      resolveProvider: false,
    },
    hoverProvider: true,
    signatureHelpProvider: {
      triggerCharacters: ["(", ","],
    },
    documentFormattingProvider: true,
    definitionProvider: true,
    documentSymbolProvider: true,
  };
}
```

### 3. Completion Handler (src/handlers/completion.ts)

```typescript
import { Connection, CompletionItem, CompletionItemKind } from "vscode-languageserver/node";
import { PineLanguageService } from "../../../language-service/src";
import type { CompletionItem as ServiceCompletionItem } from "../../../language-service/src/types";

export function setupCompletionHandler(
  connection: Connection,
  service: PineLanguageService
) {
  connection.onCompletion((params) => {
    const items = service.getCompletions(params.textDocument.uri, {
      line: params.position.line,
      character: params.position.character,
    });

    return items.map(convertCompletionItem);
  });
}

function convertCompletionItem(item: ServiceCompletionItem): CompletionItem {
  return {
    label: item.label,
    kind: item.kind as CompletionItemKind, // Enum values match LSP
    detail: item.detail,
    documentation: item.documentation
      ? { kind: "markdown", value: item.documentation }
      : undefined,
    insertText: item.insertText,
    insertTextFormat: item.insertTextFormat,
  };
}
```

### 4. Hover Handler (src/handlers/hover.ts)

```typescript
import { Connection, Hover } from "vscode-languageserver/node";
import { PineLanguageService } from "../../../language-service/src";

export function setupHoverHandler(
  connection: Connection,
  service: PineLanguageService
) {
  connection.onHover((params) => {
    const hover = service.getHover(params.textDocument.uri, {
      line: params.position.line,
      character: params.position.character,
    });

    if (!hover) return null;

    return {
      contents: { kind: "markdown", value: hover.contents },
      range: hover.range,
    } as Hover;
  });
}
```

### 5. CLI Entry Point (bin/pine-lsp.ts)

```typescript
#!/usr/bin/env node

// Simply import the server - it starts listening automatically
import "../src/server";
```

---

## Type Conversions

The language-service uses its own types; LSP uses `vscode-languageserver` types. They're intentionally similar, but you need thin converters:

| Language Service Type | LSP Type | Notes |
|----------------------|----------|-------|
| `Position` | `Position` | Same structure |
| `Range` | `Range` | Same structure |
| `Diagnostic` | `Diagnostic` | Same structure |
| `CompletionItem` | `CompletionItem` | Convert `documentation` to MarkupContent |
| `HoverInfo` | `Hover` | Convert `contents` to MarkupContent |
| `SignatureHelp` | `SignatureHelp` | Same structure |
| `TextEdit` | `TextEdit` | Same structure |
| `DocumentSymbol` | `DocumentSymbol` | Same structure |

---

## Current Files to Delete

Before implementing, delete the current broken implementation:

```
packages/lsp/src/languageService/    # Delete this entire folder
├── completions.ts                   # Logic moves to language-service
├── signatures.ts                    # Logic moves to language-service
└── index.ts
```

Keep `packages/lsp/src/index.ts` but rewrite it.

---

## Testing

### Unit Tests

```typescript
// test/lsp.test.ts
import { describe, it, expect } from 'vitest';

describe('LSP Server', () => {
  // Note: Full LSP testing requires spawning the server process
  // and communicating via JSON-RPC. Consider using a test client.

  it('should export server module', async () => {
    // Basic smoke test
    const mod = await import('../src/server');
    expect(mod).toBeDefined();
  });
});
```

### Manual Testing

1. Build the server:
   ```bash
   pnpm run build
   ```

2. Test with a simple client (e.g., using `nc` or a test script):
   ```bash
   echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"capabilities":{}}}' | node dist/packages/lsp/bin/pine-lsp.js
   ```

3. Test with Neovim (after configuring):
   ```lua
   -- In init.lua
   vim.lsp.start({
     name = 'pine-lsp',
     cmd = { 'node', '/path/to/dist/packages/lsp/bin/pine-lsp.js' },
     filetypes = { 'pine' },
   })
   ```

---

## Package.json Updates Needed

Add to root `package.json` scripts:

```json
{
  "scripts": {
    "lsp:start": "node dist/packages/lsp/bin/pine-lsp.js"
  },
  "bin": {
    "pine-validate": "./dist/packages/cli/src/cli.js",
    "pine-lsp": "./dist/packages/lsp/bin/pine-lsp.js"
  }
}
```

---

## Success Criteria

- [ ] Server starts and responds to `initialize` request
- [ ] Document sync works (open/change/close)
- [ ] Diagnostics published on document change
- [ ] Completions return results
- [ ] Hover returns documentation
- [ ] Signature help shows parameters
- [ ] Formatting works
- [ ] Can be used by Neovim/Sublime/other LSP clients
- [ ] All logic delegated to language-service (no direct parser calls)

---

## Commands

```bash
# Build
pnpm run build

# Start server (for testing)
node dist/packages/lsp/bin/pine-lsp.js

# Type check
pnpm tsc --noEmit
```
