import type { AnyRouter } from '../router/index.js';
import type { AppCompilerState } from '../types/compiler.js';
import { buildExceptionHandlers, loadExceptionHandlers } from './exceptions.js';
import type { CachedMiddlewareCompilationResult } from '../compiler/middleware.js';
import { isFunctionAsync } from '../compiler/utils.js';

// eslint-disable-next-line
const createContext = (currentResult: CachedMiddlewareCompilationResult): void => {
  if (currentResult[1] === null) {
    // Move the built part to prevContext
    currentResult[1] = '';
    currentResult[0] = '';

    // Reset the exception value
    currentResult[5] = null;
  }
};

// Compile and cache middleware compilation result
// eslint-disable-next-line
export const compileMiddlewares = (router: AnyRouter, state: AppCompilerState, prevValue: CachedMiddlewareCompilationResult): CachedMiddlewareCompilationResult => {
  const externalValues = state.externalValues;

  const exceptRoutes = buildExceptionHandlers(prevValue[4], router, externalValues);
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
      // Run macros separately
      middlewareData[1](currentResult, state);
      continue;
    } else if (middlewareData[0] === 5) {
      externalValues.push(middlewareData[1].length === 1 ? middlewareData[1][0] : middlewareData[1]);
      createContext(currentResult);
      continue;
    }

    // Create an async scope if necessary
    if (isFunctionAsync(middlewareData[1]) && !currentResult[2]) {
      // Create an async scope
      currentResult[2] = true;

      // Reset the exception value
      currentResult[5] = null;
    }

    if (middlewareData[1].length !== 0 || middlewareData[0] === 1 || middlewareData[0] === 4) createContext(currentResult);

    // The output function call
    externalValues.push(middlewareData[1]);
    switch (middlewareData[0]) {
      // Parsers and validators need exceptions
      case 1:
      case 2: {
        currentResult[5] ??= loadExceptionHandlers(exceptRoutes, currentResult[1] === null, currentResult[2]);
        break;
      }

      default: break;
    }
  }

  return currentResult;
};
