# Pine Script v6 Extension - Development Guide

## Project Architecture

This is a VS Code extension providing Pine Script v6 support (IntelliSense, validation, CLI linting).

### Directory Structure

```
pine-data/                   # NEW DATA LAYER (LSP-optimized, version-aware)
├── schema/
│   └── types.ts             # Unified type definitions for all versions
├── v6/                      # Pine Script v6 data
│   ├── functions.ts         # 457 functions with full parameter info
│   ├── variables.ts         # 80 built-in variables with types
│   ├── constants.ts         # 237 constants in namespaces
│   ├── keywords.ts          # 28 language keywords
│   └── index.ts             # Single entry point with PineV6 convenience object
├── v5/
│   └── index.ts             # Placeholder (falls back to v6)
├── v4/
│   └── index.ts             # Placeholder (falls back to v6)
├── raw/v6/                  # Raw scraped data from TradingView
│   ├── v6-language-constructs.json  # 866 discovered constructs
│   └── complete-v6-details.json     # Detailed function specs
└── index.ts                 # Main entry point with version detection

scripts/                     # GENERATION PIPELINE
├── crawl.js                 # Puppeteer: discovers language constructs
├── scrape.js                # Puppeteer: fetches detailed specs per function
└── generate-pine-data.js    # Generates pine-data/ from raw scraped data

src/                         # CODE LAYER (uses pine-data/ imports)
├── parser/
│   ├── lexer.ts
│   ├── parser.ts
│   ├── ast.ts
│   ├── symbolTable.ts       # Uses FUNCTIONS_BY_NAME, VARIABLES_BY_NAME
│   └── unifiedValidator.ts  # Uses FUNCTIONS_BY_NAME, CONSTANTS_BY_NAME
├── completions.ts           # Uses pine-data/v6 exports
├── signatureHelp.ts         # Uses FUNCTIONS_BY_NAME
├── extension.ts
└── cli.ts
```

### Architecture Principle: Data vs Syntax

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

### New pine-data/ Architecture (2025-12-23)

The `pine-data/` folder provides a clean, LSP-optimized data layer with version support:

**Key Features:**
- **O(1) lookups**: All data in `Map<string, T>` for instant access
- **Type-safe**: Full TypeScript interfaces for all constructs
- **Version-aware**: Supports v4/v5/v6 with fallback mechanism
- **Unified schema**: Single source of truth for type definitions

**Usage Examples:**
```typescript
// Import from pine-data/v6
import {
  PineV6,
  FUNCTIONS_BY_NAME,
  VARIABLES_BY_NAME,
  CONSTANTS_BY_NAME,
} from "../pine-data/v6";

// Fast lookups
const smaFunc = FUNCTIONS_BY_NAME.get("ta.sma");
const closeVar = VARIABLES_BY_NAME.get("close");

// Convenience methods
const func = PineV6.getFunction("ta.sma");
const isBuiltin = PineV6.isVariable("close");
const namespaces = PineV6.getAllNamespaces();

// Get all members of a namespace
const { functions, variables, constants } = PineV6.getNamespaceMembers("ta");
```

**Type Definitions (`pine-data/schema/types.ts`):**
```typescript
interface PineFunction {
  name: string;
  namespace?: string;
  syntax: string;
  description: string;
  parameters: PineParameter[];
  returns: string;
  flags?: FunctionFlags;
}

interface PineParameter {
  name: string;
  type: string;
  description: string;
  required: boolean;
  default?: string;
}

interface PineVariable {
  name: string;
  namespace?: string;
  type: PineType;
  qualifier: "const" | "input" | "simple" | "series";
  description: string;
}

interface PineConstant {
  name: string;
  namespace: string;
  shortName: string;
  type: PineType;
}
```

**Generating Data:**
```bash
# Generate pine-data/v6/ from raw scraped data
node scripts/generate-pine-data.js

# Output:
# - pine-data/v6/functions.ts  (457 functions)
# - pine-data/v6/variables.ts  (80 variables)
# - pine-data/v6/constants.ts  (237 constants)
# - pine-data/v6/keywords.ts   (28 keywords)
```

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

## Current Refactoring Plan

**Goal**: Make our CLI produce results at least as good as TradingView's `pine-lint`.

### Phase 1: Fix Data Layer (`v6/`)

Update `scripts/generate.js` to produce missing exports:

1. **V6_NAMESPACES** - Organized by namespace:
   ```typescript
   export const V6_NAMESPACES = {
     ta: { functions: {...}, variables: {...}, constants: {...} },
     math: { functions: {...}, ... },
     // ...
   }
   ```

2. **V6_KEYWORDS** - All Pine Script keywords:
   ```typescript
   export const V6_KEYWORDS = ["if", "else", "for", "while", ...];
   ```

