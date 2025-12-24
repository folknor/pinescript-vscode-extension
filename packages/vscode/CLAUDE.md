# packages/vscode

VS Code extension for Pine Script v6. This is a **thin LSP client** that spawns the LSP server and provides VS Code-specific features.

## Critical Constraint

This extension should be **minimal**. All language intelligence comes from the LSP server. The extension only handles:
- LSP client setup
- VS Code-specific commands
- VS Code-specific UI (status bar, etc.)

**Target: < 150 lines of code in extension.ts**

---

## Purpose

- Spawn and manage the Pine Script LSP server
- Forward all language features to the LSP server
- Provide VS Code-specific commands and UI

---

## Dependencies

### External (npm - already in package.json)
```typescript
import * as vscode from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";
```

### Internal - NONE
This package should NOT import from other packages directly. All language intelligence comes via LSP.

```typescript
// FORBIDDEN - don't import these directly
import { Parser } from "../../core/src/parser/parser";  // NO!
import { PineLanguageService } from "../../language-service/src";  // NO!
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    VS Code Extension                            │
├─────────────────────────────────────────────────────────────────┤
│ On Activation:                                                  │
│   1. Spawn LSP server process (packages/lsp/bin/pine-lsp.js)    │
│   2. Create LanguageClient with stdio transport                 │
│   3. Register VS Code-specific features                         │
├─────────────────────────────────────────────────────────────────┤
│ LSP Client Handles (automatic via vscode-languageclient):       │
│   - Completions                                                 │
│   - Hover                                                       │
│   - Signature help                                              │
│   - Diagnostics                                                 │
│   - Formatting                                                  │
│   - Go to definition                                            │
│   - Document symbols                                            │
├─────────────────────────────────────────────────────────────────┤
│ VS Code-Specific Features (implemented here):                   │
│   - File association (*.pine → pine language)                   │
│   - Commands (pine.showDocs, etc.)                              │
│   - Status bar item (optional)                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
packages/vscode/
├── src/
│   ├── extension.ts       # Main activation (< 150 lines)
│   └── commands.ts        # VS Code command implementations
└── test/
    └── extension.test.ts
```

---

## Implementation Guide

### 1. Extension Entry Point (src/extension.ts)

```typescript
import * as path from "node:path";
import * as vscode from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";
import { registerCommands } from "./commands";

let client: LanguageClient | undefined;

export async function activate(context: vscode.ExtensionContext) {
  // Path to the LSP server
  const serverModule = context.asAbsolutePath(
    path.join("dist", "packages", "lsp", "bin", "pine-lsp.js")
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
      // Notify server about file changes to .pine files
      fileEvents: vscode.workspace.createFileSystemWatcher("**/*.pine"),
    },
  };

  // Create and start the client
  client = new LanguageClient(
    "pineLanguageServer",
    "Pine Script Language Server",
    serverOptions,
    clientOptions
  );

  // Start the client (also starts the server)
  await client.start();

  // Register VS Code-specific commands
  registerCommands(context, client);

  // Optional: Apply file association
  applyFileAssociation();

  console.log("Pine Script extension activated");
}

export async function deactivate() {
  if (client) {
    await client.stop();
  }
}

function applyFileAssociation() {
  const cfg = vscode.workspace.getConfiguration();
  const shouldApply = cfg.get<boolean>("pine.applyFileAssociation", true);
  if (!shouldApply) return;

  const assoc = cfg.get<Record<string, string>>("files.associations", {});
  if (assoc["*.pine"] !== "pine") {
    const newAssoc = { ...assoc, "*.pine": "pine" };
    cfg.update(
      "files.associations",
      newAssoc,
      vscode.ConfigurationTarget.Workspace
    ).then(undefined, () => { /* ignore errors on readonly workspaces */ });
  }
}
```

### 2. Commands (src/commands.ts)

