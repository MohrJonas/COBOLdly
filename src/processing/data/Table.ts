import { EOL } from "os";
import { Diagnostic, DiagnosticSeverity, DocumentSymbol } from "vscode";
import NotNullArray from "../../utils/NotNullArray";
import { trimMultipleWhitespaces } from "../../utils/Utils";
import Parsable from "../Parsable";
import Program from "../Program";

export default class Table implements Parsable<DocumentSymbol> {
    
    static pattern = /(\d{2}) ([a-z0-9-]+)(?: pic [0-9()XASV\.]+)? occurs (\d+) times\./i;
    annotations: Array<string> = [];
    level: number | undefined;
    name: string | undefined;
    occurs: number | undefined;

    constructor(public program: Program) {}

    parse(symbol: DocumentSymbol): Diagnostic[] {
        const diagnostics: NotNullArray<Array<Diagnostic>> = new NotNullArray();
        const lines = this.program.document.getText().split(EOL);
        let trimmedLine: string;
        if(symbol.range.isSingleLine) {
           trimmedLine = lines[symbol.range.start.line];
        }
        else {
            trimmedLine = lines.slice(symbol.range.start.line, symbol.range.end.line).join(EOL);
        }
        trimmedLine = trimMultipleWhitespaces(trimmedLine);
        const trimmedName = trimMultipleWhitespaces(symbol.name);
        if (!Table.pattern.test(trimmedLine)) {
            diagnostics.push([new Diagnostic(
                symbol.range,
                `Unexpected token ${trimmedName}`,
                DiagnosticSeverity.Error
            )]);
        }
        if(!trimmedLine.endsWith(".")) {
            diagnostics.push([new Diagnostic(
                symbol.range,
                `Missing period`,
                DiagnosticSeverity.Error
            )]);
        }
        else {
            const groups = trimmedLine.match(Table.pattern)!;
            this.level = parseInt(groups[1]);
            this.name = groups[2];
            this.occurs = parseInt(groups[3]);
        }
        return diagnostics.asArray().flat();
    }
}