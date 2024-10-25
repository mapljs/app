import type { AnyHandler } from '../router/types/handler.js';
import type { AppRouterCompilerState } from '../types/compiler.js';
import { buildStaticHandler, isFunctionAsync } from './utils.js';

/**
 * Compile a handler. This is a fast path for handlers that doesn't need recompilation
 */
export function compileHandler(
  handler: AnyHandler,
  externalValues: AppRouterCompilerState['externalValues'],

  previouslyAsync: boolean,
  contextNeedParam: boolean | null
): string {
  if (typeof handler === 'function') {
    const isFnAsync = isFunctionAsync(handler);
    const fnNoNeedContext = handler.length === 0;

    return contextNeedParam === null
      ? `return${isFnAsync && !previouslyAsync
        ? '(async()=>'
        : ' '
      }new Response(${isFnAsync ? 'await ' : ''}f${externalValues.push(handler)}${fnNoNeedContext
        ? compilerConstants.NO_ARG
        : compilerConstants.ONLY_CTX_ARG
      },${compilerConstants.CTX})${isFnAsync && !previouslyAsync
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
        }${compilerConstants.TEXT_HEADER_DEF}${contextNeedParam
          ? compilerConstants.CTX_PARAMS_DEF
          : compilerConstants.CTX_DEF
        }return new Response(${isFnAsync ? 'await ' : ''}f${externalValues.push(handler)}${compilerConstants.ONLY_CTX_ARG},${compilerConstants.CTX});${isFnAsync && !previouslyAsync
          ? compilerConstants.ASYNC_END
          : ''
        }`;
  }

  const handlerType = handler.type;

  // Build static response
  if (handlerType === 'static')
    return buildStaticHandler(handler, externalValues, contextNeedParam);

  const fn = handler.fn;
  const fnNoNeedContext = fn.length === 0;

  // Return a raw Response
  if (handlerType === 'response')
    return `return f${externalValues.push(fn)}${fnNoNeedContext ? compilerConstants.NO_ARG : compilerConstants.ONLY_CTX_ARG};`;

  const isFnAsync = isFunctionAsync(fn);

  return contextNeedParam === null
    ? `${handlerType === 'html'
      ? compilerConstants.SET_HTML_HEADER
      : compilerConstants.SET_JSON_HEADER
    }return${isFnAsync && !previouslyAsync
      ? '(async()=>'
      : ' '
    }new Response(${handlerType === 'json'
      ? 'JSON.stringify('
      : ''
    }${isFnAsync
      ? 'await '
      : ''
    }f${externalValues.push(fn)}${fnNoNeedContext
      ? compilerConstants.NO_ARG
      : compilerConstants.ONLY_CTX_ARG
    }${handlerType === 'json'
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
      }${handlerType === 'html'
        ? compilerConstants.COLON_HTML_OPTIONS
        : compilerConstants.COLON_JSON_OPTIONS
      })${isFnAsync && !previouslyAsync
        ? ')()'
        : ''
      };`

      : `${isFnAsync && !previouslyAsync
        ? compilerConstants.ASYNC_START
        : ''
      }${handlerType === 'html'
        ? compilerConstants.HTML_HEADER_DEF
        : compilerConstants.JSON_HEADER_DEF
      }${contextNeedParam
        ? compilerConstants.CTX_PARAMS_DEF
        : compilerConstants.CTX_DEF
      }return new Response(${handlerType === 'json'
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
}
