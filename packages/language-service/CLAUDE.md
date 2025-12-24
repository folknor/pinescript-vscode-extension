# packages/language-service

Editor-agnostic language intelligence layer for Pine Script v6. This is the **shared brain** consumed by both LSP and MCP servers.

## Critical Constraint

**ZERO imports from `vscode` module.** This package must work in any JavaScript runtime (Node.js, Bun, etc.) without VS Code.

---

## Purpose

Provide all language intelligence features through a single `PineLanguageService` class:
- Completions (IntelliSense)
- Hover documentation
- Diagnostics (errors + warnings)
- Signature help (parameter hints)
- Formatting
- Go-to-definition
- Document symbols

---

## Dependencies

### Internal (imports allowed)
```typescript
// Core parsing and validation
import { Parser } from "../../core/src/parser/parser";
import { UnifiedPineValidator } from "../../core/src/analyzer/checker";
import { SemanticAnalyzer } from "../../core/src/parser/semanticAnalyzer";

// Language data
import {
  FUNCTIONS_BY_NAME,
  FUNCTIONS_BY_NAMESPACE,
  VARIABLES_BY_NAME,
  CONSTANTS_BY_NAMESPACE,
  PineV6
} from "../../pine-data/v6";
```

### External (npm packages allowed)
- None required. Keep dependencies minimal.

### Forbidden
```typescript
// DO NOT import these - they couple us to VS Code
import * as vscode from "vscode";  // FORBIDDEN
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PineLanguageService                          │
├─────────────────────────────────────────────────────────────────┤
│ Constructor:                                                    │
│   new PineLanguageService()                                     │
├─────────────────────────────────────────────────────────────────┤
│ Document Management:                                            │
│   openDocument(uri: string, content: string, version: number)   │
│   updateDocument(uri: string, content: string, version: number) │
│   closeDocument(uri: string)                                    │
│   getDocument(uri: string): ParsedDocument | undefined          │
├─────────────────────────────────────────────────────────────────┤
│ Intelligence Features:                                          │
│   getCompletions(uri, position): CompletionItem[]               │
│   getHover(uri, position): HoverInfo | null                     │
│   getDiagnostics(uri): Diagnostic[]                             │
│   getSignatureHelp(uri, position): SignatureHelp | null         │
│   format(uri, options): TextEdit[]                              │
│   getDefinition(uri, position): Location | null                 │
│   getDocumentSymbols(uri): DocumentSymbol[]                     │
├─────────────────────────────────────────────────────────────────┤
│ Static Helpers (no document needed):                            │
│   getSymbolInfo(symbol: string): SymbolInfo | null              │
│   getAllFunctions(namespace?: string): FunctionInfo[]           │
│   getAllVariables(namespace?: string): VariableInfo[]           │
│   getAllConstants(namespace?: string): ConstantInfo[]           │
│   getAllNamespaces(): string[]                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Types to Define

Create `src/types.ts` with protocol-agnostic types:

```typescript
// Position & Range (0-indexed, like LSP)
export interface Position {
  line: number;      // 0-indexed
  character: number; // 0-indexed (UTF-16 code units)
}

export interface Range {
  start: Position;
  end: Position;
}

export interface Location {
  uri: string;
  range: Range;
}

// Diagnostics
export enum DiagnosticSeverity {
  Error = 1,
  Warning = 2,
  Information = 3,
  Hint = 4,
}

export interface Diagnostic {
  range: Range;
  severity: DiagnosticSeverity;
  message: string;
  source?: string;  // "pine-lint"
  code?: string;    // Error code for lookup
}

// Completions
export enum CompletionItemKind {
  Function = 3,
  Variable = 6,
  Constant = 21,
  Keyword = 14,
  Module = 9,    // Namespace
  Field = 5,     // Parameter
  Color = 16,
}

export interface CompletionItem {
  label: string;
  kind: CompletionItemKind;
  detail?: string;           // Short description (shown inline)
  documentation?: string;    // Full markdown docs
  insertText?: string;       // Text to insert (may differ from label)
  insertTextFormat?: 1 | 2;  // 1=PlainText, 2=Snippet
}

// Hover
export interface HoverInfo {
  contents: string;  // Markdown
  range?: Range;
}

// Signature Help
export interface ParameterInfo {
  label: string;
  documentation?: string;
}

export interface SignatureInfo {
  label: string;              // Full signature: "ta.sma(source, length)"
  documentation?: string;     // Markdown description
  parameters: ParameterInfo[];
}

export interface SignatureHelp {
  signatures: SignatureInfo[];
  activeSignature: number;
  activeParameter: number;
}

// Formatting
export interface TextEdit {
  range: Range;
  newText: string;
}

export interface FormattingOptions {
  tabSize: number;
  insertSpaces: boolean;
}

// Document Symbols
export enum SymbolKind {
  Function = 12,
  Variable = 13,
  Constant = 14,
  Enum = 10,
  Struct = 23,
}

