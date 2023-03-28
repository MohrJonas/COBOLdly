import { createMachine, StateMachine } from "xstate";
import Token from "../tokens/Token";
import { TokenType } from "../tokens/TokenType";
import { Trigger } from "../Trigger";

export const Move: { key: Trigger, value: StateMachine<Record<string, never>, Record<string, never>, { type: string, token: Token }> } = {
	key: (token: Token) => { return token.type === TokenType.KEYWORD && token.raw === "MOVE"; },
	value: createMachine({
		predictableActionArguments: true,
		id: "MOVE",
		initial: "move",
		/* eslint-disable @typescript-eslint/naming-convention */
		states: {
			move: {
				on: {
					VARIABLE_IDENTIFIER: { target: "identifier0" },
					CONSTANT: { target: "constant0" },
					LITERAL: { target: "literal0" }
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
			literal0: {
				on: {
					KEYWORD: { target: "to", cond: (_, event) => { return event.token.raw === "TO"; } },
				}
			},
			to: {
				on: {
					VARIABLE_IDENTIFIER: { target: "identifier1" },
				}
			},
			identifier1: {
				tags: "final"
			}
		}
	})
};