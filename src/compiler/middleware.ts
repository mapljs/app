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

  // Set is slower for most small cases
  macroHashes: unknown[]
];

// eslint-disable-next-line
export const createAsyncScope = (currentResult: MiddlewareState): void => {
  if (!currentResult[2]) {
    // Create an async scope
    currentResult[0] += compilerConstants.ASYNC_START;
    currentResult[2] = true;

    // Reset the exception value
    currentResult[3] = null;
  }
};

// eslint-disable-next-line
export const createContext = (currentResult: MiddlewareState, headers: string): void => {
  if (currentResult[1] === null) {
    // Move the built part to prevContext
    currentResult[1] = currentResult[0] + headers;
    currentResult[0] = '';

    // Reset the exception value
    currentResult[3] = null;
  }
};

// eslint-disable-next-line
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

// eslint-disable-next-line
export const createEmptyContext = (currentResult: MiddlewareState): void => {
  createContext(currentResult, compilerConstants.HEADER_DEF);
};

// Compile and cache middleware compilation result
// eslint-disable-next-line
export const compileMiddlewares = async (router: AnyRouter, state: AppCompilerState, prevValue: MiddlewareState): Promise<MiddlewareState> => {
  const externalValues = state.externalValues;

  const exceptRoutes = buildExceptionHandlers(prevValue[4], router, externalValues);
  const macroHashes = [...prevValue[6]];

  const currentResult: MiddlewareState = [
    prevValue[0],
    prevValue[1],
    prevValue[2],
    // If the exception content doesn't change then keep the original value
    prevValue[4] === exceptRoutes ? prevValue[3] : null,
    exceptRoutes,
    prevValue[5],
    macroHashes
  ];

  for (let i = 0, list = router.middlewares, l = list.length; i < l; i++) {
    const middlewareData = list[i];

    if (middlewareData[0] === 0) {
      // Hash checking stuff
      if (middlewareData[1].hash != null) {
        if (macroHashes.includes(middlewareData[1].hash)) continue;
        macroHashes.push(middlewareData[1].hash);
      }

      // eslint-disable-next-line
      await middlewareData[1].loadSource(middlewareData[1].options, currentResult, state);
      continue;
    }

    if (middlewareData[0] === 5) {
      // Don't use spread if there's only one single header pair
      const headersToAppend = middlewareData[1].length === 1
        ? externalValues.push(middlewareData[1][0])
        // eslint-disable-next-line
        : '...' + externalValues.push(middlewareData[1]);

      // Check whether the header pair has been initialized yet
      if (currentResult[1] === null)
        createContext(currentResult, `let ${compilerConstants.HEADERS}=[f${headersToAppend}];`);
      else
        currentResult[0] += `${compilerConstants.HEADERS}.push(f${headersToAppend});`;
      continue;
    }

    // Create an async scope if necessary
    const isFnAsync = isFunctionAsync(middlewareData[1]);
    if (isFnAsync) createAsyncScope(currentResult);

    // Need context if fn has ctx argument or it is a parser or a setter
    const needContext = middlewareData[1].length !== 0 || middlewareData[0] === 1 || middlewareData[0] === 4;
    if (needContext) createEmptyContext(currentResult);

    // The output function call
    const fnCall = `${isFnAsync ? 'await ' : ''}f${externalValues.push(middlewareData[1])}(${needContext ? compilerConstants.CTX : ''});`;
    switch (middlewareData[0]) {
      // Parsers
      case 1: {
        setMinimumHolders(currentResult, 1);

        // Set the prop to the context (prop name must be an identifier)
        currentResult[0] += `${compilerConstants.HOLDER_0}=${fnCall}${
          // Use the old value if it exists
          currentResult[3] ??= loadExceptionHandlers(exceptRoutes, currentResult[1] === null, currentResult[2])
        }${compilerConstants.CTX}.${middlewareData[2]}=${compilerConstants.HOLDER_0};`;
        break;
      }

      // Validators
      case 2: {
        setMinimumHolders(currentResult, 1);

        currentResult[0] += `${compilerConstants.HOLDER_0}=${fnCall}${
          // Use the old value if it exists
          currentResult[3] ??= loadExceptionHandlers(exceptRoutes, currentResult[1] === null, currentResult[2])
        }`;
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
};
