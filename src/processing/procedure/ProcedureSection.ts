import { find, first, flatMapDeep, isEmpty } from "lodash";
import { EOL } from "os";
import { Diagnostic, DiagnosticSeverity, DocumentSymbol, Position, Range } from "vscode";
import NotNullArray from "../../utils/NotNullArray";
import Group from "../data/Group";
import Parsable from "../Parsable";
import Section from "../Section";
import Statement from "./Statement";
import { keywords } from "./tokens/Keyword";
import { operators } from "./tokens/Operators";
import Token from "./tokens/Token";
import { statements as Statements } from "./Statements";
import { asEventString, TokenType } from "./tokens/TokenType";
import { interpret, Interpreter } from "xstate";

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
			// If line is comment or debug, ignore it
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
			let currentTokenText = "";
			let currentlyInString = false;
			let currentStringTerminator: string | undefined;
			let currentChar!: string;
			for (let col = 0; col < lines[row].length; col++) {
				currentChar = lines[row].charAt(col);
				if (currentStringTerminator) {
					if (currentStringTerminator === currentChar) {
						currentlyInString = !currentlyInString;
						if (!currentlyInString) {
							currentStringTerminator = undefined;
						}
					}
				}
				else {
					if (currentChar === "\"" || currentChar === "'") {
						currentlyInString = !currentlyInString;
						currentStringTerminator = currentChar;
					}
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
						currentTokenText = currentTokenText + currentChar.toUpperCase();
					}
				}
				else {
					if (!tokenStartIndex) {
						tokenStartIndex = col;
					}
					currentTokenText = currentTokenText + currentChar.toUpperCase();
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
				diagnostics.push([new Diagnostic(new Range(new Position(row + t.range.start.line + 1, tokenStartIndex!), new Position(row + t.range.start.line + 1, lines[row].length - 1)), "Unterminated string literal")]);
			}
		}
		let interpreter: Interpreter<Record<string, never>, Record<string, never>, { type: string, token: Token }> | undefined;
		let tokenStartIndex: number | undefined;
		for(let index = 0; index < tokens.length; index++) {
			const token = tokens[index];
			if (interpreter) {
				const response = interpreter.send({ token: token, type: asEventString(token.type) });
				if (!response.changed) {
					if (response.tags.has("final")) {
						this.statements.push(new Statement(tokens[tokenStartIndex!].raw, tokens.slice(tokenStartIndex!, index)));
					}
					else {
						const transitions = response.configuration.map((config) => { return config.transitions; }).flat().map((transition) => { return transition.eventType; });
						diagnostics.push([
							new Diagnostic(token.range, isEmpty(transitions) ? `Unexpected token ${token.raw}` : `Unexpected token ${token.raw}, expected ${transitions.join(" | ")}`, DiagnosticSeverity.Error)
						]);
					}
					interpreter = undefined;
					index--;
				}
			} else {
				const machine = find(Array.from(Statements.entries()), (mapEntry) => { return mapEntry[0](token); })?.[1];
				if (machine) {
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					//@ts-ignore
					interpreter = interpret(machine);
					interpreter?.start();
					tokenStartIndex = index;
				}
				else {
					diagnostics.push([
						new Diagnostic(token.range, `Unexpected token ${token.raw}`, DiagnosticSeverity.Error)
					]);
				}
			}
		}
		if(interpreter) {
			if(interpreter.getSnapshot().tags.has("final")) {
				this.statements.push(new Statement(tokens[tokenStartIndex!].raw, tokens.slice(tokenStartIndex!)));
			}
			else {
				const transitions = interpreter.getSnapshot().configuration.map((config) => { return config.transitions; }).flat().map((transition) => { return transition.eventType; });
				diagnostics.push([
					new Diagnostic(t.range, isEmpty(transitions) ? "Missing token(s)" : `Missing token(s), expected ${transitions.join(" | ")}`, DiagnosticSeverity.Error)
				]);
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
			const variableNames: Array<string> = [];
			const sectionNames: Array<string> = [];
			const workingStoragevariables = this.program?.programId?.dataDivision?.workingStorageSection?.variables;
			const linkageSectionsvariables = this.program?.programId?.dataDivision?.linkageSection?.variables;
			const localStoragevariables = this.program?.programId?.dataDivision?.localStorageSection?.variables;
			const sections = this.program.programId?.procedureDivision?.sections;
			const flatVariables = flatMapDeep([...(workingStoragevariables ?? []), ...(linkageSectionsvariables ?? []), ...(localStoragevariables ?? [])], (variable) => {
				if (variable instanceof Group) {
					return [variable, ...variable.children];
				}
				return [variable];
			});
			variableNames.push(
				...flatVariables
					.filter((variable) => { return variable.name; })
					.map((variable) => { return variable.name!.toUpperCase(); })
			);
			if (this.program.programId?.programId) {
				variableNames.push(this.program.programId.programId);
			}
			if (sections) {
				sectionNames.push(
					...sections
						.filter((section) => { return section.name; })
						.map((section) => { return section.name!.toUpperCase(); })
				);
			}
			//Throw out subscript
			if (variableNames.includes(raw.replace(/\([0-9a-z,-:()]+\)/i, ""))) {
				return TokenType.VARIABLE_IDENTIFIER;
			}
			else if (sectionNames.includes(raw)) {
				return TokenType.SECTION_IDENTIFIER;
			}
		}
	}
}