import type { AnyHandler } from '../router/types/handler.js';
import type { AppCompilerState } from '../types/compiler.js';
import { buildStaticHandler, isFunctionAsync, selectCtxParamsDef, selectHeaderDef, selectResOption, selectSetHeader } from './utils.js';

// eslint-disable-next-line
const selectFnArgs = (fnNoNeedContext: boolean): string => fnNoNeedContext
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
  if (typeof handler === 'function') {
    const isFnAsync = isFunctionAsync(handler);
    const fnNoNeedContext = handler.length === 0;

    return contextNeedParam === null
      ? `return${isFnAsync && !previouslyAsync
        ? '(async()=>'
        : ' '
      }new Response(${isFnAsync ? 'await ' : ''}f${externalValues.push(handler)}${selectFnArgs(fnNoNeedContext)},${compilerConstants.CTX})${isFnAsync && !previouslyAsync
        ? ')()'
        : ''
      };`

      : fnNoNeedContext
        ? `return${isFnAsync && !previouslyAsync
          ? '(async()=>'
          : ' '
        }new Response(${isFnAsync
          ? 'await '
          : ''
        }f${externalValues.push(handler)}${compilerConstants.NO_ARG})${isFnAsync && !previouslyAsync
          ? ')()'
          : ''
        };`

        : `${isFnAsync && !previouslyAsync
          ? compilerConstants.ASYNC_START
          : ''
        }${compilerConstants.HEADER_DEF}${selectCtxParamsDef(!contextNeedParam)}return new Response(${isFnAsync ? 'await ' : ''}f${externalValues.push(handler)}${compilerConstants.ONLY_CTX_ARG},${compilerConstants.CTX});${isFnAsync && !previouslyAsync
          ? compilerConstants.ASYNC_END
          : ''
        }`;
  }

  const handlerType = handler.type;

  // Build static response
  if (handlerType === 'static')
    return buildStaticHandler(handler.body, handler.options, externalValues, contextNeedParam);

  const fn = handler.fn;
  const fnNoNeedContext = fn.length === 0;

  // Return a raw Response
  if (handlerType === 'response') {
    return `${fnNoNeedContext || contextNeedParam === null
      ? ''
      : compilerConstants.HEADER_DEF + selectCtxParamsDef(!contextNeedParam)
    }return f${externalValues.push(fn)}${selectFnArgs(fnNoNeedContext)};`;
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
    }f${externalValues.push(fn)}${selectFnArgs(fnNoNeedContext)}${handlerType === 'json'
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
      }f${externalValues.push(fn)}${compilerConstants.NO_ARG}${handlerType === 'json'
        ? ')'
        : ''
      }${selectResOption(handlerType)})${isFnAsync && !previouslyAsync
        ? ')()'
        : ''
      };`

      : `${isFnAsync && !previouslyAsync
        ? compilerConstants.ASYNC_START
        : ''
      }${selectHeaderDef(handlerType)}${selectCtxParamsDef(!contextNeedParam)}return new Response(${handlerType === 'json'
        ? 'JSON.stringify('
        : ''
      }${isFnAsync
        ? 'await '
        : ''
      }f${externalValues.push(fn)}${compilerConstants.ONLY_CTX_ARG}${handlerType === 'json'
        ? ')'
        : ''
      },${compilerConstants.CTX});${isFnAsync && !previouslyAsync
        ? compilerConstants.ASYNC_END
        : ''
      }`;
};
