import type { AnyRouter } from '../router';
import type { AppRouterCompilerState } from '../types/compiler';
import isAsync from './utils/isAsync';

type MiddlewareValue = [builder: string, requireAsync: boolean, requireContext: boolean];

// Compile and cache middleware compilation result
export function compileMiddleware(list: AnyRouter['middlewares'], state: AppRouterCompilerState, prevValue: MiddlewareValue): MiddlewareValue {
  let builder = prevValue[0];
  let requireAsync = prevValue[1];
  let requireContext = prevValue[2];

  const externalValues = state.externalValues;

  for (let i = 0, l = list.length; i < l; i++) {
    const middlewareData = list[i];
    const fn = middlewareData[1];

    const isFnAsync = isAsync(fn);
    requireAsync ||= isFnAsync;

    const needContext = fn.length !== 0;
    requireContext ||= needContext;

    const fnCall = `${isFnAsync ? 'await ' : ''}f${externalValues.push(fn) - 1}(${needContext ? 'c' : ''});`;

    switch (middlewareData[0]) {
      // Parsers
      case 1: {
        const resultId = state.localVarCount++;
        builder += `const v${resultId}=${fnCall}`;

        // TODO: Compile and check errors

        // Set the prop to the context (prop name must be an identifier)
        builder += `c.${middlewareData[2]}=v${resultId};`;
        break;
      }

      // Validators
      case 2: {
        const resultId = state.localVarCount++;
        builder += `const v${resultId}=${fnCall}`;

        // TODO: Compile and check errors
        break;
      }

      // Normal middlewares
      case 3: {
        builder += fnCall;
        break;
      }
    }
  }

  return [builder, requireAsync, requireContext];
}

