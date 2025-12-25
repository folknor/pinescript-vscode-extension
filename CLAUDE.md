# pinescript-vscode-extension

VS Code extension providing Pine Script v6 support: IntelliSense, validation, and CLI linting.

## Architecture: Data vs Syntax

**Hardcoded in parser** (grammar fundamentals):
- Keywords: `if`, `else`, `for`, `while`, `var`, `varip`, `return`, `import`, `export`, `method`
- Operators: `+`, `-`, `*`, `/`, `and`, `or`, `not`, `?:`
- Type keywords: `int`, `float`, `bool`, `string`, `color`, `array`, `matrix`, `map`

**Generated from pine-data/** (API data):
- Function signatures, parameters, return types
- Built-in variables (`close`, `high`, `volume`)
- Constants (`color.red`, `shape.circle`)
- Syntax highlighting patterns

---

## Commands

```bash
# Development
pnpm install              # Install dependencies
pnpm run build            # Build extension
pnpm test                 # Run tests

# Data Pipeline (packages/pipeline/src/)
pnpm run crawl            # Crawl TradingView docs
pnpm run scrape           # Scrape function details
pnpm run generate         # Generate pine-data/v6/*.ts
pnpm run generate:syntax  # Generate syntaxes/pine.tmLanguage.json
pnpm run discover:behavior # Discover polymorphism → function-behavior.json

# CLI
node dist/packages/cli/src/cli.js <file.pine>

# Dev Tools
pnpm run test:snippet -- 'code'              # Test Pine snippet via CLI
pnpm run test:snippet -- --errors 'code'     # Show only errors
pnpm run test:snippet -- --filter text 'code'  # Filter errors

pnpm run debug:internals -- lookup hour      # Check symbol in pine-data
pnpm run debug:internals -- parse 'x = 1'    # Show AST
pnpm run debug:internals -- validate 'code'  # Full validation details
pnpm run debug:internals -- tokens 'code'    # Show lexer tokens with line/indent
pnpm run debug:internals -- symbols hour     # List matching symbols
pnpm run debug:internals -- analyze --summary          # Discrepancy summary
pnpm run debug:internals -- analyze --cli-errors       # CLI error summary
pnpm run debug:internals -- analyze --filter "token"   # Filter by message
pnpm run debug:internals -- corpus --summary           # v6 parse error stats
pnpm run debug:internals -- corpus --errors            # Files with parse errors

# Convenience aliases
pnpm run debug:tokens 'code'                 # Shortcut for tokens command
pnpm run debug:corpus --summary              # Shortcut for corpus analysis
```

### For LLM Agents

**Use the dev tools above instead of complex shell commands.** These tools are pre-approved and avoid permission prompts:

| Instead of... | Use this |
|---------------|----------|
| `cat > /tmp/test.js << 'EOF' ... EOF && node /tmp/test.js` | `pnpm run debug:internals -- validate 'code'` |
| `echo 'code' > /tmp/test.pine && node dist/.../cli.js /tmp/test.pine` | `pnpm run test:snippet -- 'code'` |
| `for f in plan/pine-lint-vs-cli-differences/*.json; do jq ... $f; done` | `pnpm run debug:internals -- analyze --filter "..."` |
| Grepping for function definitions in pine-data | `pnpm run debug:internals -- lookup <name>` |
| Creating temp files to test Parser/Validator | `pnpm run debug:internals -- parse 'code'` or `validate 'code'` |
| Debugging lexer tokens and indentation | `pnpm run debug:tokens 'code'` |
| Scanning pinescripts for v6 parse errors | `pnpm run debug:corpus --summary` or `--errors` |

The dev tools handle temp files, JSON parsing, and output formatting automatically.

---

## Project Structure

```
packages/
├── pipeline/src/         # Data generation scripts
│   ├── crawl.ts          # Crawl TradingView reference
│   ├── scrape.ts         # Scrape function details
│   ├── generate.ts       # Generate TypeScript data
│   ├── generate-syntax.ts # Generate tmLanguage
│   └── discover-function-behavior.ts
├── core/src/             # Parser, analyzer, types (STABLE)
│   ├── parser/           # Lexer, parser, AST
│   └── analyzer/         # Type checker, builtins
├── language-service/src/ # Editor-agnostic language service (COMPLETE)
│   ├── PineLanguageService.ts  # Main facade class
│   ├── features/         # Completions, hover, diagnostics, etc.
│   └── documents/        # Document lifecycle management
├── lsp/src/              # LSP server (COMPLETE)
│   ├── server.ts         # JSON-RPC server over stdio
│   ├── handlers/         # LSP protocol handlers
│   └── converters.ts     # Type conversions
├── mcp/src/              # MCP server for AI assistants (COMPLETE)
│   ├── server.ts         # MCP server with tools/resources
│   └── bin/pine-mcp.ts   # CLI entry point
├── cli/src/              # CLI tool (STABLE)
└── vscode/src/           # VS Code extension (IN PROGRESS)

dev-tools/
├── test-snippet.js       # Quick Pine snippet testing via CLI
├── debug-internals.js    # Debug parser/validator/symbols directly
└── analysis/             # Comparison tools

pine-data/
├── v6/                   # Generated data (safe to regenerate)
│   ├── functions.ts      # 457 functions
│   ├── variables.ts      # 80 variables
│   ├── constants.ts      # 237 constants
│   └── function-behavior.json  # Polymorphism metadata
└── raw/v6/               # Scraped JSON data

syntaxes/
└── pine.tmLanguage.json  # Generated syntax highlighting
```

---

## Current Status

### Package Status

| Package | Status | Description |
|---------|--------|-------------|
| `packages/core/` | ✅ Stable | Parser, lexer, validator, type checker |
| `packages/cli/` | ✅ Stable | CLI validation tool |
| `packages/pipeline/` | ✅ Stable | Data generation scripts |
| `packages/language-service/` | ✅ Complete | Editor-agnostic language service |
| `packages/lsp/` | ✅ Complete | LSP server (JSON-RPC over stdio) |
| `packages/mcp/` | ✅ Complete | MCP server for AI assistants |
| `packages/vscode/` | ✅ Complete | Thin LSP client (197 lines) |
| `pine-data/` | ✅ Stable | Generated language data |
| `syntaxes/` | ✅ Stable | TextMate grammar |

### Corpus Validation

**44 of 49 v6 scripts pass validation (89.8%)**

Run `pnpm run debug:corpus --summary` for fresh stats.

5 failing scripts have source file issues (not parser bugs):
- `tdf-20251102.pine` - Missing commas between function arguments
- `854667873-nsdt-2.pine` - Broken comment (line wrap without `//`)
- `873410237-v6.pine` - Broken comments with Chinese characters
- `878477865-BigBeluga` - Broken comment + inconsistent switch indentation
- `894372674-Smrt-Algo` - `bar index` typo (should be `bar_index`)

### Test Suite

**118 tests passing** (51 in `packages/core/test/` + 67 in `packages/language-service/test/`)

---

## Recently Completed

### Full LSP Feature Implementation (December 2024)

Implemented all planned LSP features (WI-1 through WI-10), bringing the extension to feature parity with best-in-class extensions:

| Feature | Status | Description |
|---------|--------|-------------|
| Go to Definition | ✅ Complete | Navigate to user-defined symbols and library exports |
| Find References | ✅ Complete | Find all usages of any symbol |
| Document Symbols | ✅ Complete | Outline view with functions, variables, imports |
| Rename Symbol | ✅ Complete | Safe renaming with scope awareness |
| Code Actions | ✅ Complete | Quick fixes for common issues |
| Semantic Tokens | ✅ Complete | Rich syntax highlighting with built-in detection |
| Inlay Hints | ✅ Complete | Parameter names at call sites |
| Folding Ranges | ✅ Complete | Collapse functions, blocks, comments |
| Enhanced Formatting | ✅ Complete | Operator spacing, comma spacing |
| Library Import Resolution | ✅ Complete | `/// @source` directive support |

**Library Import Resolution Usage:**
```pine
/// @source ./libs/my-library.pine
import User/MyLibrary/1 as myLib

x = myLib.myFunction(close)  // IntelliSense works!
```

### Architecture Refactor (December 2024)

Restructured the extension from monolithic to modular architecture:

| Before | After |
|--------|-------|
| `packages/lsp/` imported `vscode` directly | Editor-agnostic `packages/language-service/` |
| `packages/mcp/` was empty | Full MCP server with 4 tools, 3 resources |
| `packages/vscode/extension.ts` 530 lines | Thin LSP client at 197 lines |

**New Package Structure:**
```
packages/
├── language-service/     # Shared brain (21 tests)
│   ├── PineLanguageService.ts
│   ├── features/         # completions, hover, diagnostics, etc.
│   └── documents/        # Document lifecycle
├── lsp/                  # LSP server (JSON-RPC over stdio)
│   ├── server.ts
│   ├── handlers/
│   └── converters.ts
├── mcp/                  # MCP server for AI assistants
│   └── server.ts         # pine_validate, pine_lookup, etc.
└── vscode/               # Thin LSP client
    └── extension.ts      # 197 lines
```

---

## Data Pipeline

All API data is scraped from TradingView docs and generated:

| Command | Output |
|---------|--------|
| `crawl` | `pine-data/raw/v6/v6-language-constructs.json` |
| `scrape` | `pine-data/raw/v6/complete-v6-details.json` |
| `generate` | `pine-data/v6/*.ts` |
| `generate:syntax` | `syntaxes/pine.tmLanguage.json` |
| `discover:behavior` | `pine-data/v6/function-behavior.json` |

**Regenerating is safe** - customizations are in the scripts, not output files.

### Polymorphic Functions

Discovered automatically via `discover:behavior`:

```json
{
  "input": { "polymorphic": { "returnTypeParam": "defval" } },
  "nz": { "polymorphic": { "returnTypeParam": "source" } }
}
```

`input(defval=42)` → `input int`, `input(defval=2.0)` → `input float`

---

## Key Implementation Details

### Function Overloads
`hasOverloads()` in `builtins.ts` detects overloaded functions by checking for `type: "unknown"` parameters. The type checker skips positional type checking for these functions.

### Type Coercion
`types.ts` handles:
- `simple<T>` ↔ `series<T>` coercion
- `series<T>` → `T` coercion (series values in simple contexts)
- `int` ↔ `float` bidirectional coercion
- `series<float>` → `color` coercion
- Numeric → `string` coercion
- Color type arithmetic

---

## Known Limitations

- **Legacy color constants** - v4/v5 scripts use bare `red`, `green`, etc. In v6, must use `color.red`. Not fixing since these are pre-v6 scripts.
- **Invalid parameter names** - Some scripts use deprecated params like `type` (input) and `when` (strategy). These are v5 params not valid in v6.
- **Nested inline switches with tuples** - Deeply nested inline switches with tuple assignments inside case bodies are not yet fully supported. Basic inline switch with tuples works.
- **Built-in unused variable warnings** - The core validator (`UnifiedPineValidator`) incorrectly reports built-in variables/keywords as "declared but never used". This is a bug in the unused variable detection logic that needs to exclude built-ins from the check. Location: `packages/core/src/analyzer/checker.ts`.

### Multiline String Behavior (v6)

Multiline strings are valid but **deprecated** in v6:
```pine
string TT = "Line 1
     Line 2"  // Each wrapped line adds exactly one space
```

Recommended approach - concatenate with `+`:
```pine
string TT = "Line 1 " +
     "Line 2"
```

---

## Feature Analysis: Comparison to Best-in-Class Extensions

This section compares our Pine Script extension to industry-leading VS Code language extensions to identify gaps and prioritize improvements.

### Reference Extensions

| Extension | Language | Why It's Best-in-Class |
|-----------|----------|------------------------|
| **TypeScript** (built-in) | TS/JS | Gold standard for IDE features; same team builds language and tooling |
| **Pylance** (Microsoft) | Python | Excellent type inference, fast, great UX for dynamic language |
| **rust-analyzer** | Rust | Community-driven, excellent code navigation and refactoring |
| **Go** (Google) | Go | Clean, fast, well-integrated with language tooling |

---

### Feature Comparison Matrix

| Feature | TypeScript | Pylance | rust-analyzer | **Pine Script** | Gap |
|---------|------------|---------|---------------|-----------------|-----|
| **Completions** | ✅ | ✅ | ✅ | ✅ | None |
| **Hover docs** | ✅ | ✅ | ✅ | ✅ | None |
| **Signature help** | ✅ | ✅ | ✅ | ✅ | None |
| **Diagnostics** | ✅ | ✅ | ✅ | ✅ | None |
| **Formatting** | ✅ | ✅ | ✅ | ✅ | None |
| **Go to definition** | ✅ | ✅ | ✅ | ✅ | None |
| **Find references** | ✅ | ✅ | ✅ | ✅ | None |
| **Rename symbol** | ✅ | ✅ | ✅ | ✅ | None |
| **Document symbols** | ✅ | ✅ | ✅ | ✅ | None |
| **Workspace symbols** | ✅ | ✅ | ✅ | ❌ | Low priority |
| **Code actions** | ✅ | ✅ | ✅ | ✅ | None |
| **Semantic tokens** | ✅ | ✅ | ✅ | ✅ | None |
| **Inlay hints** | ✅ | ✅ | ✅ | ✅ | None |
| **Call hierarchy** | ✅ | ✅ | ✅ | ❌ | Low priority |
| **Folding ranges** | ✅ | ✅ | ✅ | ✅ | None |
| **Breadcrumbs** | ✅ | ✅ | ✅ | ✅ | None (via document symbols) |

---

### Current Feature Assessment

#### What We Do Well

**1. Completions (IntelliSense)** - ✅ Excellent
- 457 functions with full signatures, docs, and examples
- Context-aware: knows when you're in a function call vs top-level
- Parameter-aware: `color=` suggests `color.red`, `color.green`, etc.
- Namespace completions: `ta.` shows all technical analysis functions
- Snippet generation for function calls

**2. Hover Documentation** - ✅ Excellent
- Full markdown rendering with syntax blocks
- Parameter descriptions included
- Return type annotations
- Deprecation warnings shown

**3. Signature Help** - ✅ Excellent
- Active parameter highlighting
- Handles nested parentheses correctly
- Shows all parameters with types and descriptions

**4. Diagnostics** - ✅ Good
- Parser errors with accurate line/column
- Type checking for function arguments
- 11 Pine-specific pattern warnings (common mistakes)
- Real-time validation as you type

#### What's Missing (Low Priority)

**1. Workspace Symbols** - ❌ Not implemented
- Cannot search symbols across multiple files
- Single-file workflow is the norm for Pine Script

**2. Call Hierarchy** - ❌ Not implemented
- Cannot see incoming/outgoing calls for a function
- Low value for typical Pine Script file sizes

---

### What Makes Extensions Feel "Best-in-Class"

Based on analysis of top extensions, users perceive quality through:

1. **Navigation speed** - Can I jump to definitions instantly? ✅ Yes
2. **Refactoring confidence** - Can I rename safely? ✅ Yes
3. **Code understanding** - Can I see the outline/structure? ✅ Yes
4. **Error recovery** - Does it suggest fixes? ✅ Yes
5. **Responsiveness** - Is it fast? ✅ Yes
6. **Completions quality** - Are suggestions relevant? ✅ Yes

Our extension now provides a complete IDE experience for Pine Script development.

---

### Completed Work Items

All planned LSP features have been implemented:

| Work Item | Feature | Files Created |
|-----------|---------|---------------|
| WI-1 | Go to Definition | `features/definition.ts`, `handlers/definition.ts` |
| WI-2 | Find References | `features/references.ts`, `handlers/references.ts` |
| WI-3 | Document Symbols | `features/symbols.ts`, `handlers/symbols.ts` |
| WI-4 | Rename Symbol | `features/rename.ts`, `handlers/rename.ts` |
| WI-5 | Code Actions | `features/codeActions.ts`, `handlers/codeActions.ts` |
| WI-6 | Semantic Tokens | `features/semanticTokens.ts`, `handlers/semanticTokens.ts` |
| WI-7 | Inlay Hints | `features/inlayHints.ts`, `handlers/inlayHints.ts` |
| WI-8 | Folding Ranges | `features/folding.ts`, `handlers/folding.ts` |
| WI-9 | Enhanced Formatting | `features/formatting.ts` (enhanced) |
| WI-10 | Library Import Resolution | `features/imports.ts` |

### Library Import Resolution

Pine Script libraries use `import User/Library/Version` syntax, but there's no way to discover library source code. The `/// @source` directive solves this:

```pine
/// @source ./libs/my-library.pine
import User/MyLibrary/1 as myLib

x = myLib.myFunction(close)  // Full IntelliSense!
```

**Features enabled:**
- Completions after `alias.`
- Hover documentation for library functions
- Go to definition into library source files
- Info diagnostic when `/// @source` is missing

---

## Future Work

- **Workspace symbols** - Search across multiple files (low priority for single-file Pine workflows)
- **Call hierarchy** - Show incoming/outgoing calls for functions
- **language-configuration.json autogeneration** - Consider generating from pine-data
- **Fuzzer implementation** - Property-based testing for parser robustness

---

## Comparison Tool

Compare CLI output against TradingView's pine-lint:

```bash
node dev-tools/compare-validation-results.js
```
