import { createMachine, StateMachine } from "xstate";
import Token from "../tokens/Token";
import { TokenType } from "../tokens/TokenType";
import { Trigger } from "../Trigger";

export const Add: { key: Trigger, value: StateMachine<Record<string, never>, Record<string, never>, { type: string, token: Token }> } = {
	key: (token: Token) => { return token.type === TokenType.KEYWORD && token.raw.toUpperCase() === "ADD"; },
	value: createMachine({
		predictableActionArguments: true,
		id: "ADD",
		initial: "add",
		/* eslint-disable @typescript-eslint/naming-convention */
		states: {
			add: {
				on: {
					VARIABLE_IDENTIFIER: { target: "identifier0" },
					CONSTANT: { target: "constant0" }
				}
			},
			identifier0: {
				on: {
					KEYWORD: { target: "to", cond: (_, event) => { return event.token.raw === "TO"; } },
				}
			},
			constant0: {
				on: {
					KEYWORD: { target: "to", cond: (_, event) => { return event.token.raw === "TO"; } },
				}
			},
			to: {
				on: {
					VARIABLE_IDENTIFIER: { target: "identifier1" },
					CONSTANT: { target: "constant1" }
				}
			},
			identifier1: {
				on: {
					KEYWORD: { target: "giving", cond: (_, event) => { return event.token.raw === "GIVING"; } },
				},
				tags: "final"
			},
			constant1: {
				on: {
					KEYWORD: { target: "giving", cond: (_, event) => { return event.token.raw === "GIVING"; } },
				}
			},
			giving: {
				on: {
					VARIABLE_IDENTIFIER: { target: "identifier2" },
				}
			},
			identifier2: {
				tags: "final",
				type: "final"
			}
		}
	})
};