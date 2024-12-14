import type { MiddlewareState } from '../compiler/middleware.js';
import type { AppCompilerState } from '../types/compiler.js';
import type { AnyRouter } from './index.js';

export interface Macro<Options, ModifiedRouter extends AnyRouter> {
  /**
   * JIT mode source (must be an absolute path)
   */
  jitSource: string;

  /**
   * AOT mode source (must be an absolute path)
   */
  aotSource?: string;

  /**
   * Common options
   */
  options: Options;

  /**
   * Type holder
   */
  modifiedType: ModifiedRouter;
}

export type MacroFunc = (options: any, ctx: MiddlewareState, state: AppCompilerState) => void | Promise<void>;
