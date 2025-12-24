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
- `int` ↔ `float` bidirectional coercion
- Color type arithmetic

---

## Remaining Work

| Issue | Count | Priority |
|-------|-------|----------|
| Unknown type propagation | ~50 | Medium |
| Series/simple coercion | ~30 | Low |
| Invalid parameter validation | 14 | Low |

*Note: "String parsing" errors (358) are a red herring - these are v4/v5 scripts with syntax issues.*

### Next Steps

1. **Re-run comparison analysis** - Recent fixes (ternary, enum, `na`, `hour`) need fresh measurement. Run `node dev-tools/analysis/compare-validation-results.js` then `pnpm run debug:internals -- analyze --summary`.

2. **Remaining unknown type propagation** - Patterns to investigate:
   - Built-ins being shadowed or not recognized
   - Return types not inferred correctly
   - User-defined function return types

3. **Newline "Unexpected token" errors** - 87 showed in last analysis. If ternary fix worked, should be mostly gone after re-running comparison.

4. **Series/simple coercion** - Mechanical fix in `types.ts`, lower priority.

5. **Switch case scoping** - Parsing works but variable scoping inside switch cases may be incorrect.

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
- **Multi-line ternary expressions** - `cond ? a :\n    b` and nested ternaries across lines now parse correctly
- **Enum/type declaration bodies** - `enum Foo\n    Bar = "value"` body parsing fixed
- **`na` as function callee** - `na(x)` now correctly resolves as function call (was parsed as Literal)
- **Variable/function name collision** - built-in variables (hour, minute, etc.) no longer overwritten by same-name functions

---

## Larger Projects

### 1. Hack Audit (Do First)

Deep analysis of `packages/core/src/` to identify and document code that "works but shouldn't be there." Goal is to understand technical debt before building new infrastructure.

