import { StateMachine } from "xstate";
import { Add } from "./statements/Add";
import { Move } from "./statements/Move";
import { Subtract } from "./statements/Subtract";
import Token from "./tokens/Token";
import { Trigger } from "./Trigger";

export const statements: Map<Trigger, StateMachine<Record<string, never>, Record<string, never>, { type: string, token: Token }>> = new Map();

statements.set(Add.key, Add.value);
statements.set(Move.key, Move.value);
statements.set(Subtract.key, Subtract.value);