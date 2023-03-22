import Token from "./Token";

export default abstract class Identifier extends Token { }

export class VariableIdentifier extends Token { }

export class SectionIdentifier extends Token { }

export class SubscriptIdentifier extends Token { }