3. **V6_TYPE_NAMES** - All type names:
   ```typescript
   export const V6_TYPE_NAMES = ["int", "float", "bool", "string", "color", ...];
   ```

4. **V6_BUILTIN_VARIABLES** - With types:
   ```typescript
   export const V6_BUILTIN_VARIABLES = {
     close: "series<float>",
     open: "series<float>",
     bar_index: "series<int>",
     // ...
   }
   ```

5. **NAMESPACE_PROPERTIES** - Property type mappings:
   ```typescript
   export const NAMESPACE_PROPERTIES = {
     "plot.style_line": "plot_style",
     "color.red": "color",
     "barstate.isfirst": "series<bool>",
     // ...
   }
   ```

6. **FUNCTION_METADATA** - Function flags:
   ```typescript
   export const FUNCTION_METADATA = {
     indicator: { topLevelOnly: true },
     plot: { topLevelOnly: true },
     "ta.sma": { seriesReturning: true },
     // ...
   }
   ```

### Phase 2: Refactor Code Layer (`src/`)

Remove hardcoded **library/API data** from these files and import from `v6/`:

| File | Keep (Syntax) | Remove → Import from v6/ |
|------|---------------|--------------------------|
| `lexer.ts` | Keywords, operators | - |
| `parser.ts` | Grammar rules | - |
| `symbolTable.ts` | - | Built-in vars, namespaces |
| `completions.ts` | - | V6_KEYWORDS, V6_NAMESPACES, function data |
| `unifiedValidator.ts` | - | namespaceProperties, knownReturnTypes, topLevelOnlyFunctions |
| `semanticAnalyzer.ts` | - | seriesFunctions, commonVariables |
| `astExtractor.ts` | - | INPUT_FUNCTIONS, SERIES_FUNCTIONS |
| `signatureHelp.ts` | - | V6_NAMESPACES |

**Note:** `lexer.ts` can keep keywords hardcoded since they define syntax and rarely change.

### Phase 3: Validate Against pine-lint

1. Compare our CLI output against pre-saved pine-lint results in `./plan/pine-lint-results/*.json`
2. Our linter should catch everything pine-lint catches
3. Fix any remaining gaps
4. Goal: Zero false negatives (we catch at least what TradingView catches)

---

## Data Quality Status

| Data Type | Count | Source | Status |
|-----------|-------|--------|--------|
| Functions | 457 | pine-data/v6/functions.ts | ✅ Complete with parameters & return types |
| Variables | 80 | pine-data/v6/variables.ts | ✅ Complete with types |
| Constants | 237 | pine-data/v6/constants.ts | ✅ Complete |
| Keywords | 28 | pine-data/v6/keywords.ts | ✅ **FIXED** - exported with categories |
| Return types | 330 | pine-data/v6/functions.ts | ✅ **FIXED** - from scraped data |

### Scraper Fixes (Completed 2025-12-23)

The scraper (`scripts/scrape.js`) has been fixed and optimized:

**Problems Fixed:**
1. Wrong URL pattern - was using `.html` files, now uses hash routing (`#fun_ta.sma`)
2. Empty parameters - now properly extracts from TradingView's SPA
3. Optional parameter detection - now detects "The default is X" patterns

**Performance Optimizations:**
- Single browser instance (was launching 457 separate browsers)
- Hash navigation instead of full page loads
- Reduced delays: 100ms per function (was 1000ms), 500ms between batches (was 3000ms)
- **Result:** ~3.3 minutes for 457 functions (was 10-15+ minutes)

**Scrape Results:**
- 457 functions scraped successfully
- 0 failures (100% success rate)
- ~137 functions/min sustained rate

---

## CLI vs pine-lint Comparison (2025-12-23)

Ran comparison of our CLI against TradingView's `pine-lint` on 176 Pine Script files.

**Results (After All Fixes - 2025-12-23):**
| Metric | Initial | After Built-ins | After Namespace Props |
|--------|---------|-----------------|----------------------|
| Total files | 176 | 176 | 176 |
| Matches | 36 (20.5%) | 39 (22.2%) | 42 (23.9%) |
| Mismatches | 140 (79.5%) | 137 (77.8%) | 134 (76.1%) |

**Fixed Issues (2025-12-23):**
- ✅ `Undefined variable 'close'` - FIXED (27 standalone built-ins added)
- ✅ `Undefined variable 'barstate'` - FIXED (15 variable namespaces added)
- ✅ `Unknown property 'labeldown' on namespace 'shape'` - FIXED (237 constant properties imported)
- ✅ `Unknown property 'tickerid' on namespace 'syminfo'` - FIXED (namespace variables added)
- ✅ `Unknown property 'isconfirmed' on namespace 'barstate'` - FIXED
- ✅ All `Unknown property` errors - FIXED

