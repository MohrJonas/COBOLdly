import Token from "./tokens/Token";

export default class Statement {

	constructor(public name: string, public tokens: Array<Token>) {}
}