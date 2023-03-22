import { createMachine, StateMachine } from "xstate";
import Token from "./tokens/Token";
import { TokenType } from "./tokens/TokenType";

export const statements: Map<TokenType, StateMachine<{}, {}, { type: string, token: Token }>> = new Map();

statements.set(TokenType.KEYWORD, createMachine({
    predictableActionArguments: true,
    id: "ADD",
    initial: "add",
    /* eslint-disable @typescript-eslint/naming-convention */
    states: {
        add: {
            on: {
                IDENTIFIER: { target: "identifier0" },
                CONSTANT: { target: "constant0" }
            },
            tags: "final"
        },
        identifier0: {
            on: {
                KEYWORD: { target: "to" },
            },
            tags: "final"
        },
        constant0: {
            on: {
                KEYWORD: { target: "to" },
            },
            tags: "final"
        },
        to: {
            on: {
                IDENTIFIER: { target: "identifier1" },
                CONSTANT: { target: "constant1" }
            },
            tags: "final"
        },
        identifier1: {
            on: {
                KEYWORD: { target: "giving" },
            },
            tags: "final"
        },
        constant1: {
            on: {
                KEYWORD: { target: "giving" },
            },
            tags: "final"
        },
        giving: {
            on: {
                IDENTIFIER: { target: "identifier2" },
            },
            tags: "final"
        },
        identifier2: {
            tags: "final",
            type: "final"
        }
    }
}));