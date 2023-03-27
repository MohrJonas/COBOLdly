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
	occurs: number | undefined;
	indexedBy: string | undefined;
	children: Array<Variable | Table | Group> = [];
	annotations: Array<string> = [];

	constructor(public program: Program) { }

	parse(symbol: DocumentSymbol): Diagnostic[] {
		const diagnostics: NotNullArray<Array<Diagnostic>> = new NotNullArray();
		const lines = this.program.document.getText().split(EOL);
		// console.log(symbol);
		if (symbol.range.isSingleLine) {
			diagnostics.push([new Diagnostic(
				symbol.range,
				"Unexpected absence of children",
				DiagnosticSeverity.Error
			)]);
		}
		else {
			const trimmedLine = trimMultipleWhitespaces(lines[symbol.range.start.line]);
			const trimmedName = trimMultipleWhitespaces(symbol.name);
			if (!Variable.patterns["level + name"].test(trimmedLine)) {
				diagnostics.push([new Diagnostic(
					symbol.range,
					`Unexpected token ${trimmedName}`,
					DiagnosticSeverity.Error
				)]);
			}
			else {
				const groups = trimmedLine.match(Variable.patterns["level + name"])!;
				this.level = parseInt(groups[1]);
				this.name = groups[2];
				if (Variable.patterns["occurs"].test(trimmedLine)) {
					const groups = trimmedLine.match(Variable.patterns["occurs"])!;
					this.occurs = parseInt(groups[1]);
				}
				if (Variable.patterns["indexed by"].test(trimmedLine)) {
					const groups = trimmedLine.match(Variable.patterns["indexed by"])!;
					this.indexedBy = groups[1];
				}
				symbol.children.forEach((child) => {
					switch (child.kind) {
					case SymbolKind.Array: {
						const table = new Table(this.program);
						diagnostics.push(table.parse(child));
						this.children.push(table);
						break;
					}
					case SymbolKind.Field:
						//TODO Potentially move type parameter into a custom type
					case SymbolKind.TypeParameter: {
						const variable = new Variable(this.program);
						diagnostics.push(variable.parse(child));
						this.children.push(variable);
						break;
					}
					case SymbolKind.Struct: {
						const group = new Group(this.program);
						diagnostics.push(group.parse(child));
						this.children.push(group);
						break;
					}
					default: {
						diagnostics.push([new Diagnostic(
							symbol.range,
							`Unexpected token ${trimmedName}`,
							DiagnosticSeverity.Error
						)]);
						break;
					}
					}
				});
			}
		}
		return diagnostics.asArray().flat();
	}
}