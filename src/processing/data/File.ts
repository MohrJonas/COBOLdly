import { Diagnostic, DocumentSymbol } from "vscode";
import NotNullArray from "../../utils/NotNullArray";
import { trimMultipleWhitespaces } from "../../utils/Utils";
import Parsable from "../Parsable";

export default class File implements Parsable<DocumentSymbol> {

	name!: string;

	parse(symbol: DocumentSymbol): Diagnostic[] {
		const diagnostics: NotNullArray<Array<Diagnostic>> = new NotNullArray();
		const trimmedName = trimMultipleWhitespaces(symbol.name);
		this.name = trimmedName;
		return diagnostics.asArray().flat();
	}
}