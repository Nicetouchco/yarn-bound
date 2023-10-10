//@ts-ignore
import bondage from "@mnbroatch/bondage/src/index.js";
import parseLine from "./line-parser";
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
  locale?: string;
  pauseCommand?: string;
  startAt?: string;
};

export class YarnBound {
  handleCommand?: (commandResult: bondage.CommandResult) => void;
  pauseCommand: string;
  combineTextAndOptionsResults: boolean;
  bondage: any;
  currentResult: any;
  history: any[];
  locale: string;
  runner: bondage.Runner;
  generator: any; // Generator
  eventEmitter = new EventEmitter();
  startAt: string;
  dialogue: string;

  constructor({
    dialogue,
    variableStorage,
    functions,
    handleCommand,
    combineTextAndOptionsResults,
    locale = "en",
    pauseCommand = "pause",
    startAt = "Start",
  }: Options) {
    this.handleCommand = handleCommand;
    this.pauseCommand = pauseCommand;
    this.combineTextAndOptionsResults = !!combineTextAndOptionsResults;
    this.bondage = bondage;
    this.currentResult = null;
    this.history = [];
    this.locale = locale;
    this.runner = new bondage.Runner();
    this.runner.noEscape = true;
    this.startAt = startAt;
    this.dialogue = dialogue;

    if (variableStorage) {
      variableStorage.display = variableStorage.display || variableStorage.get;
      this.runner.setVariableStorage(variableStorage);
    }
    if (functions) {
      Object.entries(functions).forEach((entry) => {
        this.registerFunction(...entry);
      });
    }
  }

  start() {
    if (Object.keys(this.runner.yarnNodes).length === 0) {
      this.runner.load(this.dialogue);
    }

    this.jump(this.startAt);
  }

  jump(startAt: string) {
    this.generator = this.runner.run(startAt);
    this.advance();
  }

  handleConsecutiveOptionsNodes(shouldHandleCommand?: boolean) {
    let next = this.generator.next();
    while (
      next.value instanceof bondage.CommandResult &&
      next.value.command !== this.pauseCommand
    ) {
      if (shouldHandleCommand) {
        if (this.handleCommand) this.handleCommand(next.value);
      }
      next = this.generator.next();
    }
    return next;
  }

  // for combining text + options, and detecting dialogue end
  lookahead() {
    let next = this.generator.next();

    if (next.done) {
      next.value = Object.assign(next.value || {}, { isDialogueEnd: true });
      return next;
    }

    // Can't look ahead of options before we select one
    if (
      next.done ||
      (next.value && next.value.command === this.pauseCommand) ||
      next.value instanceof bondage.OptionsResult
    ) {
      return next;
    }

    if (
      this.handleCommand &&
      next.value instanceof bondage.CommandResult &&
      next.value.command !== this.pauseCommand
    ) {
      this.handleCommand(next.value);
      next = this.handleConsecutiveOptionsNodes(true);
    }

    this.runner.lookahead = true;
    let upcoming = this.generator.next();
    if (
      this.handleCommand &&
      upcoming.value instanceof bondage.CommandResult &&
      upcoming.value.command !== this.pauseCommand
    ) {
      upcoming = this.handleConsecutiveOptionsNodes();

      this.generator = next.value.getGeneratorHere();
      this.runner.lookahead = false;

      // Only possible if dialogue starts/resumes on a CommandResult.
      const rewoundNext =
        next.value instanceof bondage.CommandResult
          ? this.handleConsecutiveOptionsNodes(true)
          : this.generator.next();
      if (!upcoming.value) {
        // Handle trailing commands at end of dialogue
        upcoming = this.handleConsecutiveOptionsNodes(true);
        if (upcoming.value) {
          // upcoming will only have a value if a conditional check's outcome changes
          // due to handling a series of commands directly before the conditional.
          // This edge case does cause commands to be handled prematurely
          this.generator = upcoming.value.getGeneratorHere();
        } else {
          Object.assign(rewoundNext.value, { isDialogueEnd: true });
        }
      }
      return rewoundNext;
    } else if (
      next.value instanceof bondage.TextResult &&
      this.combineTextAndOptionsResults &&
      upcoming.value instanceof bondage.OptionsResult
    ) {
      this.generator = next.value.getGeneratorHere();
      this.runner.lookahead = false;

      const rewoundNext = this.generator.next();
      const rewoundUpcoming = this.generator.next();
      Object.assign(rewoundUpcoming.value, rewoundNext.value);
      return rewoundUpcoming;
    } else {
      this.generator = next.value.getGeneratorHere();
      this.runner.lookahead = false;

      const rewoundNext = this.generator.next();
      if (!upcoming.value) {
        Object.assign(rewoundNext.value, { isDialogueEnd: true });
      }
      return rewoundNext;
    }
  }

  advance(optionIndex?: number) {
    if (
      typeof optionIndex !== "undefined" &&
      this.currentResult &&
      this.currentResult.select
    ) {
      this.currentResult.select(optionIndex);
    }

    const next = this.lookahead();

    [next.value.text && next.value, ...(next.value.options || [])]
      .filter(Boolean)
      .forEach((node) => parseLine(node, this.locale));

    if (
      this.currentResult &&
      !(
        this.handleCommand &&
        this.currentResult instanceof bondage.CommandResult
      )
    ) {
      this.history.push(this.currentResult);
    }

    this.currentResult = next.value;
    this.eventEmitter.emit("advance", this.currentResult);
  }

  registerFunction(name: string, func: Function) {
    this.runner.registerFunction(name, func);
  }

  addListener = this.eventEmitter.addListener.bind(this.eventEmitter);
  on = this.eventEmitter.on.bind(this.eventEmitter);
  removeListener = this.eventEmitter.removeListener.bind(this.eventEmitter);
  off = this.eventEmitter.off.bind(this.eventEmitter);
}
