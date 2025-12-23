/**
 * Pine Script Language Data
 *
 * Unified entry point for all Pine Script language data across versions.
 * Supports v4, v5, and v6 with version-specific data and helpers.
 *
 * Usage:
 *   import { PineV6, getVersionData } from './pine-data';
 *   const func = PineV6.getFunction('ta.sma');
 *
 * Or for version-agnostic code:
 *   const data = getVersionData('v6');
 *   const func = data.getFunction('ta.sma');
 */

// Re-export schema types
export * from "./schema/types";

// Re-export v6 data (primary version)
export * from "./v6";
export { PineV6 } from "./v6";

// Version type
export type PineVersion = "v4" | "v5" | "v6";

// Version-specific imports (lazy loaded)
import type { PineFunction, PineVariable, PineConstant } from "./schema/types";

/**
 * Version data interface - what each version module exports
 */
export interface VersionData {
	version: PineVersion;
	functions: Map<string, PineFunction>;
	variables: Map<string, PineVariable>;
	constants: Map<string, PineConstant>;
	keywords: Set<string>;
	getFunction: (name: string) => PineFunction | undefined;
	getVariable: (name: string) => PineVariable | undefined;
	getConstant: (name: string) => PineConstant | undefined;
	isFunction: (name: string) => boolean;
	isVariable: (name: string) => boolean;
	isConstant: (name: string) => boolean;
	isKeyword: (name: string) => boolean;
}

/**
 * Get version-specific data
 * Currently only v6 is fully implemented
 */
export function getVersionData(version: PineVersion): VersionData {
	switch (version) {
		case "v6":
			// eslint-disable-next-line @typescript-eslint/no-require-imports
			return require("./v6").PineV6;
		case "v5":
			// TODO: Implement v5 data
			console.warn("Pine Script v5 data not yet implemented, falling back to v6");
			// eslint-disable-next-line @typescript-eslint/no-require-imports
			return require("./v6").PineV6;
		case "v4":
			// TODO: Implement v4 data
			console.warn("Pine Script v4 data not yet implemented, falling back to v6");
			// eslint-disable-next-line @typescript-eslint/no-require-imports
			return require("./v6").PineV6;
		default:
			throw new Error(`Unknown Pine Script version: ${version}`);
	}
}

/**
 * Detect Pine Script version from source code
 */
export function detectVersion(source: string): PineVersion {
	// Look for //@version= directive
	const versionMatch = source.match(/\/\/@version\s*=\s*(\d+)/);
	if (versionMatch) {
		const ver = parseInt(versionMatch[1], 10);
		if (ver === 6) return "v6";
		if (ver === 5) return "v5";
		if (ver === 4) return "v4";
	}
	// Default to v6 (latest)
	return "v6";
}

/**
 * Supported versions
 */
export const SUPPORTED_VERSIONS: PineVersion[] = ["v6", "v5", "v4"];

/**
 * Latest version
 */
export const LATEST_VERSION: PineVersion = "v6";
