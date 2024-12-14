import type { AnyRouter } from '../router/index.js';
import type { AnyHandler } from '../router/types/handler.js';
import type { AppCompilerState } from '../types/compiler.js';

import { buildStaticHandler, isFunctionAsync, selectCtxDef, selectResOption, selectSetHeader } from './utils.js';

// A cached function to build out handlers
export type ExceptHandlerBuilder = (hasContext: boolean, isAsync: boolean) => string;
export type ExceptHandlerBuilders = Record<number, ExceptHandlerBuilder>;

// eslint-disable-next-line
const selectFnArgs = (isDynamic: boolean, fnNeedContext: boolean): string => isDynamic
  ? fnNeedContext ? compilerConstants.PAYLOAD_CTX_ARG : compilerConstants.ONLY_PAYLOAD_ARG
  : fnNeedContext ? compilerConstants.ONLY_CTX_ARG : compilerConstants.NO_ARG;

// Build closures that generates exception content
// eslint-disable-next-line
export const buildHandler = (isDynamic: boolean, handler: AnyHandler, externalValues: AppCompilerState['externalValues']): ExceptHandlerBuilder => {
  // Plain text
  if (typeof handler === 'function') {
    const isFnAsync = isFunctionAsync(handler);
    const fnNeedContext = handler.length > (isDynamic ? 1 : 0);

    const retStart = `return new Response(${isFnAsync ? 'await ' : ''}f${externalValues.push(handler)}${selectFnArgs(isDynamic, fnNeedContext)}`;
    const retEnd = `${fnNeedContext ? compilerConstants.COLON_CTX : ''});`;

    // Cache previous state
    let prevHasCtx: boolean;
    let prevFnAsync: boolean;
    let content = '';

    return (hasContext, isAsync) => {
      // If state changes
      if (isAsync !== prevFnAsync || hasContext !== prevHasCtx) {
        prevHasCtx = hasContext;
        prevFnAsync = isAsync;

        /* eslint-disable */
        // Wrap in async
        content = (!isAsync && isFnAsync ? compilerConstants.ASYNC_START : '') +
          // Add context
          (!hasContext && fnNeedContext ? compilerConstants.CTX_DEF : '')
          // Function call and stuff
          + retStart
          // Set response option
          + (!fnNeedContext && hasContext ? compilerConstants.COLON_CTX : '')
          // End the function call and Response
          + retEnd
          // End the function call and Response
          + (!isAsync && isFnAsync ? compilerConstants.ASYNC_END : '');
        /* eslint-enable */
      }

      return content;
    };
  }

  const handlerType = handler.type;

  // Static response
  if (handlerType === 'static') {
    // Lazily compile two cases
    let hasContextCase: string | undefined;
    let noContextCase: string | undefined;

    // eslint-disable-next-line
    return (hasContext) => hasContext
      ? hasContextCase ??= buildStaticHandler(handler.body, handler.options, externalValues, null)
      : noContextCase ??= buildStaticHandler(handler.body, handler.options, externalValues, false);
  }

  const fn = handler.fn;
  const fnNeedContext = fn.length > (isDynamic ? 1 : 0);

  // Return a raw Response
  if (handlerType === 'response') {
    const str = `return f${externalValues.push(fn)}${selectFnArgs(isDynamic, fnNeedContext)};`;

    // eslint-disable-next-line
    return (hasContext) => !hasContext && fnNeedContext ? compilerConstants.CTX_DEF + str : str;
  }

  const isFnAsync = isFunctionAsync(fn);

  // Cache known parts
  const retStart = `return new Response(${handlerType === 'json' ? 'JSON.stringify(' : ''}${isFnAsync ? 'await ' : ''}f${externalValues.push(fn)}${selectFnArgs(isDynamic, fnNeedContext)}${handlerType === 'json' ? ')' : ''}`;
  const retEnd = fnNeedContext ? `${compilerConstants.COLON_CTX});` : ');';

  // Cache previous values
  let prevHasCtx = false;
  let prevFnAsync: boolean | null = null;

  // Content cache
  let content = '';

  return (hasContext, isAsync) => {
    // If state changes
    if (isAsync !== prevFnAsync || hasContext !== prevHasCtx) {
      prevHasCtx = hasContext;
      prevFnAsync = isAsync;

      /* eslint-disable */
      // Wrap with async
      content = (!isAsync && isFnAsync ? compilerConstants.ASYNC_START : '')
        // Add context
        + (hasContext ? selectSetHeader(handlerType) : fnNeedContext ? selectCtxDef(handlerType) : '')
        // Function call and stuff
        + retStart
        // Set response option
        + (!fnNeedContext ? hasContext ? compilerConstants.COLON_CTX : selectResOption(handlerType) : '')
        // End the function call and Response
        + retEnd
        // End the function call and Response
        + (!isAsync && isFnAsync ? compilerConstants.ASYNC_END : '');
      /* eslint-enable */
    }

    return content;
  };
};

// eslint-disable-next-line
export const loadExceptionHandlers = (builders: ExceptHandlerBuilders, hasContext: boolean, isAsync: boolean): string => {
  let str = compilerConstants.EXCEPT_START;

  // Build all exceptions
  for (const id in builders) {
    if (id !== '0')
      str += `case ${id}:{${builders[id](hasContext, isAsync)}}`;
  }

  // Catch all
  return str + (typeof builders[0] === 'undefined' ? compilerConstants.DEFAULT_EXCEPT_END : `default:{${builders[0](hasContext, isAsync)}}}`);
};

// Load new exception handlers
// eslint-disable-next-line
export const buildExceptionHandlers = (prevValue: ExceptHandlerBuilders, router: AnyRouter, externalValues: AppCompilerState['externalValues']): ExceptHandlerBuilders => {
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
};
