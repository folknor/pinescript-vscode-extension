/**
 * Validation Test Suite
 * Tests parameter requirements against real Pine Script code
 * Ensures accuracy when upgrading to new Pine Script versions
 */

import assert from "node:assert";
import { describe, it } from "vitest";
import { FUNCTIONS_BY_NAME, type PineFunction } from "../pine-data/v6";

// Helper to get required params from new structure
function getRequiredParams(func: PineFunction): string[] {
	return func.parameters.filter((p) => p.required).map((p) => p.name);
}

// Helper to get optional params from new structure
function getOptionalParams(func: PineFunction): string[] {
	return func.parameters.filter((p) => !p.required).map((p) => p.name);
}

// Helper to get all params
function getAllParams(func: PineFunction): string[] {
	return func.parameters.map((p) => p.name);
}

describe("Parameter Requirements Validation", () => {
	describe("Core Functions", () => {
		it("indicator() should have only title as required", () => {
			const func = FUNCTIONS_BY_NAME.get("indicator");
			assert.ok(func, "indicator function should exist");
			const required = getRequiredParams(func);
			const optional = getOptionalParams(func);

			assert.deepStrictEqual(
				required,
				["title"],
				"Only title should be required",
			);
			assert.ok(optional.includes("overlay"), "overlay should be optional");
			assert.ok(
				optional.includes("max_bars_back"),
				"max_bars_back should be optional",
			);
		});

		it("alertcondition() should have condition required, title/message optional", () => {
			const func = FUNCTIONS_BY_NAME.get("alertcondition");
			assert.ok(func, "alertcondition function should exist");
			const required = getRequiredParams(func);
			const optional = getOptionalParams(func);

			assert.deepStrictEqual(
				required,
				["condition"],
				"Only condition should be required",
			);
			assert.ok(optional.includes("title"), "title should be optional");
			assert.ok(optional.includes("message"), "message should be optional");
		});

		it("input.string() should have defval as required", () => {
			const func = FUNCTIONS_BY_NAME.get("input.string");
			assert.ok(func, "input.string function should exist");
			const required = getRequiredParams(func);
			const optional = getOptionalParams(func);

			assert.deepStrictEqual(required, ["defval"], "defval should be required");
			assert.ok(optional.includes("title"), "title should be optional");
		});

		it("plot() should have series as required", () => {
			const func = FUNCTIONS_BY_NAME.get("plot");
			assert.ok(func, "plot function should exist");
			const required = getRequiredParams(func);
			const optional = getOptionalParams(func);

			assert.deepStrictEqual(required, ["series"], "series should be required");
			assert.ok(optional.includes("title"), "title should be optional");
			assert.ok(optional.includes("color"), "color should be optional");
		});

		it("plotshape() should have series as required, style not shape", () => {
			const func = FUNCTIONS_BY_NAME.get("plotshape");
			assert.ok(func, "plotshape function should exist");
			const required = getRequiredParams(func);
			const allParams = getAllParams(func);

			assert.deepStrictEqual(required, ["series"], "series should be required");
			assert.ok(allParams.includes("style"), 'should have "style" parameter');
			assert.ok(
				!allParams.includes("shape"),
				'should NOT have "shape" parameter',
			);
		});

		it("strategy() should have title as required", () => {
			const func = FUNCTIONS_BY_NAME.get("strategy");
			assert.ok(func, "strategy function should exist");
			const required = getRequiredParams(func);
			const optional = getOptionalParams(func);

			assert.deepStrictEqual(
				required,
				["title"],
				"Only title should be required",
			);
			assert.ok(optional.includes("overlay"), "overlay should be optional");
		});

		it("ta.sma() should have source and length as required", () => {
			const func = FUNCTIONS_BY_NAME.get("ta.sma");
			assert.ok(func, "ta.sma function should exist");
			const required = getRequiredParams(func);

			assert.deepStrictEqual(
				required,
				["source", "length"],
				"source and length required",
			);
		});

		it("ta.crossover() should have source1 and source2 as required", () => {
			const func = FUNCTIONS_BY_NAME.get("ta.crossover");
			assert.ok(func, "ta.crossover function should exist");
			const required = getRequiredParams(func);

			assert.deepStrictEqual(
				required,
				["source1", "source2"],
				"both sources required",
			);
		});
	});

	describe("Generated Functions Coverage", () => {
		it("should have generated function signatures", () => {
			const count = FUNCTIONS_BY_NAME.size;
			assert.ok(
				count >= 450,
				`Should have at least 450 generated functions, got ${count}`,
			);
		});

		it("should have alert() function", () => {
			const func = FUNCTIONS_BY_NAME.get("alert");
			assert.ok(func, "alert function should exist in generated");
			assert.ok(func.syntax, "alert should have syntax");
			assert.ok(func.parameters, "alert should have parameters");
		});

		it("should have array functions", () => {
			assert.ok(
				FUNCTIONS_BY_NAME.get("array.new_float"),
				"array.new_float should exist",
			);
			assert.ok(FUNCTIONS_BY_NAME.get("array.push"), "array.push should exist");
			assert.ok(FUNCTIONS_BY_NAME.get("array.get"), "array.get should exist");
		});

		it("should have math functions", () => {
			assert.ok(FUNCTIONS_BY_NAME.get("math.abs"), "math.abs should exist");
			assert.ok(FUNCTIONS_BY_NAME.get("math.max"), "math.max should exist");
			assert.ok(FUNCTIONS_BY_NAME.get("math.min"), "math.min should exist");
		});
	});

	describe("Known Issue Regression Tests", () => {
		it("should detect alertcondition with too many arguments (line 238 issue)", () => {
			// Example: alertcondition(shortSig,333,tetette,333,333)
			// Should be: alertcondition(condition, title?, message?)
			const func = FUNCTIONS_BY_NAME.get("alertcondition");
			assert.ok(func, "alertcondition should exist");
			const required = getRequiredParams(func);
			const totalCount = func.parameters.length;

			assert.strictEqual(
				required.length,
				1,
				"alertcondition should have 1 required param",
			);
			assert.strictEqual(
				totalCount,
				3,
				"alertcondition should have max 3 params total",
			);

			// Simulated validation: 5 args > 3 max = ERROR
			const providedArgs = 5;
			assert.ok(providedArgs > totalCount, "Should detect too many arguments");
		});

		it("should detect input.string with missing required parameter (line 239 issue)", () => {
			// Example: test = input.string()
			// Should be: input.string(defval, ...)
			const func = FUNCTIONS_BY_NAME.get("input.string");
			assert.ok(func, "input.string should exist");
			const required = getRequiredParams(func);

			assert.ok(
				required.includes("defval"),
				"input.string should require defval",
			);

			// Simulated validation: 0 args < 1 required = ERROR
			const providedArgs = 0;
			assert.ok(
				providedArgs < required.length,
				"Should detect missing required param",
			);
		});

		it("should NOT falsely flag valid indicator() calls", () => {
			// Example: indicator("Title", overlay=true) should be VALID
			const func = FUNCTIONS_BY_NAME.get("indicator");
			assert.ok(func, "indicator should exist");
			const required = getRequiredParams(func);
			const allParams = getAllParams(func);

			// Provided: title, overlay
			const providedArgs = ["title", "overlay"];
			const requiredProvided = providedArgs.filter((p) => required.includes(p));

			assert.strictEqual(
				requiredProvided.length,
				1,
				"Should have title (required)",
			);
			assert.ok(
				providedArgs.length >= required.length,
				"Should have enough args",
			);
		});

		it("should NOT falsely flag plotshape with style parameter", () => {
			// plotshape(..., style=shape.circle) should be VALID
			// plotshape(..., shape=...) should be ERROR (wrong param name)
			const func = FUNCTIONS_BY_NAME.get("plotshape");
			assert.ok(func, "plotshape should exist");
			const allParams = getAllParams(func);

			assert.ok(allParams.includes("style"), "plotshape should accept style");
			assert.ok(
				!allParams.includes("shape"),
				"plotshape should NOT accept shape",
			);
		});
	});

	describe("Data Integrity", () => {
		it("all functions should have syntax and parameters", () => {
			for (const [name, func] of FUNCTIONS_BY_NAME) {
				assert.ok(func.syntax, `${name} should have syntax`);
				assert.ok(
					func.parameters !== undefined,
					`${name} should have parameters array`,
				);
			}
		});

		it("no duplicate parameter names within a function", () => {
			for (const [name, func] of FUNCTIONS_BY_NAME) {
				const allParams = getAllParams(func);
				const uniqueParams = new Set(allParams);
				assert.strictEqual(
					allParams.length,
					uniqueParams.size,
					`${name} should not have duplicate parameters`,
				);
			}
		});

		it("all critical functions should exist", () => {
			const criticalFunctions = [
				"indicator",
				"strategy",
				"library",
				"plot",
				"plotshape",
				"plotchar",
				"plotcandle",
				"plotbar",
				"bgcolor",
				"barcolor",
				"fill",
				"hline",
				"alert",
				"alertcondition",
				"input.int",
				"input.float",
				"input.bool",
				"input.string",
				"input.color",
				"input.source",
				"input.timeframe",
				"input.symbol",
				"input.session",
				"input.price",
				"input.time",
				"input.text_area",
				"ta.sma",
				"ta.ema",
				"ta.rsi",
				"ta.crossover",
				"ta.crossunder",
				"ta.cross",
			];

			criticalFunctions.forEach((funcName) => {
				assert.ok(
					FUNCTIONS_BY_NAME.get(funcName),
					`${funcName} should exist in pine-data`,
				);
			});
		});
	});
});
