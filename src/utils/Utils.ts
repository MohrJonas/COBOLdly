import { TextDocument } from "vscode";

export function trimMultipleWhitespaces(toTrim: string): string {
	return toTrim.replace(/\s{2,}/g, " ");
}

export function eol(document: TextDocument): string {
	return document.eol === 1 ? "\n" : "\r\n";
}