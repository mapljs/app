import type { AnyRouter } from '../router/index.js';
import type { AnyHandler } from '../router/types/handler.js';
import type { AppRouterCompilerState } from '../types/compiler.js';
import { CTX, CTX_DEF, CTX_END, VAR_PREFIX } from './constants.js';
import { cacheExceptHandler, compileExceptHandlers, type ExceptHandlersState } from './handler.js';
import isAsync from './utils/isAsync.js';

export type CachedMiddlewareCompilationResult = [afterContext: string, beforeContext: string | null, isAsync: boolean, exceptRoutes: ExceptHandlersState];

// Compile and cache middleware compilation result
export function compileMiddlewares(router: AnyRouter, state: AppRouterCompilerState, prevValue: CachedMiddlewareCompilationResult): CachedMiddlewareCompilationResult {
  let requireAsync = prevValue[2];
  let requireContext = prevValue[1] !== null;
  // Save the string part before context creation
  let prevContext = requireContext ? prevValue[1] : null;
  let builder = prevValue[0];

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

  // Set all except route
  if (typeof router.allExceptRoute !== 'undefined')
    exceptRoutes[0] = cacheExceptHandler(false, router.allExceptRoute.fn as unknown as AnyHandler, externalValues);

  for (let i = 0, list = router.middlewares, l = list.length; i < l; i++) {
    const middlewareData = list[i];
    const fn = middlewareData[1];

    const isFnAsync = isAsync(fn);
    const needContext = fn.length !== 0;

    // Wrap with an async context
    if (isFnAsync && !requireAsync)
      // Create an async scope
      builder += 'return (async()=>{';

    if (needContext && !requireContext) {
      // Move the built part to prevContext
      prevContext = `${builder}${CTX_DEF},headers:[]`;
      builder = CTX_END;
    }

    // TODO: Handle
    requireAsync ||= isFnAsync;
    requireContext ||= needContext;

    const fnCall = `${isFnAsync ? 'await ' : ''}f${externalValues.push(fn) - 1}(${needContext ? CTX : ''});`;
    switch (middlewareData[0]) {
      // Parsers
      case 1: {
        const resultId = state.localVarCount++;
        // Set the prop to the context (prop name must be an identifier)
        builder += `const ${VAR_PREFIX}${resultId}=${fnCall}${compileExceptHandlers(exceptRoutes, `${VAR_PREFIX}${resultId}`, requireAsync, requireContext)}c.${middlewareData[2]}=v${resultId};`;
        break;
      }

      // Validators
      case 2: {
        const resultId = state.localVarCount++;
        builder += `const ${VAR_PREFIX}${resultId}=${fnCall}${compileExceptHandlers(exceptRoutes, `${VAR_PREFIX}${resultId}`, requireAsync, requireContext)}`;
        break;
      }

      // Normal middlewares
      case 3: {
        builder += fnCall;
        break;
      }
    }
  }

  return [builder, prevContext, requireAsync, exceptRoutes];
}

