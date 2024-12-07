import type { CachedMiddlewareCompilationResult } from '../../compiler/middleware.js';
import type { AppCompilerState } from '../../types/compiler.js';

export interface MacroOptions {
  /**
   * Full compilation module absolute path
   */
  compileModule: string;

  /**
   * Dependency loader module absolute path
   */
  depsModule: string;

  /**
   * Common option to pass between these modules
   */
  options: unknown;
}

export type MacroFunc = (result: CachedMiddlewareCompilationResult, state: AppCompilerState) => void;

// eslint-disable-next-line
export const macroFn = (f: MacroFunc) => f;

// eslint-disable-next-line
export const macro = <T>(options: MacroOptions) => options as MacroOptions & { type: T };
