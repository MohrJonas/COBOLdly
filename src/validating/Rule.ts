import { Diagnostic } from "vscode";
import Program from "../processing/Program";

export type Rule = (program: Program) => Array<Diagnostic>;