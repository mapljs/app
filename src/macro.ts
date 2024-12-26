import type { MiddlewareState } from './compiler/middleware.js';
import type { AnyRouter, BaseRouter } from './router/index.js';
import type { AppCompilerState } from './types/compiler.js';

export type MacroFunc<T> = (options: T, ctx: MiddlewareState, state: AppCompilerState) => void | Promise<void>;

export interface Macro<Options, Router extends AnyRouter = BaseRouter> {
  /**
   * JIT loader source. Must be an absolute path
   */
  loadSource: MacroFunc<Options>;

  /**
   * Dependency loader.
   */
  loadDeps?: MacroFunc<Options>;

  /**
   * Plugin options
   */
  options: Options;

  /**
   * Router type for inference
   */
  routerType?: Router;

  /**
   * The macro hash to tell the compiler to not run it again if one has been registered
   */
  hash?: any;
}

export type AnyMacro = Macro<any, AnyRouter>;
