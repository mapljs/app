import type { AnyHandler, AnyTypedHandler, StaticHandler } from '../router/types/handler.js';
import type { AppCompilerState } from '../types/compiler.js';
import { buildStaticHandler, isFunctionAsync, selectHeaderDef, selectResOption, selectSetHeader } from './utils.js';

export const selectFnArgWithCtx = (needParam: boolean): string => needParam
  ? compilerConstants.PARAM_CTX_ARG
  : compilerConstants.ONLY_CTX_ARG;

export const selectFnArg = (needParam: boolean): string => needParam
  ? compilerConstants.ONLY_PARAM_ARG
  : compilerConstants.NO_ARG;

const selectFnArgIfNeeded = (fnNoNeedContext: boolean, needParam: boolean): string => fnNoNeedContext
  ? selectFnArg(needParam)
  : selectFnArgWithCtx(needParam);

/**
 * Compile a handler. This is a fast path for handlers that doesn't need recompilation
 */
export const compileHandler = (
  handler: AnyHandler,
  externalValues: AppCompilerState['externalValues'],

  previouslyAsync: boolean,
  contextNeedParam: boolean,
  hasContext: boolean
): string => {
  let handlerType: AnyTypedHandler['type'] | 'static';
  let fn: AnyTypedHandler['fn'];

  if (typeof handler === 'function') {
    handlerType = 'buffer';
    fn = handler;
  } else {
    handlerType = handler.type;

    // Build static response
    if (handlerType === 'static')
      return buildStaticHandler((handler as StaticHandler).body, (handler as StaticHandler).options, externalValues, contextNeedParam);

    fn = (handler as AnyTypedHandler).fn;
  }

  const fnNoNeedContext = fn.length < (contextNeedParam ? 2 : 1);

  // Return a raw Response
  if (handlerType === 'plain') {
    return `${fnNoNeedContext
      ? ''
      : compilerConstants.HEADER_DEF + compilerConstants.CTX_DEF
    }return f${externalValues.push(fn)}${selectFnArgIfNeeded(fnNoNeedContext, contextNeedParam)};`;
  }

  const isFnAsync = isFunctionAsync(fn);

  return hasContext
    ? `${selectSetHeader(handlerType)}return${isFnAsync && !previouslyAsync
      ? '(async()=>'
      : ' '
    }new Response(${handlerType === 'json'
      ? 'JSON.stringify('
      : ''
    }${isFnAsync
      ? 'await '
      : ''
    }f${externalValues.push(fn)}${selectFnArgIfNeeded(fnNoNeedContext, contextNeedParam)}${handlerType === 'json'
      ? ')'
      : ''
    },${compilerConstants.CTX})${isFnAsync && !previouslyAsync
      ? ')()'
      : ''
    };`

    : fnNoNeedContext
      ? `return${isFnAsync && !previouslyAsync
        ? '(async()=>'
        : ' '
      }new Response(${handlerType === 'json'
        ? 'JSON.stringify('
        : ''
      }${isFnAsync
        ? 'await '
        : ''
      }f${externalValues.push(fn)}${selectFnArg(contextNeedParam)}${handlerType === 'json'
        ? ')'
        : ''
      }${selectResOption(handlerType)})${isFnAsync && !previouslyAsync
        ? ')()'
        : ''
      };`

      : `${isFnAsync && !previouslyAsync
        ? compilerConstants.ASYNC_START
        : ''
      }${selectHeaderDef(handlerType)}${compilerConstants.CTX_DEF}return new Response(${handlerType === 'json'
        ? 'JSON.stringify('
        : ''
      }${isFnAsync
        ? 'await '
        : ''
      }f${externalValues.push(fn)}${selectFnArgWithCtx(contextNeedParam)}${handlerType === 'json'
        ? ')'
        : ''
      },${compilerConstants.CTX});${isFnAsync && !previouslyAsync
        ? compilerConstants.ASYNC_END
        : ''
      }`;
};