**Fixed Issues (2025-12-23 Session 2):**
- ✅ UDF return type inference - Fixed local variables in scope during return type inference
- ✅ Non-tuple `request.security` return types - Now infers type from 3rd argument expression
- ✅ String concatenation with `+` operator - Added to type system
- ✅ `simple<T>` to `series<T>` type coercion - Added to type assignability
- ✅ `input` types (e.g., `input bool`) - Mapped to base types
- ✅ Namespace properties for v5 files - Now checked for all versions, not just v6
- ✅ `str.tostring` format parameter - **FIXED IN SCRAPER** (`scripts/scrape.js`)
  - Scraper now parses ALL overloads to capture additional optional parameters
  - Regenerated `pine-data/v6/functions.ts` from raw data

**Remaining False Positives (133 files):**
| Error Type | Count | Notes |
|------------|-------|-------|
| Type mismatch (unknown type) | ~45 | Type inference still returning "unknown" in some cases |
| Cannot assign X to Y | ~10 | False positive type errors |
| Undefined local variables | ~8 | Scope tracking issues |

**Comparison Tool:**
```bash
node dev-tools/analysis/compare-validation-results.js
```
Results saved to: `plan/pine-lint-vs-cli-differences/`

**Next Priority:** Fix type inference to reduce "unknown" type cascading errors.

---

## Known Issues from Test Suite (Aggregated TODOs)

These issues were identified while fixing test files. All skipped tests have `// TODO:` comments.

### Priority 1: Data Quality ~~(31 skipped tests depend on this)~~ ✅ PARTIALLY FIXED

| Issue | Impact | Status |
|-------|--------|--------|
| Empty `parameters[]` in auto-generated specs | All parameter validation fails | ✅ **FIXED** - scraper working |
| Variadic functions (math.max, str.format) | Incorrect "too many params" errors | ✅ **FIXED** - marked in metadata |
| Built-in variables not recognized | False "undefined variable" errors | ❌ **NOT FIXED** - validator issue |
| Missing strategy.*, shape.*, location.* | False "unknown constant" errors | ❌ Needs investigation |

**Reference Manual Location:** `/home/folk/Programs/trading-strategies/pinescriptv6/`
- `pinescriptv6_complete_reference.md` - 14,142 lines, complete reference
- `reference/functions/*.md` - Function docs by namespace (ta, strategy, drawing, etc.)
- `reference/constants.md` - All constants
- `reference/variables.md` - All built-in variables

### Priority 2: Parser Issues (10 skipped tests)

| Issue | Impact | Location |
|-------|--------|----------|
| Parser errors logged to console but not exposed via API | Can't report syntax errors in CLI | `src/parser/parser.ts` |
| Generics like `array.new<float>()` not parsed | False syntax errors | `src/parser/parser.ts` |
| Switch statements not parsed | False syntax errors | `src/parser/parser.ts` |
| For loops not parsed correctly | False syntax errors | `src/parser/parser.ts` |
| Library/export declarations not parsed | Library scripts fail | `src/parser/parser.ts` |
| User-defined functions not parsed | UDF scripts fail | `src/parser/parser.ts` |
| Type definitions not parsed | Type scripts fail | `src/parser/parser.ts` |

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

### Step 1: Fix Data Quality ✅ COMPLETE

The scraper has been fixed and 457 functions scraped successfully. See "Scraper Fixes" section above.

### Step 2: Fix Built-in Variables Recognition ✅ COMPLETE

**Fixed (2025-12-23):**
- Updated `scripts/generate.js` to load built-in variables from `v6-language-constructs.json`
- 27 standalone variables now in `V6_BUILTIN_VARIABLES` with proper types
- 15 variable namespaces added to `NAMESPACE_NAMES`
- `symbolTable.ts` already imports and uses `V6_BUILTIN_VARIABLES`

**Result:** Reduced false positives from 140 to 137 files (fixed `close`, `barstate`, etc.).

### Step 2.5: Fix Namespace Properties ✅ COMPLETE

**Fixed (2025-12-23):**
- Imported `NAMESPACE_PROPERTIES` from `v6/v6-namespace-properties.ts` into `unifiedValidator.ts`
- Added `simple<...>` types to `PineType` in `typeSystem.ts`
- Added namespace variables (syminfo.*, barstate.*, timeframe.*, chart.*, session.*, strategy.*)

**Result:** Reduced false positives from 137 to 134 files. All `Unknown property` errors eliminated.

### Step 3: Expose Parser Errors via API

Modify `src/parser/parser.ts`:
- Store errors in array instead of console.log
- Add `getParserErrors()` method
- Include in CLI output

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
