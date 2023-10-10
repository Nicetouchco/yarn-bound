import bondage from "@mnbroatch/bondage/src/index.js";
import EventEmitter from "eventemitter3";
type VariableStorage = {
    display?: Function;
    get: Function;
    set: Function;
};
type Options = {
    dialogue: any;
    variableStorage?: VariableStorage;
    functions?: Record<string, Function>;
    handleCommand?: (commandResult: bondage.CommandResult) => void;
    combineTextAndOptionsResults?: boolean;
    locale: string;
    pauseCommand?: string;
    startAt: string;
};
export declare class YarnBound {
    handleCommand?: (commandResult: bondage.CommandResult) => void;
    pauseCommand: string;
    combineTextAndOptionsResults: boolean;
    bondage: any;
    currentResult: any;
    history: any[];
    locale: string;
    runner: bondage.Runner;
    generator: any;
    eventEmitter: EventEmitter<string | symbol, any>;
    constructor({ dialogue, variableStorage, functions, handleCommand, combineTextAndOptionsResults, locale, pauseCommand, startAt, }: Options);
    jump(startAt: string): void;
    handleConsecutiveOptionsNodes(shouldHandleCommand?: boolean): IteratorResult<any, any>;
    lookahead(): any;
    advance(optionIndex?: number): void;
    registerFunction(name: string, func: Function): void;
    addListener: <T extends string | symbol>(event: T, fn: (...args: any[]) => void, context?: any) => EventEmitter<string | symbol, any>;
    on: <T extends string | symbol>(event: T, fn: (...args: any[]) => void, context?: any) => EventEmitter<string | symbol, any>;
    removeListener: <T extends string | symbol>(event: T, fn?: ((...args: any[]) => void) | undefined, context?: any, once?: boolean | undefined) => EventEmitter<string | symbol, any>;
    off: <T extends string | symbol>(event: T, fn?: ((...args: any[]) => void) | undefined, context?: any, once?: boolean | undefined) => EventEmitter<string | symbol, any>;
}
export {};
