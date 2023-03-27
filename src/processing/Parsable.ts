import { Diagnostic } from "vscode";

export default interface Parsable<T> {

    parse(t: T): Array<Diagnostic>

// eslint-disable-next-line semi
}