export {
	getAllCompletions,
	getCompletions,
	getNamespaceCompletions,
} from "./completions";
export { getDiagnostics } from "./diagnostics";
export { format, formatToString } from "./formatting";
export { getHover } from "./hover";
export {
	getAllConstantNames,
	getAllFunctionNames,
	getAllVariableNames,
	getSymbolInfo,
} from "./lookup";
export { getSignatureHelp } from "./signatures";
export { getDocumentSymbols } from "./symbols";
export { getDefinition, type DefinitionResult } from "./definition";
export { getReferences, type ReferencesOptions } from "./references";
export {
	prepareRename,
	rename,
	type PrepareRenameResult,
	type RenameResult,
} from "./rename";
