import type { Context } from './context';
import type { MacroMiddlewareFunction } from './middleware';
import type { MaybePromise } from './utils';

export type HandlerData = [string, string, {
  type: string,
  fn: (...args: any[]) => any
}];

export interface TextHandler<State> {
  type: 'text';
  fn: (ctx: Context & State) => MaybePromise<BodyInit>;
}

export interface JSONHandler<State> {
  type: 'json';
  fn: (ctx: Context & State) => unknown;
}

export interface HTMLHandler<State> {
  type: 'html';
  fn: (ctx: Context & State) => MaybePromise<BodyInit>;
}

export interface MacroHandler {
  type: 'macro';
  fn: MacroMiddlewareFunction;
}

