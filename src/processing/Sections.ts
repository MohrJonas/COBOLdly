import { Diagnostic, DiagnosticSeverity, DocumentSymbol, SymbolKind } from "vscode";
import NotNullArray from "../utils/NotNullArray";
import { trimMultipleWhitespaces } from "../utils/Utils";
import Group from "./data/Group";
import Table from "./data/Table";
import Variable from "./data/Variable";
import Parsable from "./Parsable";
import Section from "./Section";

export class ConfigurationSection extends Section implements Parsable<DocumentSymbol> {

	sourceComputer: string | undefined;
	objectComputer: string | undefined;

	parse(symbol: DocumentSymbol): Diagnostic[] {
		const diagnostics: NotNullArray<Array<Diagnostic>> = new NotNullArray();
		const pattern = /(Source|Object)-Computer\. ([a-z0-9-]+)/i;
		symbol.children.forEach((symbol) => {
			const trimmedName = trimMultipleWhitespaces(symbol.name);
			if (pattern.test(trimmedName)) {
				const group = trimmedName.match(pattern)![1];
				switch (group.toUpperCase()) {
				case "SOURCE":
				case "OBJECT":
					this.sourceComputer = group;
					break;
				default:
					diagnostics.push([new Diagnostic(
						symbol.range,
						`Unexpected token ${trimmedName}`,
						DiagnosticSeverity.Error
					)]);
					break;
				}
			}
			else {
				diagnostics.push([new Diagnostic(
					symbol.range,
					`Unexpected token ${trimmedName}`,
					DiagnosticSeverity.Error
				)]);
			}
		});
		return diagnostics.asArray().flat();
	}

}

export class InputOutputSection extends Section implements Parsable<DocumentSymbol> {

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	parse(symbol: DocumentSymbol): Diagnostic[] {
		//TODO
		return [];
	}

}

export class WorkingStorageSection extends Section implements Parsable<DocumentSymbol> {

	variables: Array<Variable | Table | Group> = [];

	parse(symbol: DocumentSymbol): Diagnostic[] {
		const diagnostics: NotNullArray<Array<Diagnostic>> = new NotNullArray();
		symbol.children.forEach((symbol) => {
			const trimmedName = trimMultipleWhitespaces(symbol.name);
			switch (symbol.kind) {
			case SymbolKind.Array: {
				const table = new Table(this.program);
				diagnostics.push(table.parse(symbol));
				this.variables.push(table);
				break;
			}
			case SymbolKind.Struct: {
				const group = new Group(this.program);
				diagnostics.push(group.parse(symbol));
				this.variables.push(group);
				break;
			}
			case SymbolKind.Field: {
				const variable = new Variable(this.program);
				diagnostics.push(variable.parse(symbol));
				this.variables.push(variable);
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
		return diagnostics.asArray().flat();
	}
}

export class LocalStorageSection extends Section implements Parsable<DocumentSymbol> {

	variables: Array<Variable | Table | Group> = [];

	parse(symbol: DocumentSymbol): Diagnostic[] {
		const diagnostics: NotNullArray<Array<Diagnostic>> = new NotNullArray();
		symbol.children.forEach((symbol) => {
			const trimmedName = trimMultipleWhitespaces(symbol.name);
			switch (symbol.kind) {
			case SymbolKind.Array: {
				const table = new Table(this.program);
				diagnostics.push(table.parse(symbol));
				this.variables.push(table);
				break;
			}
			case SymbolKind.Struct: {
				const group = new Group(this.program);
				diagnostics.push(group.parse(symbol));
				this.variables.push(group);
				break;
			}
			case SymbolKind.Field: {
				const variable = new Variable(this.program);
				diagnostics.push(variable.parse(symbol));
				this.variables.push(variable);
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
		return diagnostics.asArray().flat();
	}

}

export class LinkageSection extends Section implements Parsable<DocumentSymbol> {

	variables: Array<Variable | Table | Group> = [];

	parse(symbol: DocumentSymbol): Diagnostic[] {
		const diagnostics: NotNullArray<Array<Diagnostic>> = new NotNullArray();
		symbol.children.forEach((symbol) => {
			const trimmedName = trimMultipleWhitespaces(symbol.name);
			switch (symbol.kind) {
			case SymbolKind.Array: {
				const table = new Table(this.program);
				diagnostics.push(table.parse(symbol));
				this.variables.push(table);
				break;
			}
			case SymbolKind.Struct: {
				const group = new Group(this.program);
				diagnostics.push(group.parse(symbol));
				this.variables.push(group);
				break;
			}
			case SymbolKind.Field: {
				const variable = new Variable(this.program);
				diagnostics.push(variable.parse(symbol));
				this.variables.push(variable);
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
		return diagnostics.asArray().flat();
	}

}

export class FileSection extends Section implements Parsable<DocumentSymbol> {

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	parse(symbol: DocumentSymbol): Diagnostic[] {
		//TODO
		return [];
	}

}