import { Range } from "vscode";
import { TokenType } from "./TokenType";

export default class Token {
	constructor(
        public type: TokenType,
        public range: Range,
        public raw: string
	) { }
}