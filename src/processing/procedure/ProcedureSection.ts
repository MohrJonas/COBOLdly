import { first, isFinite, isSafeInteger } from "lodash";
import { EOL } from "os";
import { Diagnostic, DiagnosticSeverity, DocumentSymbol, languages, Position, Range } from "vscode";
import NotNullArray from "../../utils/NotNullArray";
import Parsable from "../Parsable";
import Program from "../Program";
import Section from "../Section";
import Statement from "./Statement";
import { keywords } from "./tokens/Keyword";
import { operators } from "./tokens/Operators";
import Token from "./tokens/Token";
import { TokenType } from "./tokens/TokenType";

export default class ProcedureSection extends Section implements Parsable<DocumentSymbol> {

    annotations: Array<string> = [];
    name: string | undefined;
    statements: Array<Statement> = [];

    parse(t: DocumentSymbol): Diagnostic[] {
        const diagnostics = new NotNullArray<Array<Diagnostic>>;
        const lines = this.program.document.getText(t.range)
            // Remove all periods
            .replace(/\./g, "")
            .split(EOL);
        // Shift to remove section header
        lines.shift();
        const tokens: Array<Token> = [];
        for (let row = 0; row < lines.length; row++) {
            // If line is comment or debug, ignore
            if (
                lines[row].trimStart().startsWith("*") ||
                lines[row].trimStart().startsWith("D")) {
                continue;
            }
            // If line has inline comment, remove it
            if (lines[row].includes("*>")) {
                lines[row] = first(lines[row].split("*>"))!;
            }
            let tokenStartIndex: number | undefined;
            let currentTokenText: string = "";
            let currentlyInString: boolean = false;
            let currentChar!: string;
            for (let col = 0; col < lines[row].length; col++) {
                currentChar = lines[row].charAt(col);
                if (currentChar === "\"" || currentChar === "'") {
                    currentlyInString = !currentlyInString;
                }
                if (/\s/.test(currentChar)) {
                    if (!currentlyInString) {
                        if (tokenStartIndex) {
                            const tokenType = this.getTokenType(currentTokenText);
                            if (tokenType !== undefined) {
                                tokens.push(new Token(tokenType, new Range(new Position(row + t.range.start.line + 1, tokenStartIndex), new Position(row + t.range.start.line + 1, col)), currentTokenText));
                            }
                            else {
                                diagnostics.push([new Diagnostic(new Range(new Position(row + t.range.start.line + 1, tokenStartIndex), new Position(row + t.range.start.line + 1, col)), `Unresolved reference ${currentTokenText}`)]);
                            }
                            tokenStartIndex = undefined;
                            currentTokenText = "";
                        }
                    } else {
                        currentTokenText = currentTokenText + currentChar;
                    }
                }
                else {
                    if (!tokenStartIndex) {
                        tokenStartIndex = col;
                    }
                    currentTokenText = currentTokenText + currentChar;
                }
            }
            if (!currentlyInString) {
                if (tokenStartIndex) {
                    const tokenType = this.getTokenType(currentTokenText);
                    if (tokenType !== undefined) {
                        tokens.push(new Token(tokenType, new Range(new Position(row + t.range.start.line + 1, tokenStartIndex), new Position(row + t.range.start.line + 1, lines[row].length - 1)), currentTokenText));
                    }
                    else {
                        diagnostics.push([new Diagnostic(new Range(new Position(row + t.range.start.line + 1, tokenStartIndex), new Position(row + t.range.start.line + 1, lines[row].length - 1)), `Unresolved reference ${currentTokenText}`)]);
                    }
                    tokenStartIndex = undefined;
                    currentTokenText = "";
                }
            } else {
                diagnostics.push([new Diagnostic(new Range(new Position(row + t.range.start.line + 1, tokenStartIndex!), new Position(row + t.range.start.line + 1, lines[row].length - 1)), `Unterminated string literal`)]);
            }
        }
        return diagnostics.asArray().flat();
    }

    private getTokenType(raw: string): TokenType | undefined {
        if ((raw.startsWith("\"") && raw.endsWith("\"")) || (raw.startsWith("'") && raw.endsWith("'"))) {
            return TokenType.LITERAL;
        }
        else if (/^\d+$/.test(raw)) {
            return TokenType.CONSTANT;
        }
        else if (operators.includes(raw)) {
            return TokenType.OPERATOR;
        }
        else if (keywords.includes(raw)) {
            return TokenType.KEYWORD;
        }
        else {
            let variableNames: Array<string> = [];
            let sectionNames: Array<string> = [];
            const variables = this.program.programId?.dataDivision?.workingStorageSection?.variables;
            const sections = this.program.programId?.procedureDivision?.sections;
            if (variables) {
                variableNames.push(
                    ...variables
                        .filter((variable) => { return variable.name; })
                        .map((variable) => { return variable.name!.toUpperCase(); })
                );
            }
            if (sections) {
                sectionNames.push(
                    ...sections
                        .filter((section) => { return section.name; })
                        .map((section) => { return section.name!.toUpperCase(); })
                );
            }
            if (variableNames.includes(raw)) {
                return TokenType.VARIABLE_IDENTIFIER;
            }
            else if (sectionNames.includes(raw)) {
                return TokenType.SECTION_IDENTIFIER;
            }
        }
    }
}