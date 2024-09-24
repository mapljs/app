import type { AnyRouter } from '../router';
import type { AppRouterCompilerState } from '../types/compiler';
import { compileExceptRoutes } from './handler';

export function compileRouter(router: AnyRouter, state: AppRouterCompilerState): void {
  const exceptionData = compileExceptRoutes(router, state);
}
