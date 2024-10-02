import type { AnyRouter, BaseRouter } from './router/index.js';
import type { BaseMacroMiddlewareFunction, MacroMiddlewareFunction } from './router/types/middleware.ts';

export * from './exception.js';
export * from './router/index.js';
export * from './compiler/exports.js';

/**
 * Create a macro
 */
export function macro<T extends AnyRouter = BaseRouter>(fn: BaseMacroMiddlewareFunction): MacroMiddlewareFunction<T> {
  return fn as any;
}
