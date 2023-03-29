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
			using: {
				on: {
					CONSTANT: { target: "using" },
					LITERAL: { target: "using" },
					VARIABLE_IDENTIFIER: { target: "using" },
					KEYWORD: { target: "giving", cond: (_, event) => { return event.token.raw === "GIVING"; } }
				},
				tags: "final"
			},
			giving: {
				on: {
					VARIABLE_IDENTIFIER: { target: "giving" },
					KEYWORD: { target: "using", cond: (_, event) => { return event.token.raw === "USING"; } }
				},
				tags: "final"
			},
			literal0: {
				on: {
					KEYWORD: [
						{ target: "using", cond: (_, event) => { return event.token.raw === "USING"; } },
						{ target: "giving", cond: (_, event) => { return event.token.raw === "GIVING"; } },
					]
				},
				tags: "final"
			}
		}
	})
};