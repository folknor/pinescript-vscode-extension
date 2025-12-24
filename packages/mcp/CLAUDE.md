# packages/mcp

Model Context Protocol (MCP) server for Pine Script v6. Enables AI assistants (Claude, Cursor, etc.) to validate Pine Script code and access language documentation.

## Purpose

Expose Pine Script language intelligence as MCP tools and resources that AI assistants can use to:
- Validate Pine Script code and get error messages
- Look up function documentation
- Get completions for code
- Format code

---

## Dependencies

### Internal (imports allowed)
```typescript
import { PineLanguageService } from "../../language-service/src";
import type {
  CompletionItem,
  Diagnostic,
  SymbolInfo,
} from "../../language-service/src/types";

// For direct data access (lookup without document context)
import {
  FUNCTIONS_BY_NAME,
  VARIABLES_BY_NAME,
  CONSTANTS_BY_NAME,
  PineV6
} from "../../pine-data/v6";
```

### External (npm - already in package.json)
```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       MCP Server                                │
├─────────────────────────────────────────────────────────────────┤
│ Transport: stdio                                                │
├─────────────────────────────────────────────────────────────────┤
│ Tools (AI can call these):                                      │
│                                                                 │
│   pine_validate                                                 │
│     Validate Pine Script code and return diagnostics            │
│     Input: { code: string }                                     │
│     Output: { errors: [], warnings: [], success: boolean }      │
│                                                                 │
│   pine_lookup                                                   │
│     Look up documentation for a symbol                          │
│     Input: { symbol: string }                                   │
│     Output: { found: boolean, syntax?, description?, ... }      │
│                                                                 │
│   pine_list_functions                                           │
│     List available functions, optionally filtered by namespace  │
│     Input: { namespace?: string }                               │
│     Output: { functions: string[] }                             │
│                                                                 │
│   pine_complete                                                 │
│     Get completions at a position in code                       │
│     Input: { code: string, line: number, character: number }    │
│     Output: { completions: CompletionItem[] }                   │
│                                                                 │
│   pine_format                                                   │
│     Format Pine Script code                                     │
│     Input: { code: string }                                     │
│     Output: { formatted: string }                               │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Resources (AI can read these):                                  │
│                                                                 │
│   pine://reference/functions                                    │
│     List of all functions with brief descriptions               │
│                                                                 │
│   pine://reference/variables                                    │
│     List of all built-in variables                              │
│                                                                 │
│   pine://reference/namespaces                                   │
│     List of all namespaces (ta, math, str, etc.)                │
│                                                                 │
│   pine://docs/{symbol}                                          │
│     Full documentation for a specific symbol                    │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Delegates to: PineLanguageService + pine-data                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
packages/mcp/
├── src/
│   ├── index.ts           # Re-exports
│   ├── server.ts          # MCP server setup
│   ├── tools/
│   │   ├── validate.ts    # pine_validate tool
│   │   ├── lookup.ts      # pine_lookup tool
│   │   ├── list.ts        # pine_list_functions tool
│   │   ├── complete.ts    # pine_complete tool
│   │   └── format.ts      # pine_format tool
│   └── resources/
│       ├── reference.ts   # pine://reference/* handlers
│       └── docs.ts        # pine://docs/* handlers
├── bin/
│   └── pine-mcp.ts        # CLI entry point
└── test/
    └── mcp.test.ts
```

---

## Implementation Guide

### 1. Server Setup (src/server.ts)

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { PineLanguageService } from "../../language-service/src";

import { registerValidateTool } from "./tools/validate";
import { registerLookupTool } from "./tools/lookup";
import { registerListFunctionsTool } from "./tools/list";
import { registerCompleteTool } from "./tools/complete";
import { registerFormatTool } from "./tools/format";
import { registerReferenceResources } from "./resources/reference";
import { registerDocsResources } from "./resources/docs";

async function main() {
  const server = new McpServer({
    name: "pine-script",
    version: "1.0.0",
  });

  const languageService = new PineLanguageService();

  // Register tools
  registerValidateTool(server, languageService);
  registerLookupTool(server, languageService);
  registerListFunctionsTool(server, languageService);
  registerCompleteTool(server, languageService);
  registerFormatTool(server, languageService);

  // Register resources
  registerReferenceResources(server);
  registerDocsResources(server, languageService);

  // Start server with stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("Pine Script MCP server started");
}

