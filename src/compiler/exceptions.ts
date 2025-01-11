import type { AnyRouter } from '../router/index.js';
import type { AnyHandler, AnyTypedHandler, StaticHandler } from '../router/types/handler.js';
import type { AppCompilerState } from '../types/compiler.js';
import type { MiddlewareState } from './middleware.js';

import { buildStaticHandler, isFunctionAsync, selectCtxDef, selectResOption, selectSetHeader } from './utils.js';

// A cached function to build out handlers
export type ExceptHandlerBuilder = (hasContext: boolean, isAsync: boolean) => string;
export type ExceptHandlerBuilders = Record<number, ExceptHandlerBuilder>;

const selectFnArgIfNeeded = (isDynamic: boolean, fnNeedContext: boolean): string => isDynamic
  ? fnNeedContext ? compilerConstants.PAYLOAD_CTX_ARG : compilerConstants.ONLY_PAYLOAD_ARG
  : fnNeedContext ? compilerConstants.ONLY_CTX_ARG : compilerConstants.NO_ARG;

// Build closures that generates exception content
export const buildHandler = (isDynamic: boolean, handler: AnyHandler, externalValues: AppCompilerState['externalValues']): ExceptHandlerBuilder => {
  let handlerType: AnyTypedHandler['type'] | 'static';
  let fn: AnyTypedHandler['fn'];

  // Plain text
  if (typeof handler === 'function') {
    handlerType = 'buffer';
    fn = handler;
  } else {
    handlerType = handler.type;

    // Static response
    if (handlerType === 'static') {
      // Lazily compile two cases
      const hasContextCase: string = buildStaticHandler((handler as StaticHandler).body, (handler as StaticHandler).options, externalValues, null);
      const noContextCase: string = buildStaticHandler((handler as StaticHandler).body, (handler as StaticHandler).options, externalValues, false);

      return (hasContext) => hasContext ? hasContextCase : noContextCase;
    }

    fn = (handler as AnyTypedHandler).fn;
  }

  const fnNeedContext = fn.length > (isDynamic ? 1 : 0);

  // Return a raw Response
  if (handlerType === 'plain') {
    const str = `return f${externalValues.push(fn)}${selectFnArgIfNeeded(isDynamic, fnNeedContext)};`;
    return (hasContext) => !hasContext && fnNeedContext ? compilerConstants.CTX_DEF + str : str;
  }

  const isFnAsync = isFunctionAsync(fn);

  // Cache known parts
  const retStart = `return new Response(${handlerType === 'json' ? 'JSON.stringify(' : ''}${isFnAsync ? 'await ' : ''}f${externalValues.push(fn)}${selectFnArgIfNeeded(isDynamic, fnNeedContext)}${handlerType === 'json' ? ')' : ''}`;
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
export const buildExceptionHandlers = (prevState: MiddlewareState, router: AnyRouter, externalValues: AppCompilerState['externalValues']): MiddlewareState => {
  const routes = router.exceptRoutes;
  const allExceptRoute = router.allExceptRoute;

  // No new routes have been set
  if (routes.length === 0 && typeof allExceptRoute === 'undefined')
    return [...prevState];

  const newRoutes = { ...prevState[4] };
  for (let i = 0; i < routes.length; i++) {
    const exception = routes[i][0];

    if (Array.isArray(exception))
      newRoutes[exception[1]] = buildHandler(false, routes[i][1], externalValues);
    else
      newRoutes[exception(null)[1]] = buildHandler(true, routes[i][1], externalValues);
  }

  // Set all except route
  if (typeof allExceptRoute !== 'undefined')
    newRoutes[0] = buildHandler(false, allExceptRoute, externalValues);

  // Reset exception content and set the new list of exceptions
  const newState = prevState.with(4, newRoutes) as MiddlewareState;
  newState[3] = null;
  return newState;
};
