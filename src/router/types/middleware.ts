import type { AnyMacro } from '../../macro.js';
import type { Context } from './context.js';

export type MiddlewareFunction<State, Args extends any[] = []> = (...args: [...Args, Context & State]) => unknown;

export type MiddlewareData =
  // Macro
  | [0, AnyMacro]
  // Parser
  | [1, MiddlewareFunction<any>, string]
  // Validator
  | [2, MiddlewareFunction<any>]
  // Middleware
  | [3, MiddlewareFunction<any>]
  // Setter
  | [4, MiddlewareFunction<any>, string]
  // Headers
  | [5, [string, string][]];
