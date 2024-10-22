import type { StaticHandler } from '../router/types/handler.js';
import type { AppRouterCompilerState } from '../types/compiler.js';
import { CTX, HEADERS } from './constants.js';

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
        tmpl += `${CTX}.status=${options.status};`;

      if (typeof options.statusText === 'string')
        tmpl += `${CTX}.statusText="${options.statusText.replace(/"/, '\\"')}";`;

      if (typeof options.headers === 'object')
        tmpl += `${HEADERS}.push(...f${externalValues.push(toHeaderTuples(options.headers))});`;
    }

    return `${tmpl}return new Response(${typeof handler.body === 'string'
      ? `"${handler.body.replace(/"/, '\\"')}"`
      : `f${externalValues.push(handler.body)}`},${CTX});`;
  }

  return `return ${externalValues.push(new Response(handler.body, handler.options))}.clone();`;
}
