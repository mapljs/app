import type { AnyHandler } from '../router/types/handler.js';
import type { AppRouterCompilerState } from '../types/compiler.js';

import { buildStaticHandler, isFunctionAsync } from './utils.js';

// A cached function to build out handlers
type ExceptHandlerBuilder = (hasContext: boolean, isAsync: boolean) => string;
export type ExceptHandlerBuilders = Record<number, ExceptHandlerBuilder>;

// Build closures that generates exception content
export function buildHandler(isDynamic: boolean, handler: AnyHandler, externalValues: AppRouterCompilerState['externalValues']): ExceptHandlerBuilder {
  // Plain text
  if (typeof handler === 'function') {
    const isFnAsync = isFunctionAsync(handler);
    const fnNeedContext = handler.length > (isDynamic ? 1 : 0);

    const retStart = `return new Response(${isFnAsync ? 'await ' : ''}f${externalValues.push(handler)}${
      fnNeedContext ? isDynamic ? compilerConstants.PAYLOAD_CTX_ARG : compilerConstants.ONLY_CTX_ARG : compilerConstants.NO_ARG
    }`;
    const retEnd = `${fnNeedContext ? compilerConstants.COLON_CTX : ''});`;

    return (hasContext, isAsync) => `${!isAsync && isFnAsync
      ? compilerConstants.ASYNC_START
      : ''
    }${!hasContext && fnNeedContext
      ? compilerConstants.TEXT_CTX_DEF
      : ''
    }${retStart}${!fnNeedContext && hasContext
      ? compilerConstants.COLON_CTX
      : ''
    }${retEnd}${!isAsync && isFnAsync
      ? compilerConstants.ASYNC_END
      : ''
    }`;
  }

  const handlerType = handler.type;

  // Static response
  if (handlerType === 'static') {
    // Lazily compile two cases
    let hasContextCase: string | null = null;
    let noContextCase: string | null = null;

    // eslint-disable-next-line
    return (hasContext) => hasContext
      ? hasContextCase ??= buildStaticHandler(handler, externalValues, null)
      : noContextCase ??= buildStaticHandler(handler, externalValues, false);
  }

  const fn = handler.fn;
  const fnNeedContext = fn.length > (isDynamic ? 1 : 0);

  // Return a raw Response
  if (handlerType === 'response') {
    const str = `return f${externalValues.push(fn)}${isDynamic
      ? fnNeedContext ? compilerConstants.PAYLOAD_CTX_ARG : compilerConstants.ONLY_PAYLOAD_ARG
      : fnNeedContext ? compilerConstants.ONLY_CTX_ARG : compilerConstants.NO_ARG};`;

    // eslint-disable-next-line
    return (hasContext) => !hasContext && fnNeedContext ? compilerConstants.TEXT_CTX_DEF + str : str;
  }

  const isFnAsync = isFunctionAsync(fn);

  // Cache known parts
  const retStart = `return new Response(${handlerType === 'json' ? 'JSON.stringify(' : ''}${isFnAsync ? 'await ' : ''}f${externalValues.push(fn)}${
    fnNeedContext ? isDynamic ? compilerConstants.PAYLOAD_CTX_ARG : compilerConstants.ONLY_CTX_ARG : compilerConstants.NO_ARG
  }${handlerType === 'json' ? ')' : ''}`;
  const retEnd = `${fnNeedContext ? compilerConstants.COLON_CTX : ''});`;

  return (hasContext, isAsync) => `${!isAsync && isFnAsync
    ? compilerConstants.ASYNC_START
    : ''
  }${hasContext
    ? handlerType === 'html' ? compilerConstants.SET_HTML_HEADER : compilerConstants.SET_JSON_HEADER
    : fnNeedContext
      ? handlerType === 'html' ? compilerConstants.HTML_CTX_DEF : compilerConstants.JSON_CTX_DEF
      : ''
  }${retStart}${!fnNeedContext
    ? hasContext
      ? compilerConstants.COLON_CTX
      : handlerType === 'html'
        ? compilerConstants.COLON_HTML_OPTIONS
        : compilerConstants.COLON_JSON_OPTIONS
    : ''
  }${retEnd}${!isAsync && isFnAsync
    ? compilerConstants.ASYNC_END
    : ''
  }`;
}

export function loadHandlers(builders: ExceptHandlerBuilders, hasContext: boolean, isAsync: boolean): string {
  let str = compilerConstants.EXCEPT_START;

  // Build all exceptions
  for (const id in builders) str += `case ${id}:{${builders[id](hasContext, isAsync)}}`;

  // Catch all
  return str + (typeof builders[0] === 'undefined' ? compilerConstants.DEFAULT_EXCEPT_END : `default:{${builders[0](hasContext, isAsync)}}}`);
}
