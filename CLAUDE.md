# pine-tools

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

**143 tests passing** (76 in `packages/core/test/` + 67 in `packages/language-service/test/`)

---

**Library Import Resolution Usage:**
```pine
/// @source ./libs/my-library.pine
import User/MyLibrary/1 as myLib

x = myLib.myFunction(close)  // IntelliSense works!
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

## VS Code Marketplace Publishing

### Required Steps

1. **Add extension icon** (128x128 PNG):
   ```bash
   # Add icon.png to project root, then update package.json:
   "icon": "icon.png"
   ```

2. **Create Azure DevOps PAT**:
   - Go to https://dev.azure.com
   - Create Personal Access Token with "Marketplace (Publish)" scope
   - Token must be for "All accessible organizations"

3. **Publish**:
   ```bash
   pnpm exec vsce login folknor
   pnpm exec vsce publish
   ```

### Optional Enhancements

| Feature | Description | Effort |
|---------|-------------|--------|
| **Extension icon** | Pine tree or chart icon, 128x128 PNG | Required |
| **Gallery banner** | Marketplace header image/color in package.json | Low |
| **Badges** | Version, installs, rating badges in README | Low |
| **GIF demos** | Animated demos of IntelliSense, formatting | Medium |
| **Keybindings** | Default keyboard shortcuts for commands | Low |
| **Snippets** | Code snippets for common patterns (`indicator`, `strategy`) | Medium |
| **Code actions** | Quick fixes for diagnostics (auto-import, fix typos) | High |
| **Debugger** | Step-through debugging (requires TradingView API) | Not feasible |

### Package Commands

```bash
pnpm run package          # Build VSIX to dist/
pnpm run rebuild          # Clean + build + test + package
pnpm run rebuild:skip-tests  # Clean + build + package (no tests)
```

---

## Future Work

- *No major items pending*

---

## Comparison Tool

Compare CLI output against TradingView's pine-lint:

```bash
node dev-tools/compare-validation-results.js
```
