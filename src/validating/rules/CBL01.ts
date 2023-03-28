import { filter, flatMap } from "lodash";
import { Diagnostic, DiagnosticSeverity } from "vscode";
import { TokenType } from "../../processing/procedure/tokens/TokenType";
import Program from "../../processing/Program";
import { Rule } from "../Rule";

export const CBL01: Rule = (program: Program) => {
	const sections = program.programId?.procedureDivision?.sections;
	if (!sections) {
		return [];
	}
	const statements = flatMap(sections, (section) => { return section.statements; });
	const tokens = flatMap(statements, (statement) => { return statement.tokens; });
	const keywords = filter(tokens, (token) => { return token.type === TokenType.KEYWORD; });
	const errors = filter(keywords, (keyword) => { return keyword.raw !== keyword.raw.toUpperCase(); });
	return errors.map((error) => {
		return new Diagnostic(
			error.range,
			`${error.raw} should be UPPERCASE`,
			DiagnosticSeverity.Warning
		);
	});
};