// Pine Script Type System
// Defines type representations and type checking utilities

export type PineType =
	| "int"
	| "float"
	| "bool"
	| "string"
	| "color"
	| "series<int>"
	| "series<float>"
	| "series<bool>"
	| "series<string>"
	| "series<color>"
	| "simple<int>"
	| "simple<float>"
	| "simple<bool>"
	| "simple<string>"
	| "simple<color>"
	| "array<int>"
	| "array<float>"
	| "array<bool>"
	| "array<string>"
	| "array<color>"
	| "matrix<int>"
	| "matrix<float>"
	| "line"
	| "label"
	| "box"
	| "table"
	| "void"
	| "na"
	| "unknown";

export interface TypeInfo {
	type: PineType;
	isOptional?: boolean;
	defaultValue?: unknown;
}

export namespace TypeChecker {
	// Normalize type format: "series int" -> "series<int>", "simple float" -> "simple<float>"
	function normalizeType(type: string): PineType {
		// Handle union types by taking the first option (e.g., "int/float" -> "int")
		if (type.includes("/")) {
			const parts = type.split("/");
			// For "series int/float", we want "series int" (first variant)
			type = type.replace(/\/\w+/, "");
		}

		// Handle space-separated qualifier types: "series int" -> "series<int>"
		const match = type.match(/^(series|simple|const|input)\s+(\w+)$/);
		if (match) {
			const [, qualifier, baseType] = match;
			if (qualifier === "series") {
				return `series<${baseType}>` as PineType;
			} else if (qualifier === "simple") {
				return `simple<${baseType}>` as PineType;
			}
			// const and input types are treated as the base type
			return baseType as PineType;
		}

		return type as PineType;
	}

	// Check if a "to" type is a union type that accepts either variant
	function isUnionTypeMatch(from: string, to: string): boolean {
		if (!to.includes("/")) return false;

		// Extract qualifier and union: "series int/float" -> ["series", "int/float"]
		const qualifierMatch = to.match(/^(series|simple|const|input)\s+(.+)$/);
		const fromQualifierMatch = from.match(/^(series|simple|const|input)\s+(.+)$/);

		if (qualifierMatch) {
			const [, toQualifier, toUnion] = qualifierMatch;
			const toTypes = toUnion.split("/");

			// Get base type from 'from'
			let fromBase = from;
			let fromQualifier = "";
			if (fromQualifierMatch) {
				fromQualifier = fromQualifierMatch[1];
				fromBase = fromQualifierMatch[2];
			} else if (from.includes("<")) {
				// Handle our format: "series<int>" -> qualifier="series", base="int"
				const bracketMatch = from.match(/^(\w+)<(\w+)>$/);
				if (bracketMatch) {
					fromQualifier = bracketMatch[1];
					fromBase = bracketMatch[2];
				}
			}

			// Check if fromBase matches any of the union types
			if (toTypes.includes(fromBase)) {
				// Qualifiers must be compatible (series accepts simple, simple accepts const, etc.)
				if (toQualifier === "series") return true; // series accepts everything
				if (toQualifier === "simple" && (fromQualifier === "simple" || fromQualifier === "const" || fromQualifier === "")) return true;
				if (toQualifier === "const" && (fromQualifier === "const" || fromQualifier === "")) return true;
				if (toQualifier === "input" && (fromQualifier === "input" || fromQualifier === "const" || fromQualifier === "")) return true;
			}
		} else {
			// No qualifier, just union type like "int/float"
			const toTypes = to.split("/");
			const fromBase = from.replace(/^(series|simple|const|input)\s+/, "").replace(/^(\w+)<(\w+)>$/, "$2");
			if (toTypes.includes(fromBase)) return true;
		}

		return false;
	}

	// Check if type is an na variant (na, const<na>, series<na>)
	function isNaType(type: PineType): boolean {
		const t = type as string;
		return t === "na" || t === "const<na>" || t === "series<na>" || t.endsWith("<na>");
	}

