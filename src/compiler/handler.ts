import type { AnyHandler, AnyTypedHandler, StaticHandler } from '../router/types/handler.js';
import type { AppCompilerState } from '../types/compiler.js';
import { buildStaticHandler, isFunctionAsync, selectHeaderDef, selectResOption, selectSetHeader } from './utils.js';

// eslint-disable-next-line
export const selectFnArgWithCtx = (needParam: boolean) => needParam
  ? compilerConstants.PARAM_CTX_ARG
  : compilerConstants.ONLY_CTX_ARG;

// eslint-disable-next-line
export const selectFnArg = (needParam: boolean) => needParam
  ? compilerConstants.ONLY_PARAM_ARG
  : compilerConstants.NO_ARG;

// eslint-disable-next-line
const selectFnArgIfNeeded = (fnNoNeedContext: boolean): string => fnNoNeedContext
  ? compilerConstants.NO_ARG
  : compilerConstants.ONLY_CTX_ARG;

/**
 * Compile a handler. This is a fast path for handlers that doesn't need recompilation
 */
// eslint-disable-next-line
export const compileHandler = (
  handler: AnyHandler,
  externalValues: AppCompilerState['externalValues'],

  previouslyAsync: boolean,
  contextNeedParam: boolean | null
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

  const fnNoNeedContext = fn.length < (contextNeedParam === true ? 2 : 1);

  // Return a raw Response
  if (handlerType === 'response') {
    return `${fnNoNeedContext || contextNeedParam === null
      ? ''
      : compilerConstants.HEADER_DEF + compilerConstants.CTX_DEF
    }return f${externalValues.push(fn)}${selectFnArgIfNeeded(fnNoNeedContext)};`;
  }

  const isFnAsync = isFunctionAsync(fn);

  return contextNeedParam === null
    ? `${selectSetHeader(handlerType)}return${isFnAsync && !previouslyAsync
      ? '(async()=>'
      : ' '
    }new Response(${handlerType === 'json'
      ? 'JSON.stringify('
      : ''
    }${isFnAsync
      ? 'await '
      : ''
    }f${externalValues.push(fn)}${selectFnArgIfNeeded(fnNoNeedContext)}${handlerType === 'json'
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
