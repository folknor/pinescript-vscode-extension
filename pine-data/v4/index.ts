/**
 * Pine Script V4 Language Data
 *
 * TODO: Implement v4-specific data
 * For now, this re-exports v6 data as a fallback
 *
 * Differences from v6:
 * - input() function instead of input.int(), input.float(), etc.
 * - Different security() signature
 * - Different study() vs indicator()
 * - Many functions have different signatures
 */

// Re-export v6 as fallback for now
export * from "../v6";

// Override version identifier
import { PineV6 } from "../v6";

export const PineV4 = {
	...PineV6,
	version: "v4" as const,
};

export default PineV4;
