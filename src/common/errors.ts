// Shared error types and diagnostic severity levels
// Used across the analyzer and language service

export enum DiagnosticSeverity {
	Error = 0,
	Warning = 1,
	Information = 2,
	Hint = 3,
}

export interface ValidationError {
	line: number;
	column: number;
	length: number;
	message: string;
	severity: DiagnosticSeverity;
}

// Error factory functions for common error types
export function createError(
	line: number,
	column: number,
	length: number,
	message: string,
): ValidationError {
	return { line, column, length, message, severity: DiagnosticSeverity.Error };
}

export function createWarning(
	line: number,
	column: number,
	length: number,
	message: string,
): ValidationError {
	return { line, column, length, message, severity: DiagnosticSeverity.Warning };
}

export function createInfo(
	line: number,
	column: number,
	length: number,
	message: string,
): ValidationError {
	return { line, column, length, message, severity: DiagnosticSeverity.Information };
}

export function createHint(
	line: number,
	column: number,
	length: number,
	message: string,
): ValidationError {
	return { line, column, length, message, severity: DiagnosticSeverity.Hint };
}
