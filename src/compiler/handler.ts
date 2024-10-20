import type { AnyHandler } from '../router/types/handler.js';
import type { AppRouterCompilerState } from '../types/compiler.js';
import { HTML_HEADER_PAIR, HTML_OPTIONS, JSON_HEADER_PAIR, JSON_OPTIONS, CTX, CTX_END, CTX_DEF, CTX_PARAM_DEF, HEADERS, SET_HTML_HEADER, SET_JSON_HEADER, ASYNC_START } from './constants.js';
import { isFunctionAsync } from './utils.js';

/**
 * Compile a handler. This is a fast path for handlers that doesn't need recompilation
 */
export function compileHandler(
  handler: AnyHandler,
  externalValues: AppRouterCompilerState['externalValues'],

  previouslyAsync: boolean,
  contextNeedParam: boolean | null
): string {
  const fn = handler.fn;
  const handlerType = handler.type;

  const isFnAsync = isFunctionAsync(fn);
  const wrapAsync = isFnAsync && !previouslyAsync;
  const fnNeedContext = fn.length !== 0;

  const fnCall = `${isFnAsync ? 'await ' : ''}f${externalValues.push(fn) - 1}(${fnNeedContext ? CTX : ''})`;

  // Choose the correct wrapper
  const fnResult = handlerType === 'text' || handlerType === 'html' ? fnCall : `JSON.stringify(${fnCall})`;

  return contextNeedParam === null
    ? `${handlerType === 'text' ? '' : handlerType === 'html' ? SET_HTML_HEADER : SET_JSON_HEADER}return${wrapAsync ? '(async()=>' : ' '}new Response(${fnResult},${CTX})${wrapAsync ? ')' : ''};`
    : fnNeedContext
      ? `${wrapAsync ? ASYNC_START : ''}let ${HEADERS}=[${handlerType === 'text' ? '' : handlerType === 'html' ? HTML_HEADER_PAIR : JSON_HEADER_PAIR}];${CTX_DEF}${contextNeedParam ? CTX_PARAM_DEF : ''}${CTX_END}return new Response(${fnResult},${CTX})${wrapAsync ? ';})' : ''};`
      : `return${wrapAsync ? '(async()=>' : ' '}new Response(${fnResult}${handlerType === 'text' ? '' : `,${handlerType === 'html' ? HTML_OPTIONS : JSON_OPTIONS}`})${wrapAsync ? ')' : ''};`;
}
