import type { Context } from './context.js';

export type MiddlewareFunction<State, Args extends any[] = []> = (...args: [...Args, Context & State]) => unknown;

export type MiddlewareData =
  // Parser
  | [1, MiddlewareFunction<any>, string]
  // Validator
  | [2, MiddlewareFunction<any>]
  // Middleware
  | [3, MiddlewareFunction<any>];