**What constitutes a hack:**
1. **Hardcoded special cases** - `if (name === "na")` checks for specific built-ins that should be handled generically
2. **Type assertions / `as any`** - Casting away type safety to make something work
3. **Commented workarounds** - Code with `// TODO`, `// HACK`, `// FIXME`, or comments explaining why something is "temporary"
4. **Data that should be in pine-data/** - Hardcoded lists of functions/variables/behaviors that belong in the generated data layer
5. **Duplicated logic** - Same check done in multiple places instead of centralized
6. **Order-dependent initialization** - Code that only works because things happen to run in a certain order
7. **Silent failures** - `catch {}` blocks, `|| undefined`, or similar patterns that swallow errors
8. **Magic numbers/strings** - Unexplained literals embedded in logic

**Why first:** Understanding what's hacky vs intentional before writing tests.

**Important:** Hacks aren't inherently bad. Some are elegant solutions to genuinely awkward problems. The goal is to *identify and document* them, not blindly remove them. For each hack we decide: fix, keep as-is, or keep with documentation.

### Hack Audit Progress

**Files to audit in `packages/core/src/`:**

| File | Status | Hacks Found |
|------|--------|-------------|
| `parser/lexer.ts` | **Done** | 4 |
| `parser/parser.ts` | **Done** | 7 |
| `parser/ast.ts` | **Done** | 0 |
| `parser/astExtractor.ts` | **Done** | 7 |
| `parser/semanticAnalyzer.ts` | **Done** | 4 |
| `analyzer/checker.ts` | **Done** | 7 |
| `analyzer/builtins.ts` | **Done** | 6 |
| `analyzer/symbols.ts` | **Done** | 1 |
| `analyzer/types.ts` | **Done** | 3 |
| `common/errors.ts` | **Done** | 0 |

**Audit process per file:**
1. Read entire file
2. Search for each hack category (special cases, `as any`, TODO/HACK comments, etc.)
3. Document each hack with: location, category, description, severity (low/medium/high)
4. Decide action: fix now, fix later, keep (acceptable), or keep + document why

**Discovered hacks:**

| Location | Category | Description | Severity | Action |
|----------|----------|-------------|----------|--------|
| `lexer.ts:103-122` | Dead code | `_BUILTIN_FUNCTIONS` defined but never used | Low | Fix - delete |
| `lexer.ts:271-276` | Silent failure | `!` without `=` produces no token | Medium | Investigate |
| `lexer.ts:452-460,478-486` | Duplicated logic | Scientific notation scanning duplicated | Low | Keep |
| `lexer.ts:161` | Magic number | Tab = 4 spaces hardcoded | Low | Keep |
| `parser.ts:1952-1955` | Dead code | Duplicate `switch` keyword check | Low | Fix - delete |
| `parser.ts:1719` | Magic number | `column > 10` tuple vs array detection | Medium | Investigate |
| `parser.ts:1252-1253` | TODO comment | BlockExpression incomplete | Medium | Document |
| `parser.ts:222-250,288-314` | Duplicated logic | Generic type parsing duplicated | Medium | Fix - extract |
| `parser.ts:201-217,268-282` | Duplicated logic | Type keyword list duplicated | Low | Fix - use static |
| `parser.ts:multiple` | Silent failures | `catch (_e)` for backtracking | Low | Keep |
| `parser.ts:1924-1934` | Special case | `na` as Identifier | Low | Keep - documented |
| `astExtractor.ts:91-104` | Data in wrong place | `INPUT_FUNCTIONS` hardcoded | High | Move to pine-data |
| `astExtractor.ts:107-159` | Data in wrong place | `SERIES_FUNCTIONS` hardcoded | High | Move to pine-data |
| `astExtractor.ts:162-180` | Data in wrong place | `QUALIFIER_PRESERVING` hardcoded | High | Move to pine-data |
| `astExtractor.ts:183-197` | Data in wrong place | `BUILTIN_SERIES` hardcoded | High | Move to pine-data |
| `astExtractor.ts:536-547` | Data in wrong place | `arrayElementFuncs` hardcoded | Medium | Move to pine-data |
| `astExtractor.ts:324` | Magic number | `+ 20` approx end column | Low | Keep |
| `astExtractor.ts:multiple` | Magic strings | Default type fallbacks | Low | Keep |
| `semanticAnalyzer.ts:314-366` | Data in wrong place | `seriesFunctions` hardcoded | Medium | Move to pine-data |
| `semanticAnalyzer.ts:446-491` | Data in wrong place | `commonVariables` hardcoded | Low | Keep - heuristic |
| `semanticAnalyzer.ts:298-299` | TODO comment | "simplified check" incomplete | Low | Document |
| `semanticAnalyzer.ts:432` | Magic number | `0, 0` for missing location | Low | Keep |
| `checker.ts:1066-1070` | Dead code | `DEBUG_NA = false` left in | Low | Fix - remove |
| `checker.ts:355-412` | Data in wrong place | Param name→type heuristics | High | Move to pine-data |
| `checker.ts:108-154,258-308` | Duplicated logic | TupleDeclaration duplicated | Medium | Fix - extract |
| `checker.ts:941-970` | Special case | plotshape/indicator validations | Medium | Move to pine-data |
| `checker.ts:1076-1098` | Special case | array.new/request.security | Medium | Keep |
| `checker.ts:761` | Silent failure | Complex callee ignored | Low | Document |
| `builtins.ts:19-33` | Data in wrong place | `TOP_LEVEL_ONLY_FUNCTIONS` | Medium | Move to pine-data |
| `builtins.ts:36-39` | Data in wrong place | `DEPRECATED_V5_CONSTANTS` | Low | Move to pine-data |
| `builtins.ts:67-159` | Data in wrong place | Namespace properties hardcoded | High | Scrape |
| `builtins.ts:163-180` | Data in wrong place | `KNOWN_NAMESPACES` hardcoded | Medium | Derive |
| `builtins.ts:197-294` | Duplicated logic | Type mapping duplicated | Low | Extract |
| `builtins.ts:319-320` | Silent failure | `catch (_e) { return null }` | Low | Document |
| `types.ts:345-421` | Data in wrong place | `builtinTypes` redundant | High | Delete |
| `types.ts:113-173` | Duplicated logic | Coercion rules repetitive | Medium | Keep |

### 2. Test Infrastructure Overhaul

Replace existing test infrastructure with .pine script-driven tests. Each behavioral branch in the parser/analyzer should have a corresponding .pine file that exercises it.

- Delete existing abstract unit tests
- Create .pine files that test actual Pine Script behavior
- Run via vitest during `pnpm test`
- Coverage goal: every behavioral code path has a real Pine Script justification

**Depends on:** Hack audit completion (or at least identification of worst offenders)

---

## Future Work (Out of Scope)

- **Library imports for IntelliSense** - Handle `import User/Lib/1` for local development in LSP/VS Code extension (fetch/cache library definitions)

---

## Comparison Tool

Compare CLI output against TradingView's pine-lint:

```bash
node dev-tools/analysis/compare-validation-results.js
```