export interface DocumentSymbol {
  name: string;
  kind: SymbolKind;
  range: Range;
  selectionRange: Range;
  children?: DocumentSymbol[];
}

// Symbol lookup (static, no document needed)
export interface SymbolInfo {
  name: string;
  kind: "function" | "variable" | "constant";
  syntax?: string;
  description: string;
  returns?: string;
  type?: string;
  parameters?: ParameterInfo[];
  namespace?: string;
  deprecated?: boolean;
}
```

---

## File Structure

```
packages/language-service/
├── src/
│   ├── index.ts                 # Public exports
│   ├── PineLanguageService.ts   # Main facade class
│   ├── types.ts                 # All type definitions above
│   │
│   ├── documents/
│   │   ├── DocumentManager.ts   # Document lifecycle management
│   │   └── ParsedDocument.ts    # Cached parse result + AST
│   │
│   └── features/
│       ├── completions.ts       # getCompletions implementation
│       ├── hover.ts             # getHover implementation
│       ├── diagnostics.ts       # getDiagnostics implementation
│       ├── signatures.ts        # getSignatureHelp implementation
│       ├── formatting.ts        # format implementation
│       ├── definition.ts        # getDefinition implementation
│       ├── symbols.ts           # getDocumentSymbols implementation
│       └── lookup.ts            # Static symbol lookup helpers
│
└── test/
    ├── completions.test.ts
    ├── hover.test.ts
    ├── diagnostics.test.ts
    └── service.test.ts          # Integration tests
```

---

## Implementation Guide

### 1. ParsedDocument (documents/ParsedDocument.ts)

Caches parsing results for a document:

```typescript
export class ParsedDocument {
  readonly uri: string;
  readonly version: number;
  readonly content: string;
  readonly ast: Program;           // From Parser
  readonly parseErrors: Error[];   // Lexer + parser errors
  readonly lines: string[];        // For position lookup

  constructor(uri: string, content: string, version: number) {
    this.uri = uri;
    this.version = version;
    this.content = content;
    this.lines = content.split('\n');

    const parser = new Parser(content);
    this.ast = parser.parse();
    this.parseErrors = [
      ...parser.getLexerErrors(),
      ...parser.getParserErrors()
    ];
  }

  // Convert Position to offset
  offsetAt(position: Position): number { ... }

  // Convert offset to Position
  positionAt(offset: number): Position { ... }

  // Get text at range
  getText(range?: Range): string { ... }

  // Get word at position (for hover/definition)
  getWordAtPosition(position: Position): string | null { ... }
}
```

### 2. DocumentManager (documents/DocumentManager.ts)

```typescript
export class DocumentManager {
  private documents = new Map<string, ParsedDocument>();

  open(uri: string, content: string, version: number): ParsedDocument { ... }
  update(uri: string, content: string, version: number): ParsedDocument { ... }
  close(uri: string): void { ... }
  get(uri: string): ParsedDocument | undefined { ... }
}
```

### 3. Completions (features/completions.ts)

Port logic from current `packages/lsp/src/languageService/completions.ts`:

```typescript
export function getCompletions(
  doc: ParsedDocument,
  position: Position
): CompletionItem[] {
  const line = doc.lines[position.line];
  const beforeCursor = line.substring(0, position.character);

  // 1. After namespace dot: ta. → namespace members
  const nsMatch = beforeCursor.match(/([a-z]+)\.\s*$/);
  if (nsMatch) {
    return getNamespaceCompletions(nsMatch[1]);
  }

  // 2. Inside function call: suggest parameters
  // 3. After param=: suggest constants
  // 4. Default: all completions (functions, variables, keywords, namespaces)

  return getAllCompletions();
}
```

### 4. Diagnostics (features/diagnostics.ts)

Combine core validation with pattern-based warnings. **Move the 11 hardcoded patterns from extension.ts here:**

```typescript
export function getDiagnostics(doc: ParsedDocument): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  // 1. Parse errors from lexer/parser
  for (const err of doc.parseErrors) {
    diagnostics.push({
      range: { start: { line: err.line - 1, character: err.column - 1 }, ... },
      severity: DiagnosticSeverity.Error,
      message: err.message,
      source: "pine-lint"
    });
  }

  // 2. Validation errors from UnifiedPineValidator
  const validator = new UnifiedPineValidator();
  const version = detectVersion(doc.content) || "6";
  const validationErrors = validator.validate(doc.ast, version);
  // ... convert to Diagnostic[]

  // 3. Pattern-based warnings (move from extension.ts)
  diagnostics.push(...getPatternWarnings(doc));

  return diagnostics;
}

