import { Diagnostic, DiagnosticSeverity, Position, Range } from "vscode";
import Program from "../../processing/Program";
import { Rule } from "../Rule";

/* eslint-disable @typescript-eslint/naming-convention */
export const rules: Record<string, Rule> =  {
    "CBL00": (program: Program) => { return [new Diagnostic(new Range(new Position(0, 0), new Position(0, program.document.lineCount)), "Sample rule for sanity checking", DiagnosticSeverity.Information)]; }
};