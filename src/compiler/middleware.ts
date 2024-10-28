import type { AnyRouter } from '../router/index.js';
import type { AppRouterCompilerState } from '../types/compiler.js';
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
export function loadNewExceptions(prevValue: ExceptHandlerBuilders, router: AnyRouter, externalValues: AppRouterCompilerState['externalValues']): ExceptHandlerBuilders {
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

    if (middlewareData[0] === 0) {
      // Handle macros separately
      middlewareData[1](currentResult, state);
      continue;
    } else if (middlewareData[0] === 5) {
      // Handle headers
      if (currentResult[1] === null) {
        // Move the built part to prevContext
        currentResult[1] = `${currentResult[0]}let ${compilerConstants.HEADERS}=[${middlewareData[1].length === 1
          ? externalValues.push(middlewareData[1][0])
          : `...${externalValues.push(middlewareData[1])}`
        }];`;
        currentResult[0] = '';

        // Reset the exception value
        currentResult[5] = null;
      } else
        // Just push
        currentResult[0] += `${compilerConstants.HEADERS}.push(...${externalValues.push(middlewareData[1])});`;
      continue;
    }

    const isFnAsync = isFunctionAsync(middlewareData[1]);

    // Need context if fn has ctx argument or it is a parser or a setter
    const needContext = middlewareData[1].length !== 0 || middlewareData[0] === 1 || middlewareData[0] === 4;

    // Wrap with an async context
    if (isFnAsync && !currentResult[2]) {
      // Create an async scope
      currentResult[0] += compilerConstants.ASYNC_START;
      currentResult[2] = true;

      // Reset the exception value
      currentResult[5] = null;
    }

    if (needContext && currentResult[1] === null) {
      // Move the built part to prevContext
      currentResult[1] = currentResult[0] + compilerConstants.TEXT_HEADER_DEF;
      currentResult[0] = '';

      // Reset the exception value
      currentResult[5] = null;
    }

    const fnCall = `${isFnAsync ? 'await ' : ''}f${externalValues.push(middlewareData[1])}(${needContext ? compilerConstants.CTX : ''});`;
    switch (middlewareData[0]) {
      // Parsers
      case 1: {
        // Set the prop to the context (prop name must be an identifier)
        currentResult[0] += `${currentResult[3] ? compilerConstants.HOLDER : compilerConstants.CREATE_HOLDER}=${fnCall}${
          // Use the old value if it exists
          currentResult[5] ??= loadHandlers(exceptRoutes, currentResult[1] === null, currentResult[2])
        }${compilerConstants.CTX}.${middlewareData[2]}=${compilerConstants.HOLDER};`;

        // Recognize the new placeholder
        currentResult[3] = true;
        break;
      }

      // Validators
      case 2: {
        currentResult[0] += `${currentResult[3] ? compilerConstants.HOLDER : compilerConstants.CREATE_HOLDER}=${fnCall}${
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
        currentResult[0] += `${compilerConstants.CTX}.${middlewareData[2]}=${fnCall}`;
        break;
    }
  }

  return currentResult;
}
