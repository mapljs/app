import type { StaticHandler } from '../router/types/handler.js';
import { CTX, HEADERS } from './constants.js';

// eslint-disable-next-line
const AsyncFunction = (async () => { }).constructor;

export function isFunctionAsync(fn: any): fn is (...args: any[]) => Promise<any> {
  return fn instanceof AsyncFunction;
}

export function serializeBody(body: any): string {
  switch (typeof body) {
    case 'bigint':
    case 'number':
    case 'boolean':
      return `"${body}"`;

    case 'undefined':
      return 'null';

    case 'object':
      if (body === null)
        return 'null';

      // Let the user explicitly choose how to
      // serialize objects by default
      break;

    // Just throw
    default: break;
  }

  throw new Error(`${body} is not serializable`);
}

export function toHeaderTuples(headers: HeadersInit): [string, string][] {
  return Array.isArray(headers)
    ? headers
    : headers instanceof Headers
      ? headers.entries().toArray()
      : Object.entries(headers);
}

export function buildStaticHandler(body: string, options: ResponseInit | undefined, externalValues: any[], contextNeedParam: boolean | null): string {
  // Has context then serialize options to
  // statements that changes the context
  if (contextNeedParam === null) {
    let tmpl = '';

    if (typeof options !== 'undefined') {
      if (typeof options.status === 'number')
        tmpl += `${CTX}.status=${options.status};`;

      if (typeof options.statusText === 'string')
        tmpl += `${CTX}.statusText=${options.statusText};`;

      if (typeof options.headers === 'object')
        tmpl += `${HEADERS}.push(...${externalValues.push(toHeaderTuples(options.headers))});`;
    }

    return `${tmpl}return new Response(${body},${CTX});`;
  }

  return typeof options === 'undefined'
    ? `return new Response(${body});`
    : `return new Response(${body},${externalValues.push(options)});`;
}
