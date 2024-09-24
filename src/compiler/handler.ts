import type { AnyRouter } from '../router';
import type { Handler } from '../router/types/handler';
import type { AppRouterCompilerState, CachedCompilationResult, CachedExceptCompilationResult } from '../types/compiler';
import { EXCEPTION_PAYLOAD, EXCEPTION_SYMBOL, HTML_HEADER_PAIR, HTML_OPTIONS, JSON_HEADER_PAIR, JSON_OPTIONS, REQUEST_CONTEXT, RESPONSE_500 } from './constants';
import isAsync from './utils/isAsync';

export function compileHandler(handler: Handler<any, any>, state: AppRouterCompilerState, arg: string | null, previouslyHasContext: boolean): CachedCompilationResult {
  const fn = handler.fn;

  const isFnAsync = isAsync(fn);
  const needContext = fn.length !== (arg === null ? 0 : 1);

  const fnCall = `${isFnAsync ? 'await ' : ''}f${state.externalValues.push(fn) - 1}(${arg === null
    ? needContext ? REQUEST_CONTEXT : ''
    : needContext ? `${arg},${REQUEST_CONTEXT}` : arg})`;

  const handlerType = handler.type;

  // Whether to use the request context or not
  previouslyHasContext ||= needContext;

  return [
    // Text handler
    handlerType === 'text'
      ? `return new Response(${fnCall}${previouslyHasContext ? `,${REQUEST_CONTEXT}` : ''});`
      // HTML handler
      : handlerType === 'html'
        ? `${previouslyHasContext ? `${REQUEST_CONTEXT}.headers.push(${HTML_HEADER_PAIR});` : ''}return new Response(${fnCall},${previouslyHasContext ? REQUEST_CONTEXT : HTML_OPTIONS});`
        // JSON handler
        : `${previouslyHasContext ? `${REQUEST_CONTEXT}.headers.push(${JSON_HEADER_PAIR});` : ''}return new Response(JSON.stringify(${fnCall}),${previouslyHasContext ? REQUEST_CONTEXT : JSON_OPTIONS});`,
    isFnAsync,
    needContext
  ];
}

export function compileExceptRoutes(router: AnyRouter, state: AppRouterCompilerState): CachedExceptCompilationResult {
  return [
    // eslint-disable-next-line
    router.exceptRoutes.map((route) => Array.isArray(route[0])
      ? [route[0][1], compileHandler(route[1], state, null, true), false]
      : [route[0].id, compileHandler(route[1], state, EXCEPTION_PAYLOAD, true), true]),
    typeof router.allExceptRoute === 'undefined'
      ? null
      : compileHandler(router.allExceptRoute, state, null, true)
  ];
}

// Avoid the cost of asynchronous scopes
export function loadExceptRoutes(cachedResult: CachedExceptCompilationResult, target: string, previouslyAsync: boolean): string {
  let builder = `if(Array.isArray(${target})&&${target}[0]===${EXCEPTION_SYMBOL})switch(${target}[1]){`;

  for (let i = 0, mappedExcepts = cachedResult[0], l = mappedExcepts.length; i < l; i++) {
    const curExcept = mappedExcepts[i];

    // Create a scope if requires payload
    builder += `case ${curExcept[0]}:${!previouslyAsync && curExcept[1][1]
      // Requires to wap with an async context
      ? `return (async()=>{${curExcept[2] ? `const ${EXCEPTION_PAYLOAD}=${target}[2];` : ''}}${curExcept[1][0]});`
      : curExcept[2] ? `{const ${EXCEPTION_PAYLOAD}=${target}[2];${curExcept[1][0]}}` : curExcept[1][0]}`;
  }

  return `${builder}default:${cachedResult[1] === null ? `return ${RESPONSE_500};` : cachedResult[1][0]}}`;
}
