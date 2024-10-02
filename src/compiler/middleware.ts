import type { AnyRouter } from '../router/index.js';
import type { AnyHandler } from '../router/types/handler.js';
import type { AppRouterCompilerState } from '../types/compiler.js';
import { ASYNC_START, CTX, VAR_PREFIX } from './constants.js';
import { cacheExceptHandler, compileExceptHandlers, type ExceptHandlersState } from './handler.js';
import isAsync from './utils/isAsync.js';

export type CachedMiddlewareCompilationResult = [afterContext: string, beforeContext: string | null, isAsync: boolean, exceptRoutes: ExceptHandlersState];

// Compile and cache middleware compilation result
export function compileMiddlewares(router: AnyRouter, state: AppRouterCompilerState, prevValue: CachedMiddlewareCompilationResult): CachedMiddlewareCompilationResult {
  const externalValues = state.externalValues;

  // Clone exception routes
  const exceptRoutes = { ...prevValue[3] };
  for (let i = 0, routes = router.exceptRoutes, l = routes.length; i < l; i++) {
    const exception = routes[i][0];

    if (Array.isArray(exception))
      exceptRoutes[exception[1]] = cacheExceptHandler(true, routes[i][1], externalValues);
    else
      exceptRoutes[exception.id] = cacheExceptHandler(false, routes[i][1], externalValues);
  }
  const currentResult: CachedMiddlewareCompilationResult = [prevValue[0], prevValue[1], prevValue[2], exceptRoutes];

  // Set all except route
  if (typeof router.allExceptRoute !== 'undefined')
    exceptRoutes[0] = cacheExceptHandler(false, router.allExceptRoute.fn as unknown as AnyHandler, externalValues);

  for (let i = 0, list = router.middlewares, l = list.length; i < l; i++) {
    const middlewareData = list[i];
    const middlewareType = middlewareData[0];
    const fn = middlewareData[1];

    // Handle macros separately
    if (middlewareType === 0) {
      fn(currentResult, state);
      continue;
    }

    const isFnAsync = isAsync(fn);

    // Need context if fn has ctx argument or it is a parser or a setter
    const needContext = fn.length !== 0 || middlewareType === 1 || middlewareType === 4;

    // Wrap with an async context
    if (isFnAsync && !currentResult[2]) {
      // Create an async scope
      currentResult[0] += ASYNC_START;
      currentResult[2] = true;
    }

    if (needContext && currentResult[1] === null) {
      // Move the built part to prevContext
      currentResult[1] = currentResult[0];
      currentResult[0] = '';
    }

    const fnCall = `${isFnAsync ? 'await ' : ''}f${externalValues.push(fn) - 1}(${needContext ? CTX : ''});`;
    switch (middlewareType) {
      // Parsers
      case 1: {
        const resultId = state.localVarCount++;
        // Set the prop to the context (prop name must be an identifier)
        currentResult[0] += `let ${VAR_PREFIX}${resultId}=${fnCall}${compileExceptHandlers(exceptRoutes, `${VAR_PREFIX}${resultId}`, currentResult[2], currentResult[1] === null)}${CTX}.${middlewareData[2]}=v${resultId};`;
        break;
      }

      // Validators
      case 2: {
        const resultId = state.localVarCount++;
        currentResult[0] += `let ${VAR_PREFIX}${resultId}=${fnCall}${compileExceptHandlers(exceptRoutes, `${VAR_PREFIX}${resultId}`, currentResult[2], currentResult[1] === null)}`;
        break;
      }

      // Normal middlewares
      case 3:
        currentResult[0] += fnCall;
        break;

      // Setter
      case 4:
        currentResult[0] += `${CTX}.${middlewareData[2]}=${fnCall}`;
        break;
    }
  }

  return currentResult;
}

