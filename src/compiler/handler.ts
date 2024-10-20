import type { AnyHandler } from '../router/types/handler.js';
import { HTML_HEADER_PAIR, HTML_OPTIONS, JSON_HEADER_PAIR, JSON_OPTIONS, CTX, CTX_END, CTX_DEF, CTX_PARAM_DEF, HEADERS, SET_HTML_HEADER, SET_JSON_HEADER, ASYNC_START, ASYNC_END } from './constants.js';
import { buildStaticHandler, isFunctionAsync } from './utils.js';

const LIGHT_ASYNC_START = '(async()=>';
const LIGHT_ASYNC_END = ')();';

/**
 * Compile a handler. This is a fast path for handlers that doesn't need recompilation
 */
export function compileHandler(
  handler: AnyHandler,
  externalValues: any[],

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
    return `return f${externalValues.push(fn) - 1}(${fnNeedContext ? CTX : ''});`;

  const isFnAsync = isFunctionAsync(fn);
  const wrapAsync = isFnAsync && !previouslyAsync;

  const fnCall = `${isFnAsync ? 'await ' : ''}f${externalValues.push(fn) - 1}(${fnNeedContext ? CTX : ''})`;

  // Choose the correct wrapper
  const fnResult = handlerType === 'text' || handlerType === 'html' ? fnCall : `JSON.stringify(${fnCall})`;

  return contextNeedParam === null
    ? `${handlerType === 'text' ? '' : handlerType === 'html' ? SET_HTML_HEADER : SET_JSON_HEADER}return${wrapAsync ? LIGHT_ASYNC_START : ' '}new Response(${fnResult},${CTX})${wrapAsync ? LIGHT_ASYNC_END : ';'}`
    : fnNeedContext
      ? `${wrapAsync ? ASYNC_START : ''}let ${HEADERS}=[${handlerType === 'text' ? '' : handlerType === 'html' ? HTML_HEADER_PAIR : JSON_HEADER_PAIR}];${CTX_DEF}${contextNeedParam ? CTX_PARAM_DEF : ''}${CTX_END}return new Response(${fnResult},${CTX});${wrapAsync ? ASYNC_END : ''}`
      : `return${wrapAsync ? LIGHT_ASYNC_START : ' '}new Response(${fnResult}${handlerType === 'text' ? '' : `,${handlerType === 'html' ? HTML_OPTIONS : JSON_OPTIONS}`})${wrapAsync ? LIGHT_ASYNC_END : ';'}`;
}
