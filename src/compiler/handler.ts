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
  let str = `if(Array.isArray(${value})&&${value}[0]===${EXCEPT_SYMBOL})`;

  const entries = Object.entries(exceptRoutes);
  const entriesCount = entries.length;

  // No except route is registered
  if (entriesCount === 0)
    return `${str}return ${RESPONSE_400};`;

  // Don't create a context if not necessary
  // Error handler context should not have any other fields
  const contextPayload = previouslyHasContext ? null : '';

  // One except route is registered
  if (entriesCount === 1) {
    const entry = entries[0];
    const args = entry[1];

    // If entry is an all except handler -> paste the compile result in directly
    // Else -> Create an if statement to check whether the exception id matches, else return RESPONSE_400
    return `${str}{${entry[0] === '0' ? '' : `if(${value}[1]===${entry[0]}){`}${compileHandler(args[0], args[1], args[2], args[3], args[4] ? null : `${value}[2]`, previouslyAsync, contextPayload)}${entry[0] === '0' ? '' : `}else return ${RESPONSE_400};`}}`;
  }

  // Use a switch statement for other types
  str += `switch(${value}[1]){`;

  for (let i = 0; i < entriesCount; i++) {
    const key = entries[i][0];
    const args = entries[i][1];

    // Compile to case statements or default statement if exception id is 0
    str += `${key === '0'
      ? 'default'
      : `case ${key}`}:{${compileHandler(args[0], args[1], args[2], args[3], args[4] ? null : `${value}[2]`, previouslyAsync, contextPayload)}}`;
  }

  // Handle unhandled exceptions
  if (typeof exceptRoutes[0] === 'undefined')
    str += `default:return ${RESPONSE_400};`;

  return `${str}}`;
}