```typescript
import * as vscode from "vscode";
import { LanguageClient } from "vscode-languageclient/node";

export function registerCommands(
  context: vscode.ExtensionContext,
  client: LanguageClient
) {
  // Command: Show docs for symbol under cursor
  context.subscriptions.push(
    vscode.commands.registerCommand("pine.showDocs", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.document.languageId !== "pine") {
        vscode.window.showInformationMessage("Open a Pine file to show docs.");
        return;
      }

      // Get word under cursor
      const wordRange = editor.document.getWordRangeAtPosition(
        editor.selection.active,
        /[A-Za-z_.]+/
      );
      const word = wordRange ? editor.document.getText(wordRange) : "";

      if (!word) {
        vscode.window.showInformationMessage("Place cursor on a symbol.");
        return;
      }

      // Request hover from LSP (it has the documentation)
      const hover = await client.sendRequest("textDocument/hover", {
        textDocument: { uri: editor.document.uri.toString() },
        position: {
          line: editor.selection.active.line,
          character: editor.selection.active.character,
        },
      });

      if (!hover || !hover.contents) {
        vscode.window.showInformationMessage(`No docs found for '${word}'.`);
        return;
      }

      // Show in a webview panel
      const panel = vscode.window.createWebviewPanel(
        "pineDocs",
        `Pine: ${word}`,
        vscode.ViewColumn.Beside,
        { enableScripts: false }
      );

      // Extract markdown content
      const content =
        typeof hover.contents === "string"
          ? hover.contents
          : hover.contents.value || "";

      panel.webview.html = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: var(--vscode-editor-font-family); padding: 20px; }
              pre { background: var(--vscode-textCodeBlock-background); padding: 10px; }
            </style>
          </head>
          <body>
            <h2>${escapeHtml(word)}</h2>
            <div>${markdownToHtml(content)}</div>
          </body>
        </html>
      `;
    })
  );

  // Command: Validate current file (triggers LSP diagnostics refresh)
  context.subscriptions.push(
    vscode.commands.registerCommand("pine.validate", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.document.languageId !== "pine") {
        vscode.window.showInformationMessage("Open a Pine file to validate.");
        return;
      }

      // Force a document change to trigger re-validation
      // The LSP will send diagnostics automatically
      await vscode.commands.executeCommand(
        "editor.action.formatDocument"
      ).then(undefined, () => {
        // Formatting might fail, that's ok
      });

      vscode.window.showInformationMessage("Pine validation triggered.");
    })
  );
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function markdownToHtml(md: string): string {
  // Simple markdown conversion (or use a library)
  return md
    .replace(/```(\w+)?\n([\s\S]*?)```/g, "<pre><code>$2</code></pre>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>");
}
```

---

## What to DELETE from Current Implementation

The current `extension.ts` has ~530 lines with lots of logic that should NOT be here. Delete:

| Lines | Content | Why Remove |
|-------|---------|------------|
| 46-78 | Formatter provider | Now via LSP |
| 80-224 | Completion provider | Now via LSP |
| 226-237 | Hover provider | Now via LSP |
| 239-247 | Signature help provider | Now via LSP |
| 249-451 | Diagnostics + 11 hardcoded patterns | Now via LSP |
| 453-489 | pine.validate command | Simplified |
| 491-529 | pine.showDocs command | Simplified |

**Keep only:**
- File association logic (simplified)
- VS Code commands (simplified to use LSP)
- LSP client setup (new)

---

## package.json Configuration

The root `package.json` already has the VS Code extension configuration. No changes needed for:
- `contributes.commands`
- `contributes.configuration`
- `contributes.languages`
- `contributes.grammars`

The `main` entry point is already correct:
```json
{
  "main": "./dist/packages/vscode/src/extension.js"
}
```

---

## Testing

### Integration Test

```typescript
// test/extension.test.ts
import { describe, it, expect } from 'vitest';

describe('VS Code Extension', () => {
  it('should export activate and deactivate', async () => {
    const ext = await import('../src/extension');
    expect(typeof ext.activate).toBe('function');
    expect(typeof ext.deactivate).toBe('function');
  });
});
```

### Manual Testing

1. Build the extension:
   ```bash
   pnpm run build
   ```

2. Press F5 in VS Code to launch Extension Development Host

3. Open a `.pine` file and verify:
   - [ ] Syntax highlighting works
   - [ ] Completions appear after typing `ta.`
   - [ ] Hover shows documentation
   - [ ] Errors appear as squiggles
   - [ ] Formatting works (Shift+Alt+F)
   - [ ] `pine.showDocs` command works

---

## Success Criteria

- [ ] Extension.ts < 150 lines
- [ ] All language features work via LSP
- [ ] No hardcoded validation patterns (moved to language-service)
- [ ] No direct imports from core/language-service
- [ ] LSP server spawns correctly
- [ ] Commands work (pine.showDocs, pine.validate)
- [ ] File association applies correctly
- [ ] Extension loads in < 500ms

---

## Commands

```bash
# Build
pnpm run build

# Package extension
pnpm run package

# Launch extension host for testing
# Press F5 in VS Code

# Type check
pnpm tsc --noEmit
```

---

## Comparison: Before vs After

### Before (Current - 530 lines)
```
extension.ts
├── File association logic
├── Formatter provider (inline)
├── Completion provider (inline, 150+ lines)
├── Hover provider (inline)
├── Signature help provider (inline)
├── Diagnostics (inline, 200+ lines)
│   ├── Parser validation
│   ├── UnifiedPineValidator
│   └── 11 hardcoded regex patterns
├── pine.validate command
└── pine.showDocs command
```

### After (Target - < 150 lines)
```
extension.ts
├── LSP client setup (~40 lines)
├── File association (~15 lines)
└── activate/deactivate (~20 lines)

commands.ts
├── pine.showDocs (~40 lines)
└── pine.validate (~15 lines)
```
