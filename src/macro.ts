import type { MiddlewareState } from './compiler/middleware.js';
import type { AnyRouter, BaseRouter } from './router/index.js';
import type { AppCompilerState } from './types/compiler.js';

export type MacroFunc<T> = (options: T, ctx: MiddlewareState, state: AppCompilerState) => void | Promise<void>;

export interface Macro<Options, ModifiedRouter extends AnyRouter = BaseRouter> {
  /**
   * JIT loader source. Must be an absolute path
   */
  loadSource: string;

  /**
   * Dependency loader.
   */
  loadDeps?: MacroFunc<Options>;

  /**
   * Plugin options (it can be omitted)
   */
  optionsType?: Options;

  /**
   * The type of the modified router
   */
  modifiedType?: ModifiedRouter;
}

export type AnyMacro = Macro<any, AnyRouter>;