main().catch(console.error);
```

### 2. Validate Tool (src/tools/validate.ts)

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PineLanguageService } from "../../../language-service/src";

const ValidateInputSchema = z.object({
  code: z.string().describe("Pine Script code to validate"),
});

export function registerValidateTool(
  server: McpServer,
  service: PineLanguageService
) {
  server.tool(
    "pine_validate",
    "Validate Pine Script code and return any errors or warnings",
    ValidateInputSchema,
    async ({ code }) => {
      // Create a temporary document
      const uri = "mcp://temp/validate.pine";
      service.openDocument(uri, code, 1);

      try {
        const diagnostics = service.getDiagnostics(uri);

        const errors = diagnostics.filter(d => d.severity === 1);
        const warnings = diagnostics.filter(d => d.severity === 2);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                success: errors.length === 0,
                errors: errors.map(e => ({
                  line: e.range.start.line + 1,
                  column: e.range.start.character + 1,
                  message: e.message,
                })),
                warnings: warnings.map(w => ({
                  line: w.range.start.line + 1,
                  column: w.range.start.character + 1,
                  message: w.message,
                })),
              }, null, 2),
            },
          ],
        };
      } finally {
        service.closeDocument(uri);
      }
    }
  );
}
```

### 3. Lookup Tool (src/tools/lookup.ts)

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PineLanguageService } from "../../../language-service/src";

const LookupInputSchema = z.object({
  symbol: z.string().describe("Symbol name to look up (e.g., 'ta.sma', 'close', 'plot')"),
});

export function registerLookupTool(
  server: McpServer,
  service: PineLanguageService
) {
  server.tool(
    "pine_lookup",
    "Look up documentation for a Pine Script symbol (function, variable, or constant)",
    LookupInputSchema,
    async ({ symbol }) => {
      const info = PineLanguageService.getSymbolInfo(symbol);

      if (!info) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                found: false,
                message: `Symbol '${symbol}' not found`,
              }),
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              found: true,
              name: info.name,
              kind: info.kind,
              syntax: info.syntax,
              description: info.description,
              returns: info.returns,
              type: info.type,
              parameters: info.parameters,
              namespace: info.namespace,
              deprecated: info.deprecated,
            }, null, 2),
          },
        ],
      };
    }
  );
}
```

### 4. List Functions Tool (src/tools/list.ts)

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PineV6 } from "../../../pine-data/v6";

const ListInputSchema = z.object({
  namespace: z.string().optional().describe("Optional namespace filter (e.g., 'ta', 'math', 'str')"),
});

export function registerListFunctionsTool(server: McpServer) {
  server.tool(
    "pine_list_functions",
    "List available Pine Script functions, optionally filtered by namespace",
    ListInputSchema,
    async ({ namespace }) => {
      let functions: string[];

      if (namespace) {
        const members = PineV6.getNamespaceMembers(namespace);
        functions = members
          .filter(m => m.type === "function")
          .map(m => m.name);
      } else {
        functions = Array.from(PineV6.functions.keys());
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              count: functions.length,
              functions: functions.sort(),
            }, null, 2),
          },
        ],
      };
    }
  );
}
```

### 5. Reference Resource (src/resources/reference.ts)

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { PineV6, FUNCTIONS_BY_NAME, VARIABLES_BY_NAME } from "../../../pine-data/v6";

export function registerReferenceResources(server: McpServer) {
  // List all functions
  server.resource(
    "pine://reference/functions",
    "List of all Pine Script functions",
    async () => {
      const functions = Array.from(FUNCTIONS_BY_NAME.values())
        .map(f => ({
          name: f.name,
          returns: f.returns,
          description: f.description.substring(0, 100) + "...",
        }));

      return {
        contents: [
          {
            uri: "pine://reference/functions",
            mimeType: "application/json",
            text: JSON.stringify(functions, null, 2),
          },
        ],
      };
    }
  );

  // List all variables
  server.resource(
    "pine://reference/variables",
    "List of all Pine Script built-in variables",
    async () => {
      const variables = Array.from(VARIABLES_BY_NAME.values())
        .map(v => ({
          name: v.name,
          type: v.type,
          description: v.description,
        }));

      return {
        contents: [
          {
            uri: "pine://reference/variables",
            mimeType: "application/json",
            text: JSON.stringify(variables, null, 2),
          },
        ],
      };
    }
  );

  // List all namespaces
  server.resource(
    "pine://reference/namespaces",
    "List of all Pine Script namespaces",
    async () => {
      const namespaces = PineV6.getAllNamespaces();

      return {
        contents: [
          {
            uri: "pine://reference/namespaces",
            mimeType: "application/json",
            text: JSON.stringify(namespaces, null, 2),
          },
        ],
      };
    }
  );
}
```

### 6. CLI Entry Point (bin/pine-mcp.ts)

```typescript
#!/usr/bin/env node

