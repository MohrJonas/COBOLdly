import { Range } from "vscode";
import { Constant } from "./Constant";
import Identifier from "./Identifier";
import { Keyword } from "./Keyword";
import { Literal } from "./Literal";

export default class Token {

    constructor(public content: Keyword | Constant | Literal | Identifier, public range: Range, public raw: string) {}

}