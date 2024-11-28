import type { AnyTypedHandler, StaticHandler } from '../router/types/handler.js';
import type { AppCompilerState } from '../types/compiler.js';

// eslint-disable-next-line
export const AsyncFunction = (async () => { }).constructor;

// eslint-disable-next-line
export const isFunctionAsync = (fn: any): fn is (...args: any[]) => Promise<any> => fn instanceof AsyncFunction;

// eslint-disable-next-line
export const toHeaderTuples = (headers: HeadersInit): [string, string][] => Array.isArray(headers)
  ? headers
  : headers instanceof Headers
    ? headers.entries().toArray()
    : Object.entries(headers);

// eslint-disable-next-line
export const buildStaticHandler = (body: StaticHandler['body'], options: StaticHandler['options'], externalValues: AppCompilerState['externalValues'], contextNeedParam: boolean | null): string => {
  // Has context then serialize options to
  // statements that changes the context
  if (contextNeedParam === null) {
    let tmpl = '';

    if (typeof options !== 'undefined') {
      if (typeof options.status === 'number')
        tmpl += `${compilerConstants.CTX}.status=${options.status};`;

      if (typeof options.statusText === 'string')
        tmpl += `${compilerConstants.CTX}.statusText="${options.statusText.replace(/"/, '\\"')}";`;

      if (typeof options.headers === 'object')
        tmpl += `${compilerConstants.HEADERS}.push(...f${externalValues.push(toHeaderTuples(options.headers))});`;
    }

    // Save only the body in memory
    return `${tmpl}return new Response(${
      body == null
        ? 'null'
        : typeof body === 'string'
          ? `"${body.replace(/"/, '\\"')}"`
          : `f${externalValues.push(body)}`
    }${compilerConstants.COLON_CTX});`;
  }

  // Save the entire response object in memory and clone when necessary
  return `return f${externalValues.push(new Response(body, options))}.clone();`;
};

// eslint-disable-next-line
export const selectHeaderDef = (type: AnyTypedHandler['type']): string => type === 'html'
  ? compilerConstants.HTML_HEADER_DEF
  : type === 'json'
    ? compilerConstants.JSON_HEADER_DEF
    : compilerConstants.TEXT_HEADER_DEF;

// eslint-disable-next-line
export const selectCtxDef = (type: AnyTypedHandler['type']): string => type === 'html'
  ? compilerConstants.HTML_CTX_DEF
  : type === 'json'
    ? compilerConstants.JSON_CTX_DEF
    : compilerConstants.TEXT_CTX_DEF;

// eslint-disable-next-line
export const selectResOption = (type: AnyTypedHandler['type']): string => type === 'html'
  ? compilerConstants.COLON_HTML_OPTIONS
  : type === 'json'
    ? compilerConstants.COLON_JSON_OPTIONS
    : compilerConstants.COLON_TEXT_OPTIONS;

// eslint-disable-next-line
export const selectSetHeader = (type: AnyTypedHandler['type']): string => type === 'html'
  ? compilerConstants.SET_HTML_HEADER
  : type === 'json'
    ? compilerConstants.SET_JSON_HEADER
    : compilerConstants.SET_TEXT_HEADER;

// eslint-disable-next-line
export const selectCtxParamsDef = (fnNoNeedContext: boolean): string => fnNoNeedContext
  ? compilerConstants.CTX_DEF
  : compilerConstants.CTX_PARAMS_DEF;
