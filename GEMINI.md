# pinescript-vscode-extension

This is a VS Code extension providing Pine Script v6 support (IntelliSense, validation, CLI linting).

## Architecture Principle: Data vs Syntax

**Two Categories of Language Knowledge:**

1. **Language Syntax Fundamentals** (OK to hardcode in lexer/parser):
   - Keywords (`if`, `else`, `for`, `while`, `var`, `varip`, `return`) - define grammar
   - Operators (`+`, `-`, `*`, `/`, `and`, `or`, `not`, `?:`)
   - Basic type keywords (`int`, `float`, `bool`, `string`, `color`)
   - These are stable, rarely change, and are needed for parsing before any data loads

2. **Language Library/API Data** (MUST come from `v6/` - never hardcode):
   - Function signatures (`ta.sma`, `input.int`, `plot`, `indicator`)
   - Built-in variables (`close`, `high`, `volume`, `bar_index`)
   - Constants (`color.red`, `shape.circle`, `plot.style_line`)
   - Namespace members and their types
   - Parameter requirements and return types

**Core Rule:** If it's about *what Pine Script functions/variables/constants exist*, it belongs in `v6/`.
If it's about *how the Pine Script language is structured syntactically*, it can be in `src/`.

This follows standard LSP design: the parser knows language grammar, while semantic analysis uses loaded data.

---

## Generating Data

```bash
# Generate pine-data/v6/ from raw scraped data
node scripts/generate-pine-data.js

# Output:
# - pine-data/v6/functions.ts  (457 functions)
# - pine-data/v6/variables.ts  (80 variables)
# - pine-data/v6/constants.ts  (237 constants)
# - pine-data/v6/keywords.ts   (28 keywords)
```

### Data Pipeline Files

| File | Purpose | Safe to Regenerate |
|------|---------|-------------------|
| `pine-data/raw/v6/v6-language-constructs.json` | Crawled function/variable list | Yes |
| `pine-data/raw/v6/complete-v6-details.json` | Scraped function details | Yes |
| `pine-data/v6/*.ts` | Generated TypeScript | Yes |

### Manual Customizations (preserved in generate script)

All customizations are in `scripts/generate-pine-data.js`, NOT in the output files:
- **Line 124**: `topLevelOnly` - functions that can only be called at top level
- **Line 134**: `variadic` - functions accepting variable arguments
- **Line 151**: `polymorphic` - functions with type-dependent returns
- **Line 378**: Hardcoded `syminfo.*` namespace variables

**Regenerating is safe** - all customizations are in the script.

### Function Overloads (115 functions)

The scraper now captures **multiple signatures** for overloaded functions. TradingView docs show all overloads, which are now stored in the `overloads` array:

```json
// pine-data/raw/v6/complete-v6-details.json
"line.new": {
  "overloads": [
    "line.new(first_point, second_point, ...) → series line",
    "line.new(x1, y1, x2, y2, ...) → series line"
  ],
  "parameters": [/* merged from all overloads */]
}
```

**Current Status**: ✅ **FIXED** (2025-12-23) - For overloaded functions, the validator skips positional type checking. Named arguments are still validated.

**Implementation**: `src/analyzer/builtins.ts:hasOverloads()` detects overloaded functions by checking if any parameter has `type: "unknown"`. The checker (`src/analyzer/checker.ts:750`) skips positional type checking for these functions.

---

## Commands

```bash
# Development
pnpm install          # Install dependencies
pnpm run build        # Build extension
pnpm run watch        # Watch mode

# Generation Pipeline
pnpm run crawl        # Crawl TradingView docs → v6/raw/v6-language-constructs.json
pnpm run scrape       # Scrape details → v6/raw/complete-v6-details.json
pnpm run generate     # Generate TypeScript from raw data

# Testing
pnpm test             # Run all tests
pnpm run qa:pinescript # Validate all .pine files in project

# CLI Tool
node dist/src/cli.js <file.pine>  # Our linter
pine-lint <file.pine>              # TradingView's linter (for comparison)
```

---

## CLI vs pine-lint Comparison (2025-12-23)

Ran comparison of our CLI against TradingView's `pine-lint` on 176 Pine Script files.

**Results (After All Fixes - 2025-12-23):**
| Metric | Initial | After EOF Fix | After Polymorphic | After Fresh Scrape | After Overload Skip |
|--------|---------|---------------|-------------------|-------------------|---------------------|
| Total files | 176 | 176 | 176 | 176 | 176 |
| Matches | 36 (20.5%) | 43 (24.4%) | 44 (25.0%) | 47 (26.7%) | **53 (30.1%)** |
| Mismatches | 140 (79.5%) | 133 (75.6%) | 132 (75.0%) | 129 (73.3%) | **123 (69.9%)** |

