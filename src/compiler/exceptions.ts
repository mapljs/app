import type { AnyHandler } from '../router/types/handler.js';
import type { AppRouterCompilerState } from '../types/compiler.js';

import { ASYNC_START, CTX, CTX_DEF, CTX_END, EXCEPT_SYMBOL, HEADERS, HTML_HEADER_PAIR, HTML_OPTIONS, JSON_HEADER_PAIR, JSON_OPTIONS, RET_500, SET_HTML_HEADER, SET_JSON_HEADER, VAR_PREFIX } from './constants.js';
import { buildStaticHandler, isFunctionAsync, serializeBody } from './utils.js';

// A cached function to build out handlers
type ExceptHandlerBuilder = (arg: string, isAsync: boolean, hasContext: boolean) => string;
export type ExceptHandlerBuilders = Record<number, ExceptHandlerBuilder>;

// Cache stuff
const COLON_CTX = `,${CTX}`;
const COLON_HTML_OPTIONS = `,${HTML_OPTIONS}`;
const COLON_JSON_OPTIONS = `,${JSON_OPTIONS}`;

// Text & HTML & JSON context creation
const TEXT_CTX_DEF = `let ${HEADERS}=[];${CTX_DEF}${CTX_END}`;
const HTML_CTX_DEF = `let ${HEADERS}=[${HTML_HEADER_PAIR}];${CTX_DEF}${CTX_END}`;
const JSON_CTX_DEF = `let ${HEADERS}=[${JSON_HEADER_PAIR}];${CTX_DEF}${CTX_END}`;

export function buildHandler(isDynamic: boolean, handler: AnyHandler, externalValues: AppRouterCompilerState['externalValues']): ExceptHandlerBuilder {
  const handlerType = handler.type;

  // Static response
  if (handlerType === 'static') {
    // No prebuilt for error handlers
    if (handler.prebuilt === true)
      throw new Error('Error handlers can not be pre-built!');

    const body = serializeBody(handler.body);

    // Cache two cases
    const hasContextCase = buildStaticHandler(body, handler.options, externalValues, null);
    const noContextCase = buildStaticHandler(body, handler.options, externalValues, false);

    // eslint-disable-next-line
    return (_, _1, hasContext) => hasContext ? hasContextCase : noContextCase;
  }

  const fn = handler.fn;
  const fnNeedContext = fn.length > (isDynamic ? 1 : 0);

  // Return a raw Response
  if (handlerType === 'response') {
    if (isDynamic) {
      const retStart = `return f${externalValues.push(fn) - 1}(`;
      const retEnd = `,${fnNeedContext ? CTX : ''});`;

      // Insert first arg in
      return (arg, _, hasContext) => `${!hasContext && fnNeedContext ? TEXT_CTX_DEF : ''}${retStart}${arg}${retEnd}`;
    }

    const str = `return f${externalValues.push(fn) - 1}(${fnNeedContext ? CTX : ''});`;
    // eslint-disable-next-line
    return (_, _1, hasContext) => !hasContext && fnNeedContext ? TEXT_CTX_DEF + str : str;
  }

  const isFnAsync = isFunctionAsync(fn);

  // Cache known parts
  const retStart = `return new Response(${handlerType === 'json' ? 'JSON.stringify(' : ''}${isFnAsync ? 'await ' : ''}f${externalValues.push(fn) - 1}(`;
  const endArgs = `${fnNeedContext ? isDynamic ? COLON_CTX : CTX : ''}${handlerType === 'json' ? '))' : ')'}`;
  const retEnd = `${fnNeedContext ? COLON_CTX : ''});`;

  // Build a closure to generate strings faster
  return (arg, isAsync, hasContext) => {
    // Whether it is required to wrap the context in an async scope
    isAsync = !isAsync && isFnAsync;
    let result = isAsync ? ASYNC_START : '';

    if (hasContext) {
      // Append correct content type headers
      if (handlerType === 'html')
        result += SET_HTML_HEADER;
      else if (handlerType === 'json')
        result += SET_JSON_HEADER;
    } else if (fnNeedContext)
      // Need to create a new context
      result += handlerType === 'text' ? TEXT_CTX_DEF : handlerType === 'html' ? HTML_CTX_DEF : JSON_CTX_DEF;

    // Push the first return part
    result += retStart;

    // Insert the payload as the first arg if needed
    if (isDynamic)
      result += arg;
    result += endArgs;

    if (!fnNeedContext) {
      // If we already have a context it should be passed
      // as the response option
      if (hasContext)
        result += COLON_CTX;

      // Else pass the correct option for the expected content type
      else if (handlerType === 'html')
        result += COLON_HTML_OPTIONS;
      else if (handlerType === 'json')
        result += COLON_JSON_OPTIONS;
    }

    // End the return
    result += retEnd;

    // Wrap the scope if necessary
    if (isAsync)
      result += '});';

    return result;
  };
}

const DEFAULT_RET = `default:${RET_500}}`;

export function loadHandlers(builders: ExceptHandlerBuilders, varId: number, isAsync: boolean, hasContext: boolean): string {
  let str = `if(Array.isArray(${VAR_PREFIX}${varId})&&${VAR_PREFIX}${varId}[0]===${EXCEPT_SYMBOL})switch(${VAR_PREFIX}${varId}[1]){`;
  const payload = `${VAR_PREFIX}${varId}[2]`;

  // Build all exceptions
  for (const id in builders) str += `case ${id}:{${builders[id](payload, isAsync, hasContext)}}`;

  // Catch all
  return str + (typeof builders[0] === 'undefined' ? DEFAULT_RET : `default:{${builders[0](payload, isAsync, hasContext)}}}`);
}
