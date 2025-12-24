import { describe, it, expect, beforeEach } from "vitest";
import {
	PineLanguageService,
	DiagnosticSeverity,
	CompletionItemKind,
	SymbolKind,
} from "../src";

describe("PineLanguageService", () => {
	let service: PineLanguageService;

	beforeEach(() => {
		service = new PineLanguageService();
	});

	describe("Document Management", () => {
		it("should open and close documents", () => {
			service.openDocument("test.pine", "x = 1", 1);
			expect(service.getDocument("test.pine")).toBeDefined();

			service.closeDocument("test.pine");
			expect(service.getDocument("test.pine")).toBeUndefined();
		});

		it("should update documents", () => {
			service.openDocument("test.pine", "x = 1", 1);
			service.updateDocument("test.pine", "x = 2", 2);

			const doc = service.getDocument("test.pine");
			expect(doc?.content).toBe("x = 2");
			expect(doc?.version).toBe(2);
		});
	});

	describe("Completions", () => {
		it("should return namespace completions after dot", () => {
			service.openDocument("test.pine", "x = ta.", 1);
			const completions = service.getCompletions("test.pine", {
				line: 0,
				character: 7,
			});

			expect(completions.length).toBeGreaterThan(0);
			expect(completions.some((c) => c.label === "sma")).toBe(true);
			expect(completions.some((c) => c.label === "ema")).toBe(true);
		});

		it("should return all completions at empty position", () => {
			service.openDocument("test.pine", "", 1);
			const completions = service.getCompletions("test.pine", {
				line: 0,
				character: 0,
			});

			// Should have keywords
			expect(completions.some((c) => c.label === "if")).toBe(true);
			expect(completions.some((c) => c.label === "for")).toBe(true);

			// Should have namespaces
			expect(completions.some((c) => c.label === "ta")).toBe(true);
			expect(completions.some((c) => c.label === "math")).toBe(true);

			// Should have global functions
			expect(completions.some((c) => c.label === "plot")).toBe(true);

			// Should have standalone variables
			expect(completions.some((c) => c.label === "close")).toBe(true);
		});

		it("should return parameter completions inside function call", () => {
			service.openDocument("test.pine", 'x = input.int(', 1);
			const completions = service.getCompletions("test.pine", {
				line: 0,
				character: 14,
			});

			// Should have parameter names
			expect(completions.some((c) => c.label === "defval")).toBe(true);
			expect(completions.some((c) => c.label === "title")).toBe(true);
		});
	});

	describe("Hover", () => {
		it("should return hover for function", () => {
			service.openDocument("test.pine", "x = ta.sma(close, 14)", 1);
			const hover = service.getHover("test.pine", { line: 0, character: 7 });

			expect(hover).not.toBeNull();
			expect(hover?.contents).toContain("sma");
		});

		it("should return hover for variable", () => {
			service.openDocument("test.pine", "x = close", 1);
			const hover = service.getHover("test.pine", { line: 0, character: 5 });

			expect(hover).not.toBeNull();
			expect(hover?.contents).toContain("close");
		});

		it("should return null for unknown symbol", () => {
			service.openDocument("test.pine", "x = unknownThing", 1);
			const hover = service.getHover("test.pine", { line: 0, character: 5 });

			expect(hover).toBeNull();
		});
	});

	describe("Signature Help", () => {
		it("should return signature for function call", () => {
			service.openDocument("test.pine", "x = ta.sma(", 1);
			const sig = service.getSignatureHelp("test.pine", {
				line: 0,
				character: 11,
			});

			expect(sig).not.toBeNull();
			expect(sig?.signatures.length).toBeGreaterThan(0);
			expect(sig?.signatures[0].label).toContain("sma");
		});

		it("should track active parameter", () => {
			service.openDocument("test.pine", "x = ta.sma(close, ", 1);
			const sig = service.getSignatureHelp("test.pine", {
				line: 0,
				character: 18,
			});

			expect(sig).not.toBeNull();
			expect(sig?.activeParameter).toBe(1);
		});
	});

	describe("Diagnostics", () => {
		it("should return parse errors", () => {
			service.openDocument("test.pine", "x = ", 1);
			const diagnostics = service.getDiagnostics("test.pine");

			expect(diagnostics.length).toBeGreaterThan(0);
			expect(diagnostics[0].severity).toBe(DiagnosticSeverity.Error);
		});

		it("should warn about missing version header", () => {
			service.openDocument("test.pine", "x = 1", 1);
			const diagnostics = service.getDiagnostics("test.pine");

			expect(
				diagnostics.some((d) => d.message.includes("//@version=6")),
			).toBe(true);
		});

		it("should not warn if version header present", () => {
			service.openDocument("test.pine", "//@version=6\nx = 1", 1);
			const diagnostics = service.getDiagnostics("test.pine");

			expect(
				diagnostics.some((d) => d.message.includes("//@version=6")),
			).toBe(false);
		});

		it("should detect plotshape shape= error", () => {
			service.openDocument(
				"test.pine",
				"//@version=6\nplotshape(true, shape=shape.circle)",
				1,
			);
			const diagnostics = service.getDiagnostics("test.pine");

			expect(
				diagnostics.some((d) => d.message.includes('Did you mean "style"')),
			).toBe(true);
		});
	});

	describe("Formatting", () => {
		it("should trim trailing whitespace", () => {
			const result = PineLanguageService.formatCode("x = 1   \ny = 2  ");
			expect(result).toBe("x = 1\ny = 2\n");
		});

		it("should collapse multiple blank lines", () => {
			const result = PineLanguageService.formatCode("x = 1\n\n\n\ny = 2");
			expect(result).toBe("x = 1\n\ny = 2\n");
		});

		it("should ensure final newline", () => {
			const result = PineLanguageService.formatCode("x = 1");
			expect(result).toBe("x = 1\n");
		});
	});

	describe("Find References", () => {
		it("should find all variable references", () => {
			service.openDocument(
				"test.pine",
				`//@version=6
myVar = 42
x = myVar + 1
y = myVar * 2
`,
				1,
			);
			const refs = service.getReferences("test.pine", {
				line: 1,
				character: 0,
			});

			// Should find definition + 2 usages = 3 references
			expect(refs.length).toBe(3);
		});

		it("should find function references", () => {
			service.openDocument(
				"test.pine",
				`//@version=6
myFunc() =>
    42

x = myFunc()
y = myFunc()
`,
				1,
			);
			const refs = service.getReferences("test.pine", {
				line: 1,
				character: 0,
			});

			// Definition + 2 calls = 3 references
			expect(refs.length).toBe(3);
		});

		it("should exclude declaration when requested", () => {
			service.openDocument(
				"test.pine",
				`//@version=6
myVar = 42
x = myVar + 1
`,
				1,
			);
			const refs = service.getReferences(
				"test.pine",
				{ line: 1, character: 0 },
				{ includeDeclaration: false },
			);

			// Should find only 1 usage (not the declaration)
			expect(refs.length).toBe(1);
		});

		it("should find references in function bodies", () => {
			service.openDocument(
				"test.pine",
				`//@version=6
globalVar = 10

myFunc() =>
    x = globalVar
    globalVar + 1
`,
				1,
			);
			const refs = service.getReferences("test.pine", {
				line: 1,
				character: 0,
			});

			// Definition + 2 usages in function = 3 references
			expect(refs.length).toBe(3);
		});

		it("should return empty array for unknown symbols", () => {
			service.openDocument("test.pine", "//@version=6\nx = 1", 1);
			const refs = service.getReferences("test.pine", {
				line: 1,
				character: 5, // position with no symbol
			});

			expect(refs.length).toBe(0);
		});
	});

	describe("Go to Definition", () => {
		it("should find variable definition", () => {
			service.openDocument(
				"test.pine",
				`//@version=6
myVar = 42
x = myVar + 1
`,
				1,
			);
			// Position on "myVar" in the usage (line 2, character 4)
			const result = service.getDefinition("test.pine", {
				line: 2,
				character: 4,
			});

			expect(result).not.toBeNull();
			expect(result?.isBuiltin).toBeFalsy();
			expect(result?.location).toBeDefined();
			expect(result?.location?.range.start.line).toBe(1); // Definition on line 1 (0-indexed)
		});

		it("should find function definition", () => {
			service.openDocument(
				"test.pine",
				`//@version=6
myFunc() =>
    42

x = myFunc()
`,
				1,
			);
			// Position on "myFunc" in the call (line 4)
			const result = service.getDefinition("test.pine", {
				line: 4,
				character: 5,
			});

			expect(result).not.toBeNull();
			expect(result?.isBuiltin).toBeFalsy();
			expect(result?.location?.range.start.line).toBe(1);
		});

		it("should identify built-in symbols", () => {
			service.openDocument("test.pine", "//@version=6\nx = close", 1);
			const result = service.getDefinition("test.pine", {
				line: 1,
				character: 5,
			});

			expect(result).not.toBeNull();
			expect(result?.isBuiltin).toBe(true);
			expect(result?.symbolInfo).toBeDefined();
		});

		it("should identify built-in functions", () => {
			service.openDocument("test.pine", "//@version=6\nx = ta.sma(close, 14)", 1);
			const result = service.getDefinition("test.pine", {
				line: 1,
				character: 7, // on "sma"
			});

			// ta.sma is a built-in
			expect(result).not.toBeNull();
			expect(result?.isBuiltin).toBe(true);
		});

		it("should return null for unknown symbols", () => {
			service.openDocument("test.pine", "//@version=6\nx = unknownVar", 1);
			const result = service.getDefinition("test.pine", {
				line: 1,
				character: 6,
			});

			expect(result).toBeNull();
		});

		it("should find for loop iterator definition", () => {
			service.openDocument(
				"test.pine",
				`//@version=6
for i = 0 to 10
    x = i
`,
				1,
			);
			// Position on "i" in the usage (line 2, character 8)
			const result = service.getDefinition("test.pine", {
				line: 2,
				character: 8,
			});

			expect(result).not.toBeNull();
			expect(result?.location?.range.start.line).toBe(1); // for loop line
		});
	});

	describe("Document Symbols", () => {
		it("should return function symbols", () => {
			service.openDocument(
				"test.pine",
				`//@version=6
myFunc(a, b) =>
    a + b
`,
				1,
			);
			const symbols = service.getDocumentSymbols("test.pine");

			expect(symbols.length).toBeGreaterThan(0);
			const func = symbols.find((s) => s.name.startsWith("myFunc"));
			expect(func).toBeDefined();
			expect(func?.kind).toBe(SymbolKind.Function);
			expect(func?.name).toBe("myFunc(a, b)");
		});

		it("should return variable symbols", () => {
			service.openDocument(
				"test.pine",
				`//@version=6
x = 1
var y = 2
`,
				1,
			);
			const symbols = service.getDocumentSymbols("test.pine");

			const x = symbols.find((s) => s.name === "x");
			const y = symbols.find((s) => s.name === "y");
			expect(x).toBeDefined();
			expect(x?.kind).toBe(SymbolKind.Variable);
			expect(y).toBeDefined();
			expect(y?.kind).toBe(SymbolKind.Variable);
		});

		it("should return constant symbols", () => {
			service.openDocument(
				"test.pine",
				`//@version=6
const PI = 3.14159
`,
				1,
			);
			const symbols = service.getDocumentSymbols("test.pine");

			const pi = symbols.find((s) => s.name === "PI");
			expect(pi).toBeDefined();
			expect(pi?.kind).toBe(SymbolKind.Constant);
		});

		it("should return import symbols", () => {
			service.openDocument(
				"test.pine",
				`//@version=6
import TradingView/ta/5 as ta
`,
				1,
			);
			const symbols = service.getDocumentSymbols("test.pine");

			const imp = symbols.find((s) => s.name === "ta");
			expect(imp).toBeDefined();
			expect(imp?.kind).toBe(SymbolKind.Module);
		});

		it("should return correct ranges for functions", () => {
			service.openDocument(
				"test.pine",
				`//@version=6
myFunc() =>
    x = 1
    x + 1
`,
				1,
			);
			const symbols = service.getDocumentSymbols("test.pine");

			const func = symbols.find((s) => s.name.startsWith("myFunc"));
			expect(func).toBeDefined();
			// Function starts at line 1 (0-indexed)
			expect(func?.range.start.line).toBe(1);
			// Selection range should cover just the name
			expect(func?.selectionRange.start.line).toBe(1);
		});

		it("should return empty array for empty document", () => {
			service.openDocument("test.pine", "", 1);
			const symbols = service.getDocumentSymbols("test.pine");
			expect(symbols).toEqual([]);
		});

		it("should return empty array for unknown document", () => {
			const symbols = service.getDocumentSymbols("unknown.pine");
			expect(symbols).toEqual([]);
		});
	});

	describe("Static Helpers", () => {
		it("should look up symbol info", () => {
			const info = PineLanguageService.getSymbolInfo("ta.sma");
			expect(info).not.toBeNull();
			expect(info?.kind).toBe("function");
			expect(info?.name).toBe("ta.sma");
		});

		it("should return null for unknown symbol", () => {
			const info = PineLanguageService.getSymbolInfo("unknownSymbol");
			expect(info).toBeNull();
		});

		it("should list all namespaces", () => {
			const namespaces = PineLanguageService.getAllNamespaces();
			expect(namespaces).toContain("ta");
			expect(namespaces).toContain("math");
			expect(namespaces).toContain("str");
		});

		it("should list functions by namespace", () => {
			const functions = PineLanguageService.getAllFunctions("ta");
			expect(functions).toContain("ta.sma");
			expect(functions).toContain("ta.ema");
		});
	});
});
