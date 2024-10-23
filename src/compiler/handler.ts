import type { AnyHandler } from '../router/types/handler.js';
import type { AppRouterCompilerState } from '../types/compiler.js';
import { CTX, CTX_DEF, SET_HTML_HEADER, SET_JSON_HEADER, ASYNC_START, ASYNC_END, CTX_PARAMS_DEF, TEXT_HEADER_DEF, HTML_HEADER_DEF, JSON_HEADER_DEF, COLON_HTML_OPTIONS, COLON_JSON_OPTIONS } from './constants.js';
import { buildStaticHandler, isFunctionAsync } from './utils.js';

/**
 * Compile a handler. This is a fast path for handlers that doesn't need recompilation
 */
export function compileHandler(
  handler: AnyHandler,
  externalValues: AppRouterCompilerState['externalValues'],

  previouslyAsync: boolean,
  contextNeedParam: boolean | null
): string {
  const handlerType = handler.type;

  // Build static response
  if (handlerType === 'static')
    return buildStaticHandler(handler, externalValues, contextNeedParam);

  const fn = handler.fn;
  const fnNeedContext = fn.length !== 0;

  // Return a raw Response
  if (handlerType === 'response')
    return `return f${externalValues.push(fn)}(${fnNeedContext ? CTX : ''});`;

  const isFnAsync = isFunctionAsync(fn);
  const wrapAsync = isFnAsync && !previouslyAsync;

  let fnResult = `${isFnAsync ? 'await ' : ''}f${externalValues.push(fn)}(${fnNeedContext ? CTX : ''})`;
  if (handlerType === 'json')
    fnResult = `JSON.stringify(${fnResult})`;

  return contextNeedParam === null
    ? `${handlerType === 'text' ? '' : handlerType === 'html' ? SET_HTML_HEADER : SET_JSON_HEADER}return${wrapAsync ? '(async()=>' : ' '}new Response(${fnResult},${CTX})${wrapAsync ? ')();' : ';'}`
    : fnNeedContext
      ? `${wrapAsync ? ASYNC_START : ''}${handlerType === 'text' ? TEXT_HEADER_DEF : handlerType === 'html' ? HTML_HEADER_DEF : JSON_HEADER_DEF}${contextNeedParam ? CTX_PARAMS_DEF : CTX_DEF}return new Response(${fnResult},${CTX});${wrapAsync ? ASYNC_END : ''}`
      : `return${wrapAsync ? '(async()=>' : ' '}new Response(${fnResult}${handlerType === 'text' ? '' : handlerType === 'html' ? COLON_HTML_OPTIONS : COLON_JSON_OPTIONS})${wrapAsync ? ')();' : ';'}`;
}
