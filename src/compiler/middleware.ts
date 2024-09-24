import type { AnyRouter } from '../router';
import type { AppRouterCompilerState, CachedCompilationResult } from '../types/compiler';
import { VAR_PREFIX } from './constants';
import { compileExceptRoutes, loadExceptRoutes } from './handler';
import isAsync from './utils/isAsync';

// Compile and cache middleware compilation result
export function compileMiddleware(router: AnyRouter, state: AppRouterCompilerState, prevValue: CachedCompilationResult): CachedCompilationResult {
  let builder = prevValue[0];
  let requireAsync = prevValue[1];
  let requireContext = prevValue[2];

  const externalValues = state.externalValues;

  const list = router.middlewares;
  const exceptionData = compileExceptRoutes(router, state);

  for (let i = 0, l = list.length; i < l; i++) {
    const middlewareData = list[i];
    const fn = middlewareData[1];

    const isFnAsync = isAsync(fn);
    const needContext = fn.length !== 0;

    const fnCall = `${isFnAsync ? 'await ' : ''}f${externalValues.push(fn) - 1}(${needContext ? 'c' : ''});`;

    switch (middlewareData[0]) {
      // Parsers
      case 1: {
        const resultId = state.localVarCount++;
        // Set the prop to the context (prop name must be an identifier)
        builder += `const v${resultId}=${fnCall}${loadExceptRoutes(exceptionData, `v${resultId}`, requireAsync)}c.${middlewareData[2]}=v${resultId};`;
        break;
      }

      // Validators
      case 2: {
        const resultId = state.localVarCount++;
        builder += `const ${VAR_PREFIX}${resultId}=${fnCall}${loadExceptRoutes(exceptionData, `${VAR_PREFIX}${resultId}`, requireAsync)}`;
        break;
      }

      // Normal middlewares
      case 3: {
        builder += fnCall;
        break;
      }
    }

    requireAsync ||= isFnAsync;
    requireContext ||= needContext;
  }

  return [builder, requireAsync, requireContext];
}