	// Check if type1 is assignable to type2
	export function isAssignable(from: PineType, to: PineType): boolean {
		if (from === to) return true;
		if (to === "unknown" || from === "unknown") return true;
		if (isNaType(from)) return true; // na is assignable to any type (const<na>, series<na>, etc.)

		// Handle union types in target (e.g., "series int/float" accepts both int and float)
		if ((to as string).includes("/")) {
			if (isUnionTypeMatch(from as string, to as string)) return true;
		}

		// Normalize types for comparison (handles "series int" vs "series<int>")
		const normalizedFrom = normalizeType(from as string);
		const normalizedTo = normalizeType(to as string);
		if (normalizedFrom === normalizedTo) return true;

		// int <-> float coercion (Pine Script allows bidirectional numeric coercion)
		if (from === "int" && to === "float") return true;
		if (from === "float" && to === "int") return true;
		if (from === "series<int>" && to === "series<float>") return true;
		if (from === "series<float>" && to === "series<int>") return true;
		if (from === "simple<int>" && to === "simple<float>") return true;
		if (from === "simple<float>" && to === "simple<int>") return true;

		// Simple -> series coercion (base types to series)
		if (from === "int" && to === "series<int>") return true;
		if (from === "float" && to === "series<float>") return true;
		if (from === "bool" && to === "series<bool>") return true;
		if (from === "string" && to === "series<string>") return true;
		if (from === "color" && to === "series<color>") return true;

		// Cross-type numeric coercion to series
		if (from === "int" && to === "series<float>") return true;
		if (from === "float" && to === "series<int>") return true;

		// simple<T> -> series<T> coercion
		if (from === "simple<int>" && to === "series<int>") return true;
		if (from === "simple<float>" && to === "series<float>") return true;
		if (from === "simple<bool>" && to === "series<bool>") return true;
		if (from === "simple<string>" && to === "series<string>") return true;
		if (from === "simple<color>" && to === "series<color>") return true;

		// simple<T> -> base type T coercion (simple is compatible with const)
		if (from === "simple<int>" && to === "int") return true;
		if (from === "simple<float>" && to === "float") return true;
		if (from === "simple<bool>" && to === "bool") return true;
		if (from === "simple<string>" && to === "string") return true;
		if (from === "simple<color>" && to === "color") return true;

		// Numeric coercion with simple types
		if (from === "simple<int>" && to === "float") return true;
		if (from === "simple<float>" && to === "int") return true;
		if (from === "simple<int>" && to === "simple<float>") return true;
		if (from === "simple<int>" && to === "series<float>") return true;
		if (from === "simple<float>" && to === "series<int>") return true;

		// String -> color coercion (Pine Script allows color names and hex as strings)
		// e.g., "red", "blue", "#FF0000", "#00FF00FF"
		if (from === "string" && (to === "color" || to === "series<color>")) return true;
		if (from === "series<string>" && to === "series<color>") return true;

		return false;
	}

	// Infer type from literal value
	export function inferLiteralType(value: unknown): PineType {
		// Check for na first (it's stored as string "na" in the AST)
		if (value === "na") return "na";
		if (typeof value === "number") {
			return Number.isInteger(value) ? "int" : "float";
		}
		if (typeof value === "boolean") return "bool";
		if (typeof value === "string") return "string";
		return "unknown";
	}

	// Get result type of binary operation
	export function getBinaryOpType(
		left: PineType,
		right: PineType,
		operator: string,
	): PineType {
		// String concatenation with +
		if (operator === "+" && (isStringType(left) || isStringType(right))) {
			// String concatenation returns string (or series<string> if either is series)
			if (left.startsWith("series") || right.startsWith("series")) {
				return "series<string>";
			}
			return "string";
		}

		// Arithmetic operators
		if (["+", "-", "*", "/", "%"].includes(operator)) {
			// If either is series, result is series
			if (left.startsWith("series") || right.startsWith("series")) {
				// If either is float, result is series<float>
				if (left.includes("float") || right.includes("float")) {
					return "series<float>";
				}
				return "series<int>";
			}
			// Simple types
			if (left === "float" || right === "float") return "float";
			return "int";
		}

		// Comparison operators
		if (["<", ">", "<=", ">=", "==", "!="].includes(operator)) {
			if (left.startsWith("series") || right.startsWith("series")) {
				return "series<bool>";
			}
			return "bool";
		}

		// Logical operators
		if (["and", "or"].includes(operator)) {
			if (left.startsWith("series") || right.startsWith("series")) {
				return "series<bool>";
			}
			return "bool";
		}

		return "unknown";
	}

