import type { AnyHandler } from '../router/types/handler';
import type { AppRouterCompilerState } from '../types/compiler';
import { HTML_HEADER_PAIR, HTML_OPTIONS, JSON_HEADER_PAIR, JSON_OPTIONS, CTX, CTX_END, CTX_DEF, EXCEPT_SYMBOL, RESPONSE_400 } from './constants';
import isAsync from './utils/isAsync';

// 0 is catchAll btw
export type CachedHandlerState = [isFnAsync: boolean, fnNeedContext: boolean, fnId: number, handlerType: string];
export type ExceptHandlersState = Record<number, [...CachedHandlerState, isStatic: boolean]>;
export type CompiledExceptHandlers = Record<number, string>;

/**
 * Compile non-macro handler
 */
export function compileHandler(
  isFnAsync: boolean,
  fnNeedContext: boolean,
  fnId: number,
  handlerType: string,

  firstArg: string | null,

  previouslyAsync: boolean,
  contextPayload: string | null
): string {
  const fnCall = `${isFnAsync ? 'await ' : ''}f${fnId}(${fnNeedContext
    ? firstArg === null ? CTX : `${firstArg},${CTX}`
    : firstArg ?? ''})`;

  // Choose the correct wrapper
  const fnResult = handlerType === 'text' || handlerType === 'html' ? fnCall : `JSON.stringify(${fnCall})`;

  return contextPayload === null
    ? `${handlerType === 'text' ? '' : `${CTX}.headers.push(${handlerType === 'html' ? HTML_HEADER_PAIR : JSON_HEADER_PAIR});`}return${!previouslyAsync && isFnAsync ? '(async()=>' : ' '}new Response(${fnResult},${CTX})${!previouslyAsync && isFnAsync ? ')' : ''};`
    : fnNeedContext
      ? `${CTX_DEF},headers:[${handlerType === 'text' ? '' : handlerType === 'html' ? HTML_HEADER_PAIR : JSON_HEADER_PAIR}]${contextPayload}${CTX_END}return${!previouslyAsync && isFnAsync ? '(async()=>' : ' '}new Response(${fnResult},${CTX})${!previouslyAsync && isFnAsync ? ')' : ''};`
      : `return${!previouslyAsync && isFnAsync ? '(async()=>' : ' '}new Response(${fnResult}${handlerType === 'text' ? '' : `,${handlerType === 'html' ? HTML_OPTIONS : JSON_OPTIONS}`})${!previouslyAsync && isFnAsync ? ')' : ''};`;
}

export function compileNormalHandler(
  handler: AnyHandler,
  externalValues: AppRouterCompilerState['externalValues'],

  previouslyAsync: boolean,
  contextPayload: string | null
): string {
  return compileHandler(
    // Handler state
    isAsync(handler.fn),
    handler.fn.length !== 0,
    externalValues.push(handler.fn) - 1,
    handler.type,
    null,

    // Context state
    previouslyAsync,
    contextPayload
  );
}

export function cacheExceptHandler(
  isStatic: boolean,
  handler: AnyHandler,
  externalValues: AppRouterCompilerState['externalValues']
): ExceptHandlersState[number] {
  return [
    isAsync(handler.fn),
    handler.fn.length > (isStatic ? 0 : 1),
    externalValues.push(handler.fn) - 1,
    handler.type,
    isStatic
  ];
}

export function compileExceptHandlers(
  exceptRoutes: ExceptHandlersState,
  value: string,

  previouslyAsync: boolean,
  previouslyHasContext: boolean
): string {
  const contextPayload = previouslyHasContext ? null : '';
  let str = `if(Array.isArray(${value})&&${value}[0]===${EXCEPT_SYMBOL})switch(${value}[1]){`;

  for (const key in exceptRoutes) {
    const args = exceptRoutes[key];

    str += `${key === '0'
      ? 'default'
      : `case ${key}`}:${compileHandler(args[0], args[1], args[2], args[3], args[4] ? null : `${value}[2]`, previouslyAsync, contextPayload)}`;
  }

  if (typeof exceptRoutes[0] === 'undefined')
    str += `default:return ${RESPONSE_400};`;

  return `${str}}`;
}
