import { EOL } from "os";
import { Diagnostic, DiagnosticSeverity, DocumentSymbol, SymbolKind } from "vscode";
import NotNullArray from "../../utils/NotNullArray";
import { trimMultipleWhitespaces } from "../../utils/Utils";
import Parsable from "../Parsable";
import Program from "../Program";
import Table from "./Table";
import Variable from "./Variable";


export default class Group implements Parsable<DocumentSymbol> {

    level: number | undefined;
    name: string | undefined;
    children: Array<Variable | Table | Group> = [];
    annotations: Array<string> = [];

    constructor(public program: Program) { }

    parse(symbol: DocumentSymbol): Diagnostic[] {
        const diagnostics: NotNullArray<Array<Diagnostic>> = new NotNullArray();
        const lines = this.program.document.getText().split(EOL);
        let trimmedLine: string;
        if (symbol.range.isSingleLine) {
            trimmedLine = lines[symbol.range.start.line];
        }
        else {
            trimmedLine = lines.slice(symbol.range.start.line, symbol.range.end.line).join(EOL);
        }
        trimmedLine = trimMultipleWhitespaces(trimmedLine);
        const trimmedName = trimMultipleWhitespaces(symbol.name);
        if (!Variable.pattern.test(trimmedLine)) {
            diagnostics.push([new Diagnostic(
                symbol.range,
                `Unexpected token ${trimmedName}`,
                DiagnosticSeverity.Error
            )]);
        }
        else {
            const groups = trimmedLine.match(Variable.pattern)!;
            this.level = parseInt(groups[1]);
            this.name = groups[2];
            this.name = trimmedName;
        }
        symbol.children.forEach((symbol) => {
            switch (symbol.kind) {
                case SymbolKind.Array:
                    const table = new Table(this.program);
                    diagnostics.push(table.parse(symbol));
                    this.children.push(table);
                    break;
                case SymbolKind.Field:
                //TODO Potentially move type parameter into a custom type
                case SymbolKind.TypeParameter:
                    const group = new Group(this.program);
                    diagnostics.push(group.parse(symbol));
                    this.children.push(group);
                    break;
                case SymbolKind.Struct:
                    const variable = new Variable(this.program);
                    diagnostics.push(variable.parse(symbol));
                    this.children.push(variable);
                    break;
                default:
                    diagnostics.push([new Diagnostic(
                        symbol.range,
                        `Unexpected token ${trimmedName}`,
                        DiagnosticSeverity.Error
                    )]);
                    break;
            }
        });
        return diagnostics.asArray().flat();
    }
}