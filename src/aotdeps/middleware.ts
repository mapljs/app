import type { AnyRouter } from '../router/index.js';
import type { AppCompilerState } from '../types/compiler.js';
import { buildExceptionHandlers } from './exceptions.js';
import type { MiddlewareState } from '../compiler/middleware.js';
import { isFunctionAsync } from '../compiler/utils.js';

const createContext = (currentResult: MiddlewareState): void => {
  if (currentResult[1] === null) {
    // Move the built part to prevContext
    currentResult[1] = '';
    currentResult[0] = '';

    // Reset the exception value
    currentResult[3] = null;
  }
};

export const createAsyncScope = (currentResult: MiddlewareState): void => {
  if (!currentResult[2]) {
    // Create an async scope
    currentResult[2] = true;

    // Reset the exception value
    currentResult[3] = null;
  }
};

export const setMinimumHolders = (currentResult: MiddlewareState, cnt: number): void => {
  currentResult[5] = Math.max(currentResult[5], cnt);
};

// Compile and cache middleware compilation result
export const compileMiddlewares = async (router: AnyRouter, appState: AppCompilerState, oldState: MiddlewareState): Promise<MiddlewareState> => {
  const externalValues = appState.externalValues;
  const newState = buildExceptionHandlers(oldState, router, externalValues);

  for (let i = 0, list = router.middlewares; i < list.length; i++) {
    const middlewareData = list[i];

    if (middlewareData[0] === 0) {
      let tmp: unknown = 'hash' in middlewareData[1]
        ? middlewareData[1].hash
        : middlewareData[1];

      // Hash checking stuff
      if (tmp !== null) {
        if (newState[6] === oldState[6])
          newState[6] = new Set(oldState[6]);

        if (newState[6].has(tmp)) continue;
        newState[6].add(tmp);
      }

      // Keep 1 single function only
      if (middlewareData[1].loadDeps)
        tmp = middlewareData[1].loadSource(middlewareData[1].options, newState, appState);

      if (tmp instanceof Promise) tmp = await tmp;
      continue;
    }

    if (middlewareData[0] === 5) {
      // Don't use spread if there's only one single header pair
      externalValues.push(middlewareData[1].length === 1 ? middlewareData[1][0] : middlewareData[1]);

      // Check whether the header pair has been initialized yet
      if (newState[1] === null)
        createContext(newState);

      continue;
    }

    // Create an async scope if necessary
    if (isFunctionAsync(middlewareData[1])) createAsyncScope(newState);

    // Need context if fn has ctx argument or it is a parser or a setter
    if (middlewareData[1].length !== 0 || middlewareData[0] === 1 || middlewareData[0] === 4) createContext(newState);

    // Add the handler
    externalValues.push(middlewareData[1]);

    // The output function call
    switch (middlewareData[0] as 1 | 2) {
      // Parsers
      case 1:
      case 2: {
        setMinimumHolders(newState, 1);
        // Pseudo exception value
        newState[3] ??= '';
        break;
      }

      // Other things doesn't need to change the context
      default:
        break;
    }
  }

  return newState;
};
