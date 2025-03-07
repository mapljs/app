import type { AnyTypedHandler, StaticHandler } from '../router/types/handler.js';
import type { AppCompilerState } from '../types/compiler.js';

// eslint-disable-next-line
export const AsyncFunction: Function = (async () => { }).constructor;

export const isFunctionAsync = (fn: any): fn is (...args: any[]) => Promise<any> => fn instanceof AsyncFunction;

export const toHeaderTuples = (headers: HeadersInit): [string, string][] => Array.isArray(headers)
  ? headers
  : headers instanceof Headers
    ? headers.entries().toArray()
    : Object.entries(headers);

export const buildStaticHandler = (body: StaticHandler['body'], options: StaticHandler['options'], externalValues: AppCompilerState['externalValues'], contextNeedParam: boolean | null): string => {
  // Has context then serialize options to
  // statements that changes the context
  if (contextNeedParam === null) {
    let tmpl = '';

    // Save other details in memory and load later
    if (typeof options !== 'undefined') {
      if (typeof options.status === 'number')
        tmpl += `${compilerConstants.CTX}.status=${options.status};`;

      if (typeof options.statusText === 'string')
        tmpl += `${compilerConstants.CTX}.statusText=${JSON.stringify(options.statusText)};`;

      if (typeof options.headers === 'object')
        tmpl += `${compilerConstants.HEADERS}.push(...f${externalValues.push(toHeaderTuples(options.headers))});`;
    }

    // Save the body in memory
    return `${tmpl}return new Response(${
      body == null
        ? 'null'
        : `f${externalValues.push(body)}`
    }${compilerConstants.COLON_CTX});`;
  }

  // Save the entire response object in memory and clone when necessary
  return `return f${externalValues.push(new Response(body, options))}.clone();`;
};

export const selectHeaderDef = (type: AnyTypedHandler['type']): string => type === 'buffer'
  ? compilerConstants.HEADER_DEF
  : type === 'json'
    ? compilerConstants.JSON_HEADER_DEF
    : type === 'html'
      ? compilerConstants.HTML_HEADER_DEF
      : compilerConstants.TEXT_HEADER_DEF;

export const selectCtxDef = (type: AnyTypedHandler['type']): string => type === 'buffer'
  ? compilerConstants.CTX_DEF
  : type === 'json'
    ? compilerConstants.JSON_CTX_DEF
    : type === 'html'
      ? compilerConstants.HTML_CTX_DEF
      : compilerConstants.TEXT_CTX_DEF;

export const selectResOption = (type: AnyTypedHandler['type']): string => type === 'buffer'
  ? ''
  : type === 'json'
    ? compilerConstants.COLON_JSON_OPTIONS
    : type === 'html'
      ? compilerConstants.COLON_HTML_OPTIONS
      : compilerConstants.COLON_TEXT_OPTIONS;

export const selectSetHeader = (type: AnyTypedHandler['type']): string => type === 'buffer'
  ? ''
  : type === 'json'
    ? compilerConstants.SET_JSON_HEADER
    : type === 'html'
      ? compilerConstants.SET_HTML_HEADER
      : compilerConstants.SET_TEXT_HEADER;
