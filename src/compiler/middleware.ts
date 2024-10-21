import type { AnyRouter } from '../router/index.js';
import type { AppRouterCompilerState } from '../types/compiler.js';
import { ASYNC_START, CREATE_EMPTY_HEADER, CREATE_HOLDER, CTX, HOLDER } from './constants.js';
import { buildHandler, loadHandlers, type ExceptHandlerBuilders } from './exceptions.js';
import { isFunctionAsync } from './utils.js';

export type CachedMiddlewareCompilationResult = [
  afterContext: string,
  beforeContext: string | null,

  isAsync: boolean,
  hasPlaceholder: boolean,

  exceptRoutes: ExceptHandlerBuilders,
  builtExceptContent: string | null
];

// Load new exceptions
export function loadNewExceptions(prevValue: ExceptHandlerBuilders, router: AnyRouter, externalValues: any[]): ExceptHandlerBuilders {
  const routes = router.exceptRoutes;
  const allExceptRoute = router.allExceptRoute;

  // No new routes have been set
  if (routes.length === 0 && typeof allExceptRoute === 'undefined') return prevValue;

  const newRoutes = { ...prevValue };
  for (let i = 0, l = routes.length; i < l; i++) {
    const exception = routes[i][0];

    if (Array.isArray(exception))
      newRoutes[exception[1]] = buildHandler(false, routes[i][1], externalValues);
    else
      newRoutes[exception.id] = buildHandler(true, routes[i][1], externalValues);
  }

  // Set all except route
  if (typeof allExceptRoute !== 'undefined')
    newRoutes[0] = buildHandler(false, allExceptRoute, externalValues);

  return newRoutes;
}

// Compile and cache middleware compilation result
export function compileMiddlewares(router: AnyRouter, state: AppRouterCompilerState, prevValue: CachedMiddlewareCompilationResult): CachedMiddlewareCompilationResult {
  const externalValues = state.externalValues;

  const exceptRoutes = loadNewExceptions(prevValue[4], router, externalValues);
  const currentResult: CachedMiddlewareCompilationResult = [
    prevValue[0],
    prevValue[1],
    prevValue[2],
    prevValue[3],
    exceptRoutes,
    // If the exception content doesn't change then keep the original value
    prevValue[4] === exceptRoutes ? prevValue[5] : null
  ];

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

      // Reset the exception value
      currentResult[5] = null;
    }

    if (needContext && currentResult[1] === null) {
      // Move the built part to prevContext
      currentResult[1] = currentResult[0] + CREATE_EMPTY_HEADER;
      currentResult[0] = '';

      // Reset the exception value
      currentResult[5] = null;
    }

    const fnCall = `${isFnAsync ? 'await ' : ''}f${externalValues.push(fn) - 1}(${needContext ? CTX : ''});`;
    switch (middlewareType) {
      // Parsers
      case 1: {
        // Set the prop to the context (prop name must be an identifier)
        currentResult[0] += `${currentResult[3] ? HOLDER : CREATE_HOLDER}=${fnCall}${
          // Use the old value if it exists
          currentResult[5] ??= loadHandlers(exceptRoutes, currentResult[1] === null, currentResult[2])
        }${CTX}.${middlewareData[2]}=${HOLDER};`;

        // Recognize the new placeholder
        currentResult[3] = true;
        break;
      }

      // Validators
      case 2: {
        currentResult[0] += `${currentResult[3] ? HOLDER : CREATE_HOLDER}=${fnCall}${
          // Use the old value if it exists
          currentResult[5] ??= loadHandlers(exceptRoutes, currentResult[1] === null, currentResult[2])
        }`;

        // Recognize the new placeholder
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
