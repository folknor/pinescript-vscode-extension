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

**42 of 49 v6 scripts parse cleanly (86%)**

Run `pnpm run debug:corpus --summary` for fresh stats.

Breakdown:
- 42 scripts: No parse errors
- 2 scripts: Actual syntax errors in source (not parser bugs)
  - `tdf-20251102.pine` - Missing commas between function arguments
  - `854667873-nsdt-2.pine` - Corrupted comment (line break without `//`)
- 5 scripts: Analysis timeout (very large files)

## Remaining Work

| Issue | Priority | Notes |
|-------|----------|-------|
| Unknown type propagation | Low | User-defined functions, chained calls |

### Known Limitations

- **Legacy color constants** - v4/v5 scripts use bare `red`, `green`, etc. In v6, must use `color.red`. Not fixing since these are pre-v6 scripts.
- **Invalid parameter names** - Some scripts use deprecated params like `type` (input) and `when` (strategy). These are v5 params not valid in v6.
- **Nested inline switches with tuples** - Deeply nested inline switches with tuple assignments inside case bodies are not yet fully supported. Basic inline switch with tuples works.

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

### Recently Fixed

**December 2024 Session (59% → 86% v6 clean):**
- **Line continuation in function args** - `func(arg =\n value)` pattern now supported
- **Nested switch/for/tuple parsing** - Fixed tuple declarations being misparsed as array subscripts in nested blocks
- **UDT annotations** - `TypeName varName = expr` pattern now recognized as type annotation
- **Missing namespace properties** - Added `timeframe.main_period/isticks`, `session.isfirstbar*`, `syminfo.country/industry/root`, `strategy.*_percent`
- **Array type coercion** - `array<type>` (unresolved element) now assignable to `array<int/float>`
- **Enum/type declarations** - User-defined enums now registered in symbol table (`SCALE.ATR` works)
- **Multiline strings** - Lexer now allows newlines in string literals (deprecated v6 feature)
- **Multiline arrays** - Parser tracks bracket depth to allow `[a,\n b,\n c]` syntax
- **Multiline expressions** - Line continuation after operators (`x !=\n y` now parses)
- **Mixed comma expressions** - `func(), x := na` now parses correctly
- **Generic type parsing** - `map.new<string, float>()` and `array.new<chart.point>()` now parse correctly
- **Namespace properties** - Added `strategy.*_percent`, `syminfo.country/industry/root`
- **Type coercion expansion** - `series<T>` → `T`, `series<float>` → `color`, numeric → `string`
- **Keywords as param names** - `ma(string type) => ...` now parses (keywords like `type` allowed as param names)

**Earlier Fixes:**
- **Test infrastructure complete** - 35 tests in `packages/core/test/` using .pine fixtures with `@expects` directives
- **astExtractor.ts simplified** - Consolidated function lookups, removed dead code, extracted helpers. 679→650 lines.
- **Hack audit complete** - 39 hacks identified, 26 fixed, 13 intentionally kept. All hardcoded function lists now use pine-data. See CLAUDE.md for full details.
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

### Tests Needed for Regression Prevention

The following tests should be added to prevent regression of fixes since commit 8c7cbbb:

| Commit | Fix | Test Coverage |
|--------|-----|---------------|
| 32248b7 | Unknown type propagation | ✅ `syntax/user-functions.pine` |
| 61474e2 | Comma-separated declarations | ✅ `syntax/comma-separated-declarations.pine` |
| 9492b43 | NA type coercion | ✅ `validation/na-coercion.pine` |
| c16cd17 | Numeric types in `and`/`or` | ✅ `validation/logical-operators.pine` |
| e7cd1df | Generic type parsing | ✅ `syntax/generics.pine` |
| 23200fb | Type coercion expansion | ✅ `validation/type-coercion.pine` |
| 14808bb | Keywords as param names | ✅ `syntax/keywords-as-params.pine` |
| e02a4b1 | Multiline strings/expressions | ✅ `syntax/multiline.pine` |
| f3da491 | Enum/type declarations | ✅ `syntax/enums.pine` |
| 3d18c49 | Array type coercion | ✅ `validation/type-coercion.pine` |

All fixes since commit 8c7cbbb now have regression tests

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
    ├── syntax/         # 40 tests - parser syntax coverage
    └── validation/     # 8 tests - validator error detection
```

**Total: 51 tests passing**

Test files use `@expects` directives:
```pine
// @test syntax/for-loops
// @expects parse: success
// @expects no-errors
```

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

See CLAUDE.md for the detailed hack table with all findings and resolutions.

---

## Future Work (Out of Scope)

- **Library imports for IntelliSense** - Handle `import User/Lib/1` for local development in LSP/VS Code extension (fetch/cache library definitions)

- Should language-configuration.json be autogenerated?

---

## Comparison Tool

Compare CLI output against TradingView's pine-lint:

```bash
node dev-tools/analysis/compare-validation-results.js
```