import "../src/server";
```

---

## Claude Desktop Configuration

After building, users can add this to their Claude Desktop config:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "pine-script": {
      "command": "node",
      "args": ["/path/to/dist/packages/mcp/bin/pine-mcp.js"]
    }
  }
}
```

---

## Tool Schemas (for reference)

### pine_validate
```json
{
  "name": "pine_validate",
  "description": "Validate Pine Script code and return any errors or warnings",
  "inputSchema": {
    "type": "object",
    "properties": {
      "code": {
        "type": "string",
        "description": "Pine Script code to validate"
      }
    },
    "required": ["code"]
  }
}
```

### pine_lookup
```json
{
  "name": "pine_lookup",
  "description": "Look up documentation for a Pine Script symbol",
  "inputSchema": {
    "type": "object",
    "properties": {
      "symbol": {
        "type": "string",
        "description": "Symbol name (e.g., 'ta.sma', 'close', 'plot')"
      }
    },
    "required": ["symbol"]
  }
}
```

### pine_list_functions
```json
{
  "name": "pine_list_functions",
  "description": "List available Pine Script functions",
  "inputSchema": {
    "type": "object",
    "properties": {
      "namespace": {
        "type": "string",
        "description": "Optional namespace filter (e.g., 'ta', 'math')"
      }
    }
  }
}
```

### pine_complete
```json
{
  "name": "pine_complete",
  "description": "Get code completions at a position",
  "inputSchema": {
    "type": "object",
    "properties": {
      "code": { "type": "string" },
      "line": { "type": "number", "description": "0-indexed line number" },
      "character": { "type": "number", "description": "0-indexed character offset" }
    },
    "required": ["code", "line", "character"]
  }
}
```

### pine_format
```json
{
  "name": "pine_format",
  "description": "Format Pine Script code",
  "inputSchema": {
    "type": "object",
    "properties": {
      "code": { "type": "string" }
    },
    "required": ["code"]
  }
}
```

---

## Testing

### Manual Testing with MCP Inspector

```bash
# Install MCP inspector
npx @anthropic/mcp-inspector

# Run your server
node dist/packages/mcp/bin/pine-mcp.js
```

### Unit Tests

```typescript
// test/mcp.test.ts
import { describe, it, expect } from 'vitest';

describe('MCP Server', () => {
  it('should export server module', async () => {
    const mod = await import('../src/server');
    expect(mod).toBeDefined();
  });
});
```

---

## Package.json Updates Needed

Add to root `package.json`:

```json
{
  "scripts": {
    "mcp:start": "node dist/packages/mcp/bin/pine-mcp.js"
  },
  "bin": {
    "pine-validate": "./dist/packages/cli/src/cli.js",
    "pine-lsp": "./dist/packages/lsp/bin/pine-lsp.js",
    "pine-mcp": "./dist/packages/mcp/bin/pine-mcp.js"
  }
}
```

---

## Success Criteria

- [ ] Server starts and responds to tool listing
- [ ] `pine_validate` returns accurate error messages
- [ ] `pine_lookup` returns function/variable documentation
- [ ] `pine_list_functions` returns function names
- [ ] Resources return reference documentation
- [ ] Works with Claude Desktop
- [ ] Works with MCP Inspector for testing
- [ ] All logic delegated to language-service (no direct parser calls except in language-service)

---

## Commands

```bash
# Build
pnpm run build

# Start server (for testing)
node dist/packages/mcp/bin/pine-mcp.js

# Test with MCP Inspector
npx @anthropic/mcp-inspector node dist/packages/mcp/bin/pine-mcp.js
```
