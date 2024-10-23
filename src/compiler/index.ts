import { createRouter, insertItem, compileRouter as compileBaseRouter } from '@mapl/router';
import { statelessNoOpBuilder } from '@mapl/compiler';

import type { AnyRouter } from '../router/index.js';
import type { AppRouterCompilerState } from '../types/compiler.js';
import { compileMiddlewares, type CachedMiddlewareCompilationResult } from './middleware.js';
import { compileHandler } from './handler.js';
import { symbol as exceptionSymbol } from '../exception.js';

// DFS and compile every subrouter
export function compileRouter(prefixPath: string, router: AnyRouter, state: AppRouterCompilerState, prevValue: CachedMiddlewareCompilationResult): void {
  // Cache the middleware result
  const middlewareCompilationResult = compileMiddlewares(router, state, prevValue);

  // Load all routes into the tree
  for (let i = 0, routeTrees = state.routeTrees, routes = router.routes, l = routes.length; i < l; i++) {
    const route = routes[i];
    const path = route[1] === '/'
      ? prefixPath === '' ? '/' : prefixPath
      : prefixPath + route[1];
    const item = [middlewareCompilationResult, route[2]];

    // Load that into the tree to compile later on
    if (route[0] === null)
      insertItem(routeTrees[1] ??= createRouter(), path, item);
    else
      insertItem((routeTrees[0] ??= {})[route[0]] ??= createRouter(), path, item);
  }

  // DFS the subrouters
  for (let i = 0, subrouters = router.subrouters, l = subrouters.length; i < l; i++) {
    const subrouterData = subrouters[i];
    compileRouter(subrouterData[0] === '/' ? prefixPath : prefixPath + subrouterData[0], subrouterData[1], state, middlewareCompilationResult);
  }
}

// Compile a single item
// eslint-disable-next-line
export const compileItem: AppRouterCompilerState['compileItem'] = (item, state, hasParam) => {
  const middlewareResult = item[0];

  state.contentBuilder.push(middlewareResult[1] === null
    ? middlewareResult[0] + compileHandler(item[1], state.externalValues, middlewareResult[2], hasParam)
    : middlewareResult[1] + (hasParam ? compilerConstants.CTX_PARAMS_DEF : compilerConstants.CTX_DEF) + middlewareResult[0] + compileHandler(item[1], state.externalValues, middlewareResult[2], null));

  // Remember to close async scope
  if (middlewareResult[2])
    state.contentBuilder.push(compilerConstants.ASYNC_END);
};

// 0: JIT
// 1: Get only the body
// 2: Get only the dependency
export function compile(router: AnyRouter, loadOnlyDependency: boolean): AppRouterCompilerState {
  const routeTrees: AppRouterCompilerState['routeTrees'] = [null, null];

  // Fake content builder when only requires the external dependencies
  const contentBuilder = loadOnlyDependency ? statelessNoOpBuilder : [] as string[];

  const state: AppRouterCompilerState = {
    routeTrees,
    compileItem,

    contentBuilder,
    declarationBuilders: loadOnlyDependency ? statelessNoOpBuilder : [] as any[],

    // Exception symbol is f0
    externalValues: [exceptionSymbol]
  };

  // Put all stuff into the radix tree

  compileRouter('', router, state, ['', null, false, false, {}, null]);

  // Actually load the entire tree here
  if (routeTrees[0] !== null) {
    contentBuilder.push(`let ${compilerConstants.METHOD}=${compilerConstants.REQ}.method;`);
    const methodTrees = routeTrees[0];

    // Track whether this has more than 1 element
    let hasMultiple = false;

    for (const key in methodTrees) {
      contentBuilder.push(`${hasMultiple ? 'else ' : ''}if(${compilerConstants.METHOD}===${JSON.stringify(key)}){${compilerConstants.PARSE_PATH}`);
      // @ts-expect-error Same state lol
      compileBaseRouter(methodTrees[key], state);
      contentBuilder.push('}');

      // Whether to do else if or just if
      hasMultiple = true;
    }
  }

  // Load all method routes
  if (routeTrees[1] !== null) {
    if (routeTrees[0] !== null)
      contentBuilder.push('else{');

    contentBuilder.push(compilerConstants.PARSE_PATH);
    // @ts-expect-error Same state lol
    compileBaseRouter(routeTrees[1], state);

    if (routeTrees[0] !== null)
      contentBuilder.push('}');
  }

  contentBuilder.push(compilerConstants.RET_404);

  return state;
}
