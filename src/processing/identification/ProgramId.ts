import { Diagnostic, DiagnosticSeverity, DocumentSymbol, Range } from "vscode";
import NotNullArray from "../../utils/NotNullArray";
import { trimMultipleWhitespaces } from "../../utils/Utils";
import { DataDivision, EnvironmentDivision, ProcedureDivision } from "../Divisions";
import Parsable from "../Parsable";
import Program from "../Program";

export default class ProgramId implements Parsable<DocumentSymbol> {

    programId: string | undefined;
    dataDivision: DataDivision | undefined;
    procedureDivision: ProcedureDivision | undefined;
    environmentDivision: EnvironmentDivision | undefined;

    constructor(public program: Program) {}

    parse(symbol: DocumentSymbol): Diagnostic[] {
        const diagnostics: NotNullArray<Array<Diagnostic>> = new NotNullArray();
        const environmentDivisionPattern = /environment division/i;
        const dataDivisionPattern = /data division/i;
        const procedureDivisionPattern = /procedure division/i;
        symbol.children.forEach((child) => {
            const trimmedName = trimMultipleWhitespaces(child.name);
            if (environmentDivisionPattern.test(trimmedName)) {
                this.environmentDivision = new EnvironmentDivision(this.program);
                diagnostics.push(this.environmentDivision?.parse(child));
            }
            else if (dataDivisionPattern.test(trimmedName)) {
                this.dataDivision = new DataDivision(this.program);
                diagnostics.push(this.dataDivision?.parse(child));
            }
            else if (procedureDivisionPattern.test(trimmedName)) {
                this.procedureDivision = new ProcedureDivision(this.program);
                diagnostics.push(this.procedureDivision?.parse(child));
            }
            else {
                diagnostics.push([
                    new Diagnostic(
                        child.range,
                        `Unexpected block ${trimmedName}`
                    )]);
            }
        });
        diagnostics.push([new Diagnostic(new Range(symbol.range.start, symbol.range.start), "PROGRAM-ID parsing not yet implemented", DiagnosticSeverity.Information)]);
        return diagnostics.asArray().flat();
    }
}