**Remaining Discrepancies (123 files out of 176, 69.9% mismatch rate):**
| Error Type | Occurrences | Notes |
|------------|-------------|-------|
| Multiline strings | 358 | TRUE positives - Pine Script doesn't support multiline strings |
| Unexpected token | 291 | EOF (175), commas (61), `:` (14), `]` (12), `=>` (11), etc. |
| Type with 'unknown' | ~100 | Operations on array elements, untracked types |
| Remaining type mismatches | ~100 | Functions without overloads, type coercion gaps |

**NOT False Positives (correctly reported errors):**
| Error Type | Files | Notes |
|------------|-------|-------|
| Multiline string errors | 47 | Pine Script doesn't support multiline strings - these are REAL errors. pine-lint stops at first error, we continue. Both agree files are invalid. |

**Error Pattern Breakdown:**
- ~~`Unexpected token: ` (blank/EOF): 302~~ ✅ **FIXED** (2025-12-23)
- `Unexpected token: \n` (newline): 200 - parser continuation issues
- `Unexpected token: ,`: 61
- `Unexpected token: =>`: 11 (some lambda cases remain)
- `Type mismatch: cannot apply X to Y and unknown`: ~100+
- `Type mismatch for argument N`: ~150+

**Comparison Tool:**
```bash
node dev-tools/analysis/compare-validation-results.js
```
Results saved to: `plan/pine-lint-vs-cli-differences/`

---

## Error Analysis & Priorities (2025-12-23)

Analysis revealed two **independent problem categories** affecting different files:

### Category A: Lexer/Parser Errors (38 files, ~178 errors remaining)

**Root Causes:**
1. ~~Lexer doesn't handle floats starting with `.`~~ ✅ **FIXED** (2025-12-23)
2. Library/export function definitions not parsed (`func(...) =>` syntax)
3. Multi-line function call continuation issues

Files with newline errors have almost no type errors (only 15 total).

### Category B: Type Inference Errors (132 files, ~413 errors)

**Root Causes:**
1. ~~Polymorphic functions returning wrong type~~ ✅ **FIXED** (2025-12-23)
2. ~~`simple<T>` types not recognized as numeric~~ ✅ **FIXED** (2025-12-23)
3. ~~Color arithmetic rejected~~ ✅ **FIXED** (2025-12-23)
4. Function overloads not supported (e.g., `line.new` has 2 signatures)
5. Array element types not tracked through symbol table

**Breakdown (after all type fixes):**
- 157 errors (38%) involve `unknown` type (mostly array element types)
- 256 errors (62%) are other type mismatches:
  - 207 argument type mismatches (mostly function overload issues)
  - ~50 remaining misc type issues

### Revised Priority List

| Priority | Fix | Impact | Effort | Status |
|----------|-----|--------|--------|--------|
| **1** | ~~Lexer: handle `.1` floats~~ | ~~200 errors~~ | Low | ✅ **FIXED** |
| **2** | ~~Polymorphic functions~~ | ~~51 errors~~ | Medium | ✅ **FIXED** |
| **3** | ~~Type coercion (`simple<T>`, color arithmetic)~~ | ~~48 errors~~ | Low | ✅ **FIXED** |
| **4** | Function overloads (e.g., `line.new`) | ~207 errors | High | |
| **5** | Array element type tracking | ~157 "unknown" errors | Medium | |
| **6** | Parser: library/export function definitions | ~100+ errors (38 files) | Medium | |

### Polymorphic Functions Implemented

Functions marked with `flags.polymorphic` in `scripts/generate-pine-data.js`:
- **"input"**: `nz`, `fixnan` - returns same type as first argument
- **"element"**: `array.get/first/last/pop/remove/shift/max/min/avg/sum/median/mode/stdev/variance`
- **"numeric"**: `math.abs/sign/max/min/avg/sum/round/floor/ceil`

### Type Coercion Fixes (2025-12-23)

Updated `src/analyzer/types.ts`:
- `isNumericType()` now includes `simple<int>`, `simple<float>`, and color types
- `areCompatibleForComparison()` now handles `series<int>` vs `float`, and `simple<T>` types
- `isBoolType()` and `isStringType()` now include `simple<T>` variants

---

## Known Issues from Test Suite (Aggregated TODOs)

