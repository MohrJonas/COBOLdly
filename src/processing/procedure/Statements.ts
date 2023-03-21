import { StateMachine } from "xstate";
import { Keyword } from "./tokens/Keyword";

//@ts-ignore
export const statements: Map<Keyword, StateMachine> = new Map();