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
pnpm run debug:internals -- symbols hour     # List matching symbols
pnpm run debug:internals -- analyze --summary          # Discrepancy summary
pnpm run debug:internals -- analyze --cli-errors       # CLI error summary
pnpm run debug:internals -- analyze --filter "token"   # Filter by message
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
├── core/src/             # Parser, analyzer, types
│   ├── parser/           # Lexer, parser, AST
│   └── analyzer/         # Type checker, builtins
├── cli/src/              # CLI tool
├── lsp/src/              # Language Server
└── vscode/src/           # VS Code extension

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

## Current Status

**79 of 112 v6 scripts pass validation (70% clean)**

Run `pnpm run debug:internals -- analyze --summary` for fresh data.

## Remaining Work

| Issue | Priority | Notes |
|-------|----------|-------|
| Multiline strings | High | Lexer doesn't support actual newlines in strings |
| Unknown type propagation | Medium | User-defined functions, chained calls |
| Switch case scoping | Low | Parsing works, variable scoping may be incorrect |
| Undefined function detection | Low | Validator doesn't detect calls to undefined functions |

### Next Steps

1. **Multiline string support** - The lexer needs to handle strings with actual newlines:
   ```pine
   string TT = "Line 1
        Line 2
        Line 3"
   ```
   This is valid in Pine Script v6 but our lexer expects strings on single lines.
   - Location: `packages/core/src/parser/lexer.ts`
   - Look for string tokenization logic (~line 361-414)
   - Currently errors with `mismatched character '\n' expecting '"'`

   **Important v6 behavior**: Each wrapped line within a multiline string adds exactly one space to the beginning of its character sequence, regardless of indentation length.

   **Deprecation warning**: This multiline string syntax is deprecated in v6. Future Pine Script versions may not support it. The recommended approach is to split strings and concatenate with `+`:
   ```pine
   string TT = "Line 1 " +
        "Line 2 " +
        "Line 3"
   ```

2. **Expand test coverage** - Add more .pine fixtures to cover edge cases

### Recently Fixed

**December 2024 Session (59% → 70% v6 clean):**
- **Generic type parsing** - `map.new<string, float>()` and `array.new<chart.point>()` now parse correctly
- **Namespace properties** - Added `strategy.*_percent`, `syminfo.country/industry/root`
- **Type coercion expansion** - `series<T>` → `T`, `series<float>` → `color`, numeric → `string`
- **Keywords as param names** - `ma(string type) => ...` now parses (keywords like `type` allowed as param names)

**Earlier Fixes:**
- **Test infrastructure complete** - 35 tests in `packages/core/test/` using .pine fixtures with `@expects` directives
- **astExtractor.ts simplified** - Consolidated function lookups, removed dead code, extracted helpers. 679→650 lines.
- **Hack audit complete** - 39 hacks identified, 26 fixed, 13 intentionally kept. All hardcoded function lists now use pine-data. See GEMINI.md for full details.
- **For loop step syntax** - `for i = 0 to 10 by 2` now parses correctly
- **String → color coercion** - `"red"`, `"#FF0000"` now accepted as color values
- **Polymorphic function params** - `nz()`, `input()` etc. no longer require specific types
- **Library/export/method support** - `import User/Lib/1 as alias`, `export func()`, `method m()` now parse correctly
- **Generic type parameters** - `array<float> arr`, `matrix<int> m` in function params now parse correctly
- **Multi-word type annotations** - `simple int`, `series float` in params now typed correctly
- **Comma operator support** - `a := 1, b := 2` and `func1(), func2()` now parse correctly
- **Array element type tracking** - `array.new<float>()` → `array<float>`, `array.get(arr)` → element type
- **Multi-line ternary expressions** - `cond ? a :\n    b` and nested ternaries across lines now parse correctly
- **`na` as function callee** - `na(x)` now correctly resolves as function call
- **Variable/function name collision** - built-in variables (hour, minute, etc.) no longer overwritten by same-name functions
- **NA type coercion** - `const<na>` assignable to any type
- **Logical operators** - `and`/`or` now accept numeric types (non-zero is truthy)

---

## Completed Projects

### Test Infrastructure (Complete)

Replaced stale `./test/` folder with .pine script-driven tests.

**Structure:**
```
packages/core/test/
├── helpers.ts          # parseTestFile(), runTest()
├── core.test.ts        # Test runner
└── fixtures/
    ├── parse-errors/   # 3 tests - expected parse failures
    ├── syntax/         # 26 tests - parser syntax coverage
    └── validation/     # 4 tests - validator error detection
```

**Total: 33 tests passing**

Test files use `@expects` directives:
```pine
// @test syntax/for-loops
// @expects parse: success
// @expects no-errors
```

See `plan/test-infrastructure-plan.md` for full details.

### astExtractor.ts Simplification (Complete)

Reduced from 679 to 650 lines:
- Removed unused `currentScopeId` field
- Consolidated function lookups (3→1)
- Extracted `createIteratorVariable()` helper
- Simplified return statements

### Hack Audit (Complete)

Deep analysis of `packages/core/src/` - 39 hacks identified across 10 files:
- **7 high-severity** (data in wrong place) → All fixed, now use pine-data
- **12 medium-severity** (duplication, special cases) → All fixed or documented
- **20 low-severity** (magic numbers, dead code) → 9 fixed, 11 intentionally kept

See GEMINI.md for the detailed hack table with all findings and resolutions.

---

## Future Work (Out of Scope)

- **Library imports for IntelliSense** - Handle `import User/Lib/1` for local development in LSP/VS Code extension (fetch/cache library definitions)

---

## Comparison Tool

Compare CLI output against TradingView's pine-lint:

```bash
node dev-tools/analysis/compare-validation-results.js
```
