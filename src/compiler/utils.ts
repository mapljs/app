import type { StaticHandler } from '../router/types/handler.js';
import type { AppRouterCompilerState } from '../types/compiler.js';

// eslint-disable-next-line
const AsyncFunction = (async () => { }).constructor;

export function isFunctionAsync(fn: any): fn is (...args: any[]) => Promise<any> {
  return fn instanceof AsyncFunction;
}

export function toHeaderTuples(headers: HeadersInit): [string, string][] {
  return Array.isArray(headers)
    ? headers
    : headers instanceof Headers
      ? headers.entries().toArray()
      : Object.entries(headers);
}

export function buildStaticHandler(handler: StaticHandler, externalValues: AppRouterCompilerState['externalValues'], contextNeedParam: boolean | null): string {
  const options = handler.options;

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
      handler.body == null
        ? 'null'
        : typeof handler.body === 'string'
          ? `"${handler.body.replace(/"/, '\\"')}"`
          : `f${externalValues.push(handler.body)}`
    }${compilerConstants.COLON_CTX});`;
  }

  // Save the entire response object in memory and clone when necessary
  return `return f${externalValues.push(new Response(handler.body, handler.options))}.clone();`;
}