	// Check if types are compatible for operation
	export function areTypesCompatible(
		left: PineType,
		right: PineType,
		operator: string,
	): boolean {
		// If either type is unknown, we can't verify compatibility - assume OK
		// This prevents cascading false positives from user-defined functions
		// and other cases where type inference fails
		if (left === "unknown" || right === "unknown") {
			return true;
		}

		// na can be compared/operated with any type
		if (isNaType(left) || isNaType(right)) {
			return true;
		}

		// String concatenation with +
		if (operator === "+" && (isStringType(left) || isStringType(right))) {
			// Both must be strings for string concatenation
			return isStringType(left) && isStringType(right);
		}

		// Arithmetic operators require numeric types
		if (["+", "-", "*", "/", "%"].includes(operator)) {
			const leftNumeric = isNumericType(left);
			const rightNumeric = isNumericType(right);
			return leftNumeric && rightNumeric;
		}

		// Comparison operators
		if (["<", ">", "<=", ">="].includes(operator)) {
			const leftNumeric = isNumericType(left);
			const rightNumeric = isNumericType(right);
			return leftNumeric && rightNumeric;
		}

		// Equality operators work on same types OR series<T> with T
		if (["==", "!="].includes(operator)) {
			// Allow exact type match
			if (left === right) return true;

			// Allow series<T> == T (Pine Script auto-promotes T to series<T>)
			if (areCompatibleForComparison(left, right)) return true;
			if (areCompatibleForComparison(right, left)) return true;

			// Allow assignability in either direction
			return isAssignable(left, right) || isAssignable(right, left);
		}

		// Logical operators require bool
		if (["and", "or"].includes(operator)) {
			return isBoolType(left) && isBoolType(right);
		}

		return false;
	}

	// Helper to check if series<T> and T are compatible for comparison
	function areCompatibleForComparison(
		seriesType: PineType,
		simpleType: PineType,
	): boolean {
		// series<int> comparisons
		if (seriesType === "series<int>" && simpleType === "int") return true;
		if (seriesType === "series<int>" && simpleType === "float") return true; // int can compare with float
		if (seriesType === "series<int>" && simpleType === "simple<int>") return true;
		if (seriesType === "series<int>" && simpleType === "simple<float>") return true;

		// series<float> comparisons
		if (seriesType === "series<float>" && simpleType === "float") return true;
		if (seriesType === "series<float>" && simpleType === "int") return true; // int coerces to float
		if (seriesType === "series<float>" && simpleType === "simple<int>") return true;
		if (seriesType === "series<float>" && simpleType === "simple<float>") return true;

		// series<bool> comparisons
		if (seriesType === "series<bool>" && simpleType === "bool") return true;
		if (seriesType === "series<bool>" && simpleType === "simple<bool>") return true;

		// series<string> comparisons
		if (seriesType === "series<string>" && simpleType === "string") return true;
		if (seriesType === "series<string>" && simpleType === "simple<string>") return true;

		// series<color> comparisons
		if (seriesType === "series<color>" && simpleType === "color") return true;
		if (seriesType === "series<color>" && simpleType === "simple<color>") return true;

		return false;
	}

	export function isNumericType(type: PineType): boolean {
		return (
			type === "int" ||
			type === "float" ||
			type === "series<int>" ||
			type === "series<float>" ||
			type === "simple<int>" ||
			type === "simple<float>" ||
			// Color is numeric in Pine Script (can do arithmetic on it)
			type === "color" ||
			type === "series<color>" ||
			type === "simple<color>"
		);
	}

	export function isBoolType(type: PineType): boolean {
		return type === "bool" || type === "series<bool>" || type === "simple<bool>";
	}

	export function isStringType(type: PineType): boolean {
		return type === "string" || type === "series<string>" || type === "simple<string>";
	}

	// Legacy fallback for function return types
	// All data is now in pine-data/v6 - this should rarely be called
	export function getBuiltinReturnType(
		_functionName: string,
		_args: PineType[],
	): PineType {
		// Return unknown - the caller should use function signatures from pine-data
		// If we hit this, it means the function isn't in pine-data and should be added there
		return "unknown";
	}

	// Validate literal values
	export function validateLiteral(
		type: PineType,
		value: unknown,
	): { valid: boolean; message?: string } {
		switch (type) {
			case "int":
			case "series<int>":
				if (typeof value === "number" && Number.isInteger(value)) {
					return { valid: true };
				}
				return {
					valid: false,
					message: `Expected integer, got ${typeof value}`,
				};

			case "float":
			case "series<float>":
				if (typeof value === "number") {
					return { valid: true };
				}
				return {
					valid: false,
					message: `Expected number, got ${typeof value}`,
				};

			case "bool":
			case "series<bool>":
				if (typeof value === "boolean") {
					return { valid: true };
				}
				return {
					valid: false,
					message: `Expected boolean, got ${typeof value}`,
				};

			case "string":
			case "series<string>":
				if (typeof value === "string") {
					return { valid: true };
				}
				return {
					valid: false,
					message: `Expected string, got ${typeof value}`,
				};

			default:
				return { valid: true };
		}
	}
}
