import type { AnyHandler } from '../router/types/handler.js';
import type { AppRouterCompilerState } from '../types/compiler.js';

import { buildStaticHandler, isFunctionAsync } from './utils.js';

// A cached function to build out handlers
type ExceptHandlerBuilder = (hasContext: boolean, isAsync: boolean) => string;
export type ExceptHandlerBuilders = Record<number, ExceptHandlerBuilder>;

// Build closures that generates exception content
export function buildHandler(isDynamic: boolean, handler: AnyHandler, externalValues: AppRouterCompilerState['externalValues']): ExceptHandlerBuilder {
  const handlerType = handler.type;

  // Static response
  if (handlerType === 'static') {
    // Lazily compile two cases
    let hasContextCase: string | null = null;
    let noContextCase: string | null = null;

    // eslint-disable-next-line
    return (hasContext) => hasContext
      ? hasContextCase ??= buildStaticHandler(handler, externalValues, null)
      : noContextCase ??= buildStaticHandler(handler, externalValues, false);
  }

  const fn = handler.fn;
  const fnNeedContext = fn.length > (isDynamic ? 1 : 0);

  // Return a raw Response
  if (handlerType === 'response') {
    const str = `return f${externalValues.push(fn)}${isDynamic
      ? fnNeedContext ? compilerConstants.PAYLOAD_CTX_ARG : compilerConstants.ONLY_PAYLOAD_ARG
      : fnNeedContext ? compilerConstants.ONLY_CTX_ARG : compilerConstants.NO_ARG};`;

    // eslint-disable-next-line
    return (hasContext) => !hasContext && fnNeedContext ? compilerConstants.TEXT_CTX_DEF + str : str;
  }

  const isFnAsync = isFunctionAsync(fn);

  // Cache known parts
  const retStart = `return new Response(${handlerType === 'json' ? 'JSON.stringify(' : ''}${isFnAsync ? 'await ' : ''}f${externalValues.push(fn)}${
    fnNeedContext ? isDynamic ? compilerConstants.PAYLOAD_CTX_ARG : compilerConstants.ONLY_CTX_ARG : compilerConstants.NO_ARG
  }${handlerType === 'json' ? ')' : ''}`;
  const retEnd = `${fnNeedContext ? compilerConstants.COLON_CTX : ''});`;

  // Build a closure to generate strings faster
  return (hasContext, isAsync) => {
    // Whether it is required to wrap the context in an async scope
    isAsync = !isAsync && isFnAsync;
    let result = isAsync ? compilerConstants.ASYNC_START : '';

    if (hasContext) {
      // Append correct content type headers
      if (handlerType === 'html')
        result += compilerConstants.SET_HTML_HEADER;
      else if (handlerType === 'json')
        result += compilerConstants.SET_JSON_HEADER;
    } else if (fnNeedContext)
      // Need to create a new context
      result += handlerType === 'text' ? compilerConstants.TEXT_CTX_DEF : handlerType === 'html' ? compilerConstants.HTML_CTX_DEF : compilerConstants.JSON_CTX_DEF;

    // Push the first return part
    result += retStart;

    if (!fnNeedContext) {
      // If we already have a context it should be passed
      // as the response option
      if (hasContext)
        result += compilerConstants.COLON_CTX;

      // Else pass the correct option for the expected content type
      else if (handlerType === 'html')
        result += compilerConstants.COLON_HTML_OPTIONS;
      else if (handlerType === 'json')
        result += compilerConstants.COLON_JSON_OPTIONS;
    }

    // End the return
    result += retEnd;

    // Wrap the scope if necessary
    if (isAsync)
      result += compilerConstants.ASYNC_END;

    return result;
  };
}

export function loadHandlers(builders: ExceptHandlerBuilders, hasContext: boolean, isAsync: boolean): string {
  let str = compilerConstants.EXCEPT_START;

  // Build all exceptions
  for (const id in builders) str += `case ${id}:{${builders[id](hasContext, isAsync)}}`;

  // Catch all
  return str + (typeof builders[0] === 'undefined' ? compilerConstants.DEFAULT_EXCEPT_END : `default:{${builders[0](hasContext, isAsync)}}}`);
}
