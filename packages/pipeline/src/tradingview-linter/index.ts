/**
 * Pine-lint: PineScript syntax checker using TradingView's API
 *
 * This is a TypeScript reimplementation of the Python pine-lint tool.
 * It validates Pine Script code by sending it to TradingView's public
 * translation endpoint and returns detailed error/type information.
 */

import type {
	PineLintOptions,
	PineLintResponse,
	PineLintResultPayload,
} from "./types.ts";

export * from "./types.ts";

const DEFAULT_OPTIONS: Required<PineLintOptions> = {
	username: "admin",
	fullResponse: false,
	timeout: 10000,
};

/**
 * PineScript syntax checker using TradingView's API.
 */
export class PineLintChecker {
	private readonly apiUrl: string;
	private readonly headers: Record<string, string>;
	private readonly options: Required<PineLintOptions>;

	constructor(options: PineLintOptions = {}) {
		this.options = { ...DEFAULT_OPTIONS, ...options };

		const baseUrl =
			"https://pine-facade.tradingview.com/pine-facade/translate_light";
		this.apiUrl = `${baseUrl}?user_name=${this.options.username}&v=3`;

		this.headers = {
			Referer: "https://www.tradingview.com/",
			"User-Agent":
				"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) " +
				"AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
			DNT: "1",
		};
	}

	/**
	 * Check PineScript code syntax.
	 *
	 * @param pineCode - PineScript source code to validate
	 * @returns Promise resolving to validation results
	 */
	async checkSyntax(pineCode: string): Promise<PineLintResponse> {
		try {
			const formData = new FormData();
			formData.append("source", pineCode);

			const controller = new AbortController();
			const timeoutId = setTimeout(
				() => controller.abort(),
				this.options.timeout,
			);

			try {
				const response = await fetch(this.apiUrl, {
					method: "POST",
					headers: this.headers,
					body: formData,
					signal: controller.signal,
				});

				const result = (await response.json()) as PineLintResponse;

				// Remove scopes if not requested (rarely used, verbose)
				if (!this.options.fullResponse && result.result) {
					delete (result.result as PineLintResultPayload & { scopes?: unknown })
						.scopes;
				}

				return result;
			} finally {
				clearTimeout(timeoutId);
			}
		} catch (error) {
			if (error instanceof Error) {
				if (error.name === "AbortError") {
					return {
						success: false,
						error: `Request timed out after ${this.options.timeout}ms`,
					};
				}
				return {
					success: false,
					error: `Network request failed: ${error.message}`,
				};
			}
			return {
				success: false,
				error: "Unknown error occurred",
			};
		}
	}
}

/**
 * Convenience function to check Pine Script code.
 *
 * @param pineCode - PineScript source code to validate
 * @param options - Optional configuration
 * @returns Promise resolving to validation results
 */
export async function checkPineScript(
	pineCode: string,
	options?: PineLintOptions,
): Promise<PineLintResponse> {
	const checker = new PineLintChecker(options);
	return checker.checkSyntax(pineCode);
}

/**
 * Check a Pine Script file.
 *
 * @param filePath - Path to the .pine file
 * @param options - Optional configuration
 * @returns Promise resolving to validation results
 */
export async function checkPineScriptFile(
	filePath: string,
	options?: PineLintOptions,
): Promise<PineLintResponse> {
	const fs = await import("node:fs/promises");

	try {
		const pineCode = await fs.readFile(filePath, "utf-8");
		return checkPineScript(pineCode, options);
	} catch (error) {
		if (error instanceof Error) {
			return {
				success: false,
				error: `Unable to read file ${filePath}: ${error.message}`,
			};
		}
		return {
			success: false,
			error: `Unable to read file ${filePath}`,
		};
	}
}
