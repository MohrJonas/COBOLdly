import { EOL } from "os";
import { Diagnostic, DiagnosticSeverity, DocumentSymbol } from "vscode";
import NotNullArray from "../../utils/NotNullArray";
import { trimMultipleWhitespaces } from "../../utils/Utils";
import Parsable from "../Parsable";
import Program from "../Program";

export type PatternName = "level + name" | "type" | "value" | "occurs" | "indexed by";

export default class Variable implements Parsable<DocumentSymbol> {

	static pattern = /(\d{2}) ([a-z0-9-]+) pic ([0-9()XASV\.]+)(?: value ([a-z0-9-"]+))?\./i;
	static patterns: Record<PatternName, RegExp> = {
		"level + name": /(\d{2}) ([a-z0-9-]+)/i,
		"type": /pic ([0-9()XASV\.]+)/i,
		"value": /value ([a-z0-9-"]+)/i,
		"occurs": /occurs (\d+) times/i,
		"indexed by": /indexed by ([a-z0-9-])/i
	};
	annotations: Array<string> = [];
	level: number | undefined;
	name: string | undefined;
	type: string | undefined;
	value: string | undefined;
	occurs: number | undefined;
	indexedBy: string | undefined;

	constructor(public program: Program) {}

	parse(symbol: DocumentSymbol): Diagnostic[] {
		const diagnostics: NotNullArray<Array<Diagnostic>> = new NotNullArray();
		const lines = this.program.document.getText().split(EOL);
		let trimmedLine: string;
		if(symbol.range.isSingleLine) {
			trimmedLine = lines[symbol.range.start.line];
		}
		else {
			trimmedLine = lines.slice(symbol.range.start.line, symbol.range.end.line).join("");
		}
		trimmedLine = trimMultipleWhitespaces(trimmedLine);
		const trimmedName = trimMultipleWhitespaces(symbol.name);        
		if (!Variable.patterns["level + name"].test(trimmedLine)) {
			diagnostics.push([new Diagnostic(
				symbol.range,
				`Unexpected token ${trimmedName}`,
				DiagnosticSeverity.Error
			)]);
		}
		if(!trimmedLine.endsWith(".")) {
			diagnostics.push([new Diagnostic(
				symbol.range,
				"Missing period",
				DiagnosticSeverity.Error
			)]);
		}
		else {
			this.name = trimmedName;
			const groups = trimmedLine.match(Variable.patterns["level + name"])!;
			this.level = parseInt(groups[1]);
			this.name = groups[2];
			if(Variable.patterns["type"].test(trimmedLine)) {
				const groups = trimmedLine.match(Variable.patterns["type"])!;
				this.type = groups[1];
			}
			if(Variable.patterns["value"].test(trimmedLine)) {
				const groups = trimmedLine.match(Variable.patterns["value"])!;
				this.value = groups[1];
			}
			if(Variable.patterns["occurs"].test(trimmedLine)) {
				const groups = trimmedLine.match(Variable.patterns["occurs"])!;
				this.occurs = parseInt(groups[1]);
			}
			if(Variable.patterns["indexed by"].test(trimmedLine)) {
				const groups = trimmedLine.match(Variable.patterns["indexed by"])!;
				this.indexedBy = groups[1];
			}
		}
		return diagnostics.asArray().flat();
	}
}