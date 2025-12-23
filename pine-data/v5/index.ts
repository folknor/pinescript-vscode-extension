/**
 * Pine Script V5 Language Data
 *
 * TODO: Implement v5-specific data
 * For now, this re-exports v6 data as a fallback
 *
 * Differences from v6:
 * - Some functions have different signatures
 * - Some constants/variables may be missing
 * - Different deprecation status for some constructs
 */

// Re-export v6 as fallback for now
export * from "../v6";

// Override version identifier
import { PineV6 } from "../v6";

export const PineV5 = {
	...PineV6,
	version: "v5" as const,
};

export default PineV5;
