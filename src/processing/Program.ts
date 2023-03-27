import { find } from "lodash";
import { Diagnostic, DiagnosticSeverity, DocumentSymbol, Position, Range, TextDocument } from "vscode";
import NotNullArray from "../utils/NotNullArray";
import { trimMultipleWhitespaces } from "../utils/Utils";
import { IdentificationDivision } from "./Divisions";
import Parsable from "./Parsable";
import ProgramId from "./identification/ProgramId";

export default class Program implements Parsable<void> {

	identificationDivision: IdentificationDivision | undefined;
	programId: ProgramId | undefined;

	constructor(public symbols: Array<DocumentSymbol>, public document: TextDocument) { }

	parse(): Diagnostic[] {
		const diagnostics = new NotNullArray<Array<Diagnostic>>();
		const identificationDivisionSymbol = find(this.symbols, (symbol) => {
			return /identification division/i.test(trimMultipleWhitespaces(symbol.name));
		});
		const programIdSymbol = find(this.symbols, (symbol) => {
			return /program-id. ([a-z0-9-"]+)/i.test(trimMultipleWhitespaces(symbol.name));
		});
		if(identificationDivisionSymbol) {
			this.identificationDivision = new IdentificationDivision(this);
			diagnostics.push(this.identificationDivision?.parse(identificationDivisionSymbol));
		}
		else {
			diagnostics.push([new Diagnostic(
				new Range(
					new Position(0, 0),
					new Position(0, 0)
				),
				"No IDENTIFICATION DIVISION found",
				DiagnosticSeverity.Error
			)]);
		}
		if(programIdSymbol) {
			this.programId = new ProgramId(this);
			diagnostics.push(this.programId?.parse(programIdSymbol));
		}
		else {
			diagnostics.push([new Diagnostic(
				new Range(
					new Position(0, 0),
					new Position(0, 0)
				),
				"No PROGRAM-ID found",
				DiagnosticSeverity.Error
			)]);
		}
		return diagnostics.asArray().flat();
	}
}