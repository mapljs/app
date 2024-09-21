import type { AppRouterCompilerState } from './compiler';
import type { Context } from './context';

export type MacroMiddlewareFunction = (state: AppRouterCompilerState) => void;
export type MiddlewareFunction<State, Args extends any[] = []> = (...args: [...Args, Context & State]) => unknown;

export type MiddlewareData =
  // Macro
  [0, MacroMiddlewareFunction]
  // Parser
  | [1, MiddlewareFunction<any>, string]
  // Validator
  | [2, MiddlewareFunction<any>]
  // Middleware
  | [3, MiddlewareFunction<any>];
