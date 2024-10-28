import type { CachedMiddlewareCompilationResult } from '../../compiler/middleware.ts';
import type { AppRouterCompilerState } from '../../types/compiler.ts';
import type { AnyRouter } from '../index.ts';
import type { Context } from './context.js';

export type MiddlewareFunction<State, Args extends any[] = []> = (...args: [...Args, Context & State]) => unknown;

export type BaseMacroMiddlewareFunction = (result: CachedMiddlewareCompilationResult, state: AppRouterCompilerState) => void;
export type MacroMiddlewareFunction<T extends AnyRouter> = BaseMacroMiddlewareFunction & { baseRouterType: T };

export type MiddlewareData =
  // Macro
  [0, BaseMacroMiddlewareFunction]
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
