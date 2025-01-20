import type { MiddlewareState } from './compiler/middleware.js';
import type { AnyRouter, Router } from './router/index.js';
import type { AppCompilerState } from './types/compiler.js';

export type MacroFunc<T> = (options: T | undefined, ctx: MiddlewareState, state: AppCompilerState) => void | Promise<void>;

export interface Macro<Options = never, R extends AnyRouter = Router> {
  /**
   * JIT loader source. Must be an absolute path
   */
  loadSource: MacroFunc<Options>;

  /**
   * Should load dependencies or not
   */
  loadDeps?: boolean;

  /**
   * Plugin options. Can be omitted to save memory
   */
  options?: Options;

  /**
   * Router type for inference
   */
  routerType?: R;

  /**
   * The macro hash to tell the compiler to not run it again if one has been registered.
   * If not set, this macro object can only be registered once. To avoid that, set hash to `null` instead.
   */
  hash?: unknown;
}

export type AnyMacro = Macro<any, AnyRouter>;

// Built-in macros
export const parseOrigin: Macro<null> = {
  loadSource: (_, c) => {
    c[0] += `let ${compilerConstants.ORIGIN}=${compilerConstants.ORIGIN_VAL}`;
  }
};

export const attachOrigin: Macro<null, Router<{ origin: string }>> = {
  loadSource: (_, c) => {
    c[0] += `${compilerConstants.CTX}.origin=${compilerConstants.ORIGIN_VAL};`;
  }
};
