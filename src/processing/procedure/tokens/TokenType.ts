/* eslint-disable @typescript-eslint/naming-convention */
export enum TokenType {
    KEYWORD = 0,
    VARIABLE_IDENTIFIER = 1,
    SECTION_IDENTIFIER = 2,
    CONSTANT = 3,
    LITERAL = 4,
    OPERATOR = 5
}

export function asEventString(type: TokenType) {
	switch(type) {
	case TokenType.CONSTANT:
		return "CONSTANT";
	case TokenType.KEYWORD:
		return "KEYWORD";
	case TokenType.LITERAL:
		return "LITERAL";
	case TokenType.OPERATOR:
		return "OPERATOR";
	case TokenType.SECTION_IDENTIFIER:
		return "SECTION_IDENTIFIER";
	case TokenType.VARIABLE_IDENTIFIER:
		return "VARIABLE_IDENTIFIER";
	}
}