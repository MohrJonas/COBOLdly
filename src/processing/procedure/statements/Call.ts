import { createMachine, StateMachine } from "xstate";
import Token from "../tokens/Token";
import { TokenType } from "../tokens/TokenType";
import { Trigger } from "../Trigger";

//TODO change statemachine to only allow valid patterns (currently allows call "" using | call "" giving | call "" using "" giving "" using ""...)
export const Call: { key: Trigger, value: StateMachine<Record<string, never>, Record<string, never>, { type: string, token: Token }> } = {
	key: (token: Token) => { return token.type === TokenType.KEYWORD && token.raw === "CALL"; },
	value:  createMachine({
		predictableActionArguments: true,
		id: "CALL",
		initial: "call",
		/* eslint-disable @typescript-eslint/naming-convention */
		states: {
			call: {
				on: {
					LITERAL: { target: "literal0" }
				}
			},
			literal0: {
				on: {
					KEYWORD: [
						{ target: "using", cond: (_, event) => { return event.token.raw === "USING"; } },
						{ target: "giving", cond: (_, event) => { return event.token.raw === "GIVING"; } },
					]
				},
				tags: "final"
			},
			using: {
				on: {
					CONSTANT: { target: "using1" },
					LITERAL: { target: "using1" },
					VARIABLE_IDENTIFIER: { target: "using1" },
					KEYWORD: { target: "giving", cond: (_, event) => { return event.token.raw === "GIVING"; } }
				},
			},
			using1: {
				on: {
					CONSTANT: { target: "using2" },
					LITERAL: { target: "using2" },
					VARIABLE_IDENTIFIER: { target: "using2" },
					KEYWORD: { target: "giving", cond: (_, event) => { return event.token.raw === "GIVING"; } }
				},
				tags: "final"
			},
			using2: {
				on: {
					CONSTANT: { target: "using1" },
					LITERAL: { target: "using1" },
					VARIABLE_IDENTIFIER: { target: "using1" },
					KEYWORD: { target: "giving", cond: (_, event) => { return event.token.raw === "GIVING"; } }
				},
				tags: "final"
			},
			giving: {
				on: {
					VARIABLE_IDENTIFIER: { target: "giving1" },
					KEYWORD: { target: "using", cond: (_, event) => { return event.token.raw === "USING"; } }
				},
			},
			giving1: {
				on: {
					VARIABLE_IDENTIFIER: { target: "giving2" },
					KEYWORD: { target: "using", cond: (_, event) => { return event.token.raw === "USING"; } }
				},
				tags: "final"
			},
			giving2: {
				on: {
					VARIABLE_IDENTIFIER: { target: "giving1" },
					KEYWORD: { target: "using", cond: (_, event) => { return event.token.raw === "USING"; } }
				},
				tags: "final"
			}
		}
	})
};