These issues were identified while fixing test files. All skipped tests have `// TODO:` comments.

### Priority 1: Data Quality ~~(31 skipped tests depend on this)~~ ✅ PARTIALLY FIXED

| Issue | Impact | Status |
|-------|--------|--------|
| Empty `parameters[]` in auto-generated specs | All parameter validation fails | ✅ **FIXED** - scraper working |
| Variadic functions (math.max, str.format) | Incorrect "too many params" errors | ✅ **FIXED** - marked in metadata |
| Built-in variables not recognized | False "undefined variable" errors | ✅ **FIXED** - added to symbol table |
| Missing strategy.*, shape.*, location.* | False "unknown constant" errors | ✅ **FIXED** - no errors found (2025-12-23) |

**Reference Manual Location:** `/home/folk/Programs/trading-strategies/pinescriptv6/`
- `pinescriptv6_complete_reference.md` - 14,142 lines, complete reference
- `reference/functions/*.md` - Function docs by namespace (ta, strategy, drawing, etc.)
- `reference/constants.md` - All constants
- `reference/variables.md` - All built-in variables

### Known Parser Hacks (Need Better Solutions)

1. **LBRACKET continuation heuristic** (`src/parser/parser.ts:1247-1248`)
   - When expression parser encounters NEWLINE followed by `[`, it checks if `column > 10`
   - If true: treat as array access continuation (skip newline)
   - If false (column <= 10): treat as new statement (likely tuple like `[a, b]`)
   - **Why a hack**: Uses magic number 10 instead of proper indentation analysis
   - **Better solution**: Track whether we're in expression context vs statement context

### Priority 2: Parser Issues (10 skipped tests)

| Issue | Impact | Location | Status |
|-------|--------|----------|--------|
| Library/export declarations not parsed | Library scripts fail | `src/parser/parser.ts` | |
| Type definitions not parsed | Type scripts fail | `src/parser/parser.ts` | |
| ~~EOF handling reports phantom error on valid files~~ | ~~~429 false errors~~ | `src/parser/parser.ts` | ✅ **FIXED** |

### Priority 3: Validator Issues (9 skipped tests)

| Issue | Impact | Location |
|-------|--------|----------|
| Unknown functions not detected | `ta.nonexistent()` passes validation | `src/parser/unifiedValidator.ts` |
| Type casting `int(close)` flagged as unknown | False positives | `src/parser/unifiedValidator.ts` |
| Built-in variable shadowing not detected | `close = 5` allowed | `src/parser/unifiedValidator.ts` |
| Type mismatch detection missing | Type errors not caught | `src/parser/unifiedValidator.ts` |
| Boolean validation for `if` conditions | Non-bool in `if` allowed | `src/parser/unifiedValidator.ts` |

### Priority 4: CLI Output Issues (4 skipped tests)

| Issue | Impact | Location |
|-------|--------|----------|
| Version field missing in output | Can't detect script version | `src/cli.ts` |
| Deprecated v5 syntax detection missing | No migration warnings | `src/parser/unifiedValidator.ts` |

---

## Phase 2 Refactoring Plan (Updated)

Step 1 and 2 completed.

### Step 3: Add Unknown Function Detection

Modify `src/parser/unifiedValidator.ts`:
- Check if function exists in V6_FUNCTIONS before validating parameters
- Report "Unknown function" for functions not in any namespace

### Step 4: Fix Type Casting Recognition

Modify `src/parser/unifiedValidator.ts`:
- Recognize `int()`, `float()`, `bool()`, `string()`, `color()` as type casts
- Don't report "Unknown function" for type casts

### Step 5: Refactor Code Layer

Remove hardcoded data from `src/` files and import from `v6/` (as originally planned).

---

## Testing Strategy

1. **Unit tests** - `test/*.test.ts`
2. **Integration tests** - CLI against real .pine files
3. **Comparison tests** - Our output vs pine-lint output
4. **Regression tests** - Ensure fixes don't break existing validation

### Future Testing Enhancements (Option A)

To achieve higher validation confidence:

1. **Property-based testing** with [fast-check](https://github.com/dubzzz/fast-check)
   - Generate random Pine Script code
   - Verify our validator matches pine-lint behavior

2. **Mutation testing** with [Stryker](https://stryker-mutator.io/)
   - Ensure test suite catches logic errors
   - Target: >80% mutation score on validator code

3. **Fuzzing** - Generate random/malformed Pine scripts
   - Test parser robustness
   - Find edge cases in validation logic
