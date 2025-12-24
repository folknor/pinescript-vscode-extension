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
```

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
- `int` ↔ `float` bidirectional coercion
- Color type arithmetic

---

## Remaining Work

| Issue | Count | Priority |
|-------|-------|----------|
| Unexpected token errors | 87 | Medium |
| Unknown type propagation | ~50 | Medium |
| Series/simple coercion | ~30 | Low |
| Invalid parameter validation | 14 | Low |

*Note: "String parsing" errors (358) are a red herring - these are v4/v5 scripts with syntax issues.*

### Recently Fixed

- **For loop step syntax** - `for i = 0 to 10 by 2` now parses correctly
- **String → color coercion** - `"red"`, `"#FF0000"` now accepted as color values
- **Polymorphic function params** - `nz()`, `input()` etc. no longer require specific types
- **Library/export/method support** - `import User/Lib/1 as alias`, `export func()`, `method m()` now parse correctly
- **Generic type parameters** - `array<float> arr`, `matrix<int> m` in function params now parse correctly
- **Multi-word type annotations** - `simple int`, `series float` in params now typed correctly
- **Comma operator support** - `a := 1, b := 2` and `func1(), func2()` now parse correctly
- **Array element type tracking** - `array.new<float>()` → `array<float>`, `array.get(arr)` → element type
- **Multi-line switch case bodies** - `condition => \n    stmt1\n    resultExpr` now parses (scope WIP)

---

## Future Work (Out of Scope)

- **Library imports for IntelliSense** - Handle `import User/Lib/1` for local development in LSP/VS Code extension (fetch/cache library definitions)

---

## Comparison Tool

Compare CLI output against TradingView's pine-lint:

```bash
node dev-tools/analysis/compare-validation-results.js
```
