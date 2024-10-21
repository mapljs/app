import type { AnyRouter } from '../router/index.js';
import type { AppRouterCompilerState } from '../types/compiler.js';
import { ASYNC_START, CREATE_EMPTY_HEADER, CREATE_HOLDER, CTX, HOLDER } from './constants.js';
import { buildHandler, loadHandlers, type ExceptHandlerBuilders } from './exceptions.js';
import { isFunctionAsync } from './utils.js';

export type CachedMiddlewareCompilationResult = [afterContext: string, beforeContext: string | null, isAsync: boolean, hasPlaceholder: boolean, exceptRoutes: ExceptHandlerBuilders];

// Compile and cache middleware compilation result
export function compileMiddlewares(router: AnyRouter, state: AppRouterCompilerState, prevValue: CachedMiddlewareCompilationResult): CachedMiddlewareCompilationResult {
  const externalValues = state.externalValues;

  // Clone exception routes
  const exceptRoutes = { ...prevValue[4] };
  for (let i = 0, routes = router.exceptRoutes, l = routes.length; i < l; i++) {
    const exception = routes[i][0];

    if (Array.isArray(exception))
      exceptRoutes[exception[1]] = buildHandler(false, routes[i][1], externalValues);
    else
      exceptRoutes[exception.id] = buildHandler(true, routes[i][1], externalValues);
  }

  // Create a new cache store
  const currentResult: CachedMiddlewareCompilationResult = [prevValue[0], prevValue[1], prevValue[2], prevValue[3], exceptRoutes];

  // Set all except route
  if (typeof router.allExceptRoute !== 'undefined')
    exceptRoutes[0] = buildHandler(false, router.allExceptRoute, externalValues);

  for (let i = 0, list = router.middlewares, l = list.length; i < l; i++) {
    const middlewareData = list[i];
    const middlewareType = middlewareData[0];
    const fn = middlewareData[1];

    // Handle macros separately
    if (middlewareType === 0) {
      fn(currentResult, state);
      continue;
    }

    const isFnAsync = isFunctionAsync(fn);

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
      currentResult[1] = currentResult[0] + CREATE_EMPTY_HEADER;
      currentResult[0] = '';
    }

    const fnCall = `${isFnAsync ? 'await ' : ''}f${externalValues.push(fn) - 1}(${needContext ? CTX : ''});`;
    switch (middlewareType) {
      // Parsers
      case 1: {
        // Set the prop to the context (prop name must be an identifier)
        currentResult[0] += `${currentResult[3] ? HOLDER : CREATE_HOLDER}=${fnCall}${
          loadHandlers(exceptRoutes, currentResult[1] === null, currentResult[2])
        }${CTX}.${middlewareData[2]}=${HOLDER};`;

        currentResult[3] = true;
        break;
      }

      // Validators
      case 2: {
        currentResult[0] += `${currentResult[3] ? HOLDER : CREATE_HOLDER}=${fnCall}${
          loadHandlers(exceptRoutes, currentResult[1] === null, currentResult[2])
        }`;

        currentResult[3] = true;
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
