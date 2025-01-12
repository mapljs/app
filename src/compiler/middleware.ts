import { HOLDER_PREFIX } from '../constants.js';
import type { AnyRouter } from '../router/index.js';
import type { AppCompilerState } from '../types/compiler.js';
import { buildExceptionHandlers, loadExceptionHandlers, type ExceptHandlerBuilders } from './exceptions.js';
import { isFunctionAsync } from './utils.js';

export type MiddlewareState = [
  afterContext: string,
  beforeContext: string | null,

  isAsync: boolean,
  builtExceptContent: string | null,

  exceptRoutes: ExceptHandlerBuilders,
  holders: number,

  actions: Set<unknown>
];

export const createAsyncScope = (currentResult: MiddlewareState): void => {
  if (!currentResult[2]) {
    // Create an async scope
    currentResult[0] += compilerConstants.ASYNC_START;
    currentResult[2] = true;

    // Reset the exception value
    currentResult[3] = null;
  }
};

export const createContext = (currentResult: MiddlewareState, headers: string): void => {
  if (currentResult[1] === null) {
    // Move the built part to prevContext
    currentResult[1] = currentResult[0] + headers;
    currentResult[0] = '';

    // Reset the exception value
    currentResult[3] = null;
  }
};

export const setMinimumHolders = (currentResult: MiddlewareState, cnt: number): void => {
  if (currentResult[5] < cnt) {
    let cur = currentResult[5];
    currentResult[0] += `let ${HOLDER_PREFIX}${cur}`;
    cur++;

    while (cur < cnt) {
      currentResult[0] += `,${HOLDER_PREFIX}${cur}`;
      cur++;
    }

    currentResult[0] += ';';
    currentResult[5] = cnt;
  }
};

export const createEmptyContext = (currentResult: MiddlewareState): void => {
  createContext(currentResult, compilerConstants.HEADER_DEF);
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

      tmp = middlewareData[1].loadSource(middlewareData[1].options, newState, appState);
      if (tmp instanceof Promise) tmp = await tmp;
      continue;
    }

    if (middlewareData[0] === 5) {
      // Don't use spread if there's only one single header pair
      const headersToAppend = middlewareData[1].length === 1
        // eslint-disable-next-line
        ? 'f' + externalValues.push(middlewareData[1][0])
        // eslint-disable-next-line
        : '...f' + externalValues.push(middlewareData[1]);

      // Check whether the header pair has been initialized yet
      if (newState[1] === null)
        createContext(newState, `let ${compilerConstants.HEADERS}=[${headersToAppend}];`);
      else
        newState[0] += `${compilerConstants.HEADERS}.push(${headersToAppend});`;
      continue;
    }

    // Create an async scope if necessary
    const isFnAsync = isFunctionAsync(middlewareData[1]);
    if (isFnAsync) createAsyncScope(newState);

    // Need context if fn has ctx argument or it is a parser or a setter
    const needContext = middlewareData[1].length !== 0 || middlewareData[0] === 1 || middlewareData[0] === 4;
    if (needContext) createEmptyContext(newState);

    // The output function call
    const fnCall = `${isFnAsync ? 'await ' : ''}f${externalValues.push(middlewareData[1])}(${needContext ? compilerConstants.CTX : ''});`;
    switch (middlewareData[0]) {
      // Parsers
      case 1: {
        setMinimumHolders(newState, 1);

        // Set the prop to the context (prop name must be an identifier)
        newState[0] += `${compilerConstants.HOLDER_0}=${fnCall}${
          // Use the old value if it exists
          newState[3] ??= loadExceptionHandlers(newState[4], newState[1] === null, newState[2])
        }${compilerConstants.CTX}.${middlewareData[2]}=${compilerConstants.HOLDER_0};`;
        break;
      }

      // Validators
      case 2: {
        setMinimumHolders(newState, 1);

        newState[0] += `${compilerConstants.HOLDER_0}=${fnCall}${
          // Use the old value if it exists
          newState[3] ??= loadExceptionHandlers(newState[4], newState[1] === null, newState[2])
        }`;
        break;
      }

      // Normal middlewares
      case 3:
        newState[0] += fnCall;
        break;

      // Setter
      case 4:
        newState[0] += `${compilerConstants.CTX}.${middlewareData[2]}=${fnCall}`;
        break;
    }
  }

  return newState;
};
