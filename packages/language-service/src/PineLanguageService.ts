import { PineV6 } from "../../../pine-data/v6";
import { DocumentManager, type ParsedDocument } from "./documents";
import {
	type CodeActionContext,
	type DefinitionResult,
	format as formatImpl,
	formatToString,
	getAllConstantNames,
	getAllFunctionNames,
	getAllVariableNames,
	getCodeActions as getCodeActionsImpl,
	getCompletions as getCompletionsImpl,
	getDefinition as getDefinitionImpl,
	getDiagnostics as getDiagnosticsImpl,
	getDocumentSymbols as getDocumentSymbolsImpl,
	getFoldingRanges as getFoldingRangesImpl,
	getHover as getHoverImpl,
	getInlayHints as getInlayHintsImpl,
	getReferences as getReferencesImpl,
	type ReferencesOptions,
	getSignatureHelp as getSignatureHelpImpl,
	getSymbolInfo as getSymbolInfoImpl,
	prepareRename as prepareRenameImpl,
	type PrepareRenameResult,
	rename as renameImpl,
	type RenameResult,
} from "./features";
import type {
	CodeAction,
	CompletionItem,
	Diagnostic,
	DocumentSymbol,
	FoldingRange,
	FormattingOptions,
	HoverInfo,
	InlayHint,
	Location,
	Position,
	Range,
	SignatureHelp,
	SymbolInfo,
	TextEdit,
} from "./types";

export interface HoverOptions {
	mode?: "full" | "summary";
}

/**
 * Main language service facade.
 * Provides all language intelligence features through a single unified API.
 *
 * Usage:
 * ```typescript
 * const service = new PineLanguageService();
 *
 * // Open a document
 * service.openDocument('file:///path/to/script.pine', code, 1);
 *
 * // Get completions
 * const completions = service.getCompletions('file:///path/to/script.pine', { line: 5, character: 10 });
 *
 * // Get diagnostics
 * const diagnostics = service.getDiagnostics('file:///path/to/script.pine');
 *
 * // Close when done
 * service.closeDocument('file:///path/to/script.pine');
 * ```
 */
export class PineLanguageService {
	private documents = new DocumentManager();

	// ========== Document Management ==========

	/**
	 * Open a new document or replace an existing one.
	 */
	openDocument(uri: string, content: string, version: number): void {
		this.documents.open(uri, content, version);
	}

	/**
	 * Update an existing document with new content.
	 */
	updateDocument(uri: string, content: string, version: number): void {
		this.documents.update(uri, content, version);
	}

	/**
	 * Close a document and free resources.
	 */
	closeDocument(uri: string): void {
		this.documents.close(uri);
	}

	/**
	 * Get a parsed document by URI.
	 */
	getDocument(uri: string): ParsedDocument | undefined {
		return this.documents.get(uri);
	}

	// ========== Language Features ==========

	/**
	 * Get completions at a position in a document.
	 */
	getCompletions(uri: string, position: Position): CompletionItem[] {
		const doc = this.documents.get(uri);
		if (!doc) return [];
		return getCompletionsImpl(doc, position);
	}

	/**
	 * Get hover information at a position in a document.
	 */
	getHover(
		uri: string,
		position: Position,
		options?: HoverOptions,
	): HoverInfo | null {
		const doc = this.documents.get(uri);
		if (!doc) return null;
		return getHoverImpl(doc, position, options);
	}

	/**
	 * Get signature help at a position in a document.
	 */
	getSignatureHelp(uri: string, position: Position): SignatureHelp | null {
		const doc = this.documents.get(uri);
		if (!doc) return null;
		return getSignatureHelpImpl(doc, position);
	}

	/**
	 * Get diagnostics (errors and warnings) for a document.
	 */
	getDiagnostics(uri: string): Diagnostic[] {
		const doc = this.documents.get(uri);
		if (!doc) return [];
		return getDiagnosticsImpl(doc);
	}

	/**
	 * Format a document.
	 */
	format(uri: string, options?: FormattingOptions): TextEdit[] {
		const doc = this.documents.get(uri);
		if (!doc) return [];
		return formatImpl(doc, options);
	}

	/**
	 * Get document symbols (outline) for a document.
	 */
	getDocumentSymbols(uri: string): DocumentSymbol[] {
		const doc = this.documents.get(uri);
		if (!doc) return [];
		return getDocumentSymbolsImpl(doc);
	}

	/**
	 * Get the definition location of a symbol at a position.
	 */
	getDefinition(uri: string, position: Position): DefinitionResult | null {
		const doc = this.documents.get(uri);
		if (!doc) return null;
		return getDefinitionImpl(doc, position);
	}

	/**
	 * Find all references to a symbol at a position.
	 */
	getReferences(
		uri: string,
		position: Position,
		options?: ReferencesOptions,
	): Location[] {
		const doc = this.documents.get(uri);
		if (!doc) return [];
		return getReferencesImpl(doc, position, options);
	}

	/**
	 * Prepare rename: check if symbol can be renamed and return its range.
	 */
	prepareRename(uri: string, position: Position): PrepareRenameResult | null {
		const doc = this.documents.get(uri);
		if (!doc) return null;
		return prepareRenameImpl(doc, position);
	}

	/**
	 * Rename a symbol at a position.
	 */
	rename(uri: string, position: Position, newName: string): RenameResult | null {
		const doc = this.documents.get(uri);
		if (!doc) return null;
		return renameImpl(doc, position, newName);
	}

	/**
	 * Get code actions (quick fixes) for a range in a document.
	 */
	getCodeActions(
		uri: string,
		range: Range,
		context: CodeActionContext,
	): CodeAction[] {
		const doc = this.documents.get(uri);
		if (!doc) return [];
		return getCodeActionsImpl(doc, range, context);
	}

	/**
	 * Get inlay hints for a range in a document.
	 */
	getInlayHints(uri: string, range: Range): InlayHint[] {
		const doc = this.documents.get(uri);
		if (!doc) return [];
		return getInlayHintsImpl(doc, range);
	}

	/**
	 * Get folding ranges for a document.
	 */
	getFoldingRanges(uri: string): FoldingRange[] {
		const doc = this.documents.get(uri);
		if (!doc) return [];
		return getFoldingRangesImpl(doc);
	}

	// ========== Static Helpers (no document needed) ==========

	/**
	 * Look up documentation for a symbol.
	 * This is a static method that doesn't require a document.
	 */
	static getSymbolInfo(symbol: string): SymbolInfo | null {
		return getSymbolInfoImpl(symbol);
	}

	/**
	 * Get all function names, optionally filtered by namespace.
	 */
	static getAllFunctions(namespace?: string): string[] {
		return getAllFunctionNames(namespace);
	}

	/**
	 * Get all variable names, optionally filtered by namespace.
	 */
	static getAllVariables(namespace?: string): string[] {
		return getAllVariableNames(namespace);
	}

	/**
	 * Get all constant names, optionally filtered by namespace.
	 */
	static getAllConstants(namespace?: string): string[] {
		return getAllConstantNames(namespace);
	}

	/**
	 * Get all available namespaces.
	 */
	static getAllNamespaces(): string[] {
		return Array.from(PineV6.getAllNamespaces());
	}

	/**
	 * Format code directly (without needing to open a document).
	 * Useful for CLI and MCP tools.
	 */
	static formatCode(code: string): string {
		return formatToString(code);
	}
}