function getPatternWarnings(doc: ParsedDocument): Diagnostic[] {
  const warnings: Diagnostic[] = [];
  const text = doc.content;

  // Version header check
  if (!/^\s*\/\/@version=6/m.test(text)) {
    warnings.push({
      range: { start: { line: 0, character: 0 }, end: { line: 0, character: 1 } },
      severity: DiagnosticSeverity.Warning,
      message: "Recommend using //@version=6 for Pine v6.",
      source: "pine-lint"
    });
  }

  // ... port all 11 patterns from extension.ts lines 284-448

  return warnings;
}
```

### 5. Hover (features/hover.ts)

```typescript
export function getHover(
  doc: ParsedDocument,
  position: Position
): HoverInfo | null {
  const word = doc.getWordAtPosition(position);
  if (!word) return null;

  const info = getSymbolInfo(word);
  if (!info) return null;

  // Build markdown content
  let md = `### ${word}\n\n`;
  if (info.syntax) md += `\`\`\`pine\n${info.syntax}\n\`\`\`\n\n`;
  if (info.description) md += info.description + "\n\n";
  if (info.returns) md += `**Returns:** \`${info.returns}\`\n\n`;
  if (info.type) md += `**Type:** \`${info.type}\`\n\n`;

  return { contents: md };
}
```

---

## Porting Guide

### From packages/lsp/src/languageService/completions.ts

| Current Function | New Location | Changes Needed |
|------------------|--------------|----------------|
| `createCompletionItem()` | `features/completions.ts` | Return `CompletionItem` (our type), not `vscode.CompletionItem` |
| `getNamespaceCompletions()` | `features/completions.ts` | Same |
| `getAllCompletions()` | `features/completions.ts` | Same |
| `getParameterCompletions()` | `features/completions.ts` | Same |
| `getConstantCompletions()` | `features/completions.ts` | Same |
| `getHoverInfo()` | `features/hover.ts` | Return `HoverInfo`, not `vscode.Hover` |
| `V6_KEYWORDS` | Import from `../../core/src/constants/keywords.ts` | Already exists |

### From packages/lsp/src/languageService/signatures.ts

| Current Function | New Location | Changes Needed |
|------------------|--------------|----------------|
| `parseParameters()` | `features/signatures.ts` | Keep as-is |
| `calculateActiveParameter()` | `features/signatures.ts` | Keep as-is |
| `findFunctionName()` | `features/signatures.ts` | Keep as-is |
| `createSignatureHelpProvider()` | `features/signatures.ts` as `getSignatureHelp()` | Return `SignatureHelp`, not provider |

### From packages/vscode/src/extension.ts

Move these pattern checks to `features/diagnostics.ts`:

| Line Range | Pattern |
|------------|---------|
| 284-293 | Version header `//@version=6` |
| 295-306 | `input.timeframe` suggestion |
| 308-320 | `time()/session` boolean usage |
| 322-335 | `ta.change` in condition |
| 337-346 | `timenow` milliseconds |
| 348-357 | `math.clamp` invalid function |
| 359-375 | `plotshape shape=` → `style=` |
| 377-390 | `plotchar shape=` → `char=` |
| 392-414 | `timeframe_gaps` without `timeframe` |
| 416-432 | `alertcondition` arg count |
| 434-448 | `input.string()` missing defval |

---

## Testing

Use vitest (already configured in project):

```typescript
// test/completions.test.ts
import { describe, it, expect } from 'vitest';
import { PineLanguageService } from '../src';

describe('Completions', () => {
  it('should return namespace members after dot', () => {
    const service = new PineLanguageService();
    service.openDocument('test.pine', 'x = ta.', 1);

    const completions = service.getCompletions('test.pine', { line: 0, character: 7 });

    expect(completions.some(c => c.label === 'sma')).toBe(true);
    expect(completions.some(c => c.label === 'ema')).toBe(true);
  });

  it('should return all completions at empty position', () => {
    const service = new PineLanguageService();
    service.openDocument('test.pine', '', 1);

    const completions = service.getCompletions('test.pine', { line: 0, character: 0 });

    // Should have keywords, functions, variables, namespaces
    expect(completions.some(c => c.label === 'if')).toBe(true);
    expect(completions.some(c => c.label === 'plot')).toBe(true);
    expect(completions.some(c => c.label === 'close')).toBe(true);
    expect(completions.some(c => c.label === 'ta')).toBe(true);
  });
});
```

---

## Success Criteria

- [ ] Zero imports from `vscode` module
- [ ] `PineLanguageService` class with all documented methods
- [ ] All 11 validation patterns moved from extension.ts
- [ ] Completions work for: namespaces, parameters, constants, global
- [ ] Hover returns markdown documentation
- [ ] Diagnostics include parse errors + validation errors + warnings
- [ ] Signature help shows function parameters
- [ ] Formatting trims whitespace and normalizes blank lines
- [ ] Unit tests for each feature
- [ ] Can be instantiated and used without any VS Code context

---

## Commands

```bash
# Run tests
pnpm test --filter=language-service

# Build
pnpm run build

# Type check
pnpm tsc --noEmit -p packages/language-service
```
