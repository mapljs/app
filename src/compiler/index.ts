import { createRouter, insertItem, compileRouter as compileBaseRouter } from '@mapl/router';
import { statelessNoOpBuilder } from '@mapl/compiler';

import type { AnyRouter } from '../router/index.js';
import type { AppRouterCompilerState } from '../types/compiler.js';

import { compileMiddlewares, type CachedMiddlewareCompilationResult } from './middleware.js';
import { compileHandler } from './handler.js';
import { symbol as exceptionSymbol } from '../exception.js';
import { selectCtxParamsDef } from './utils.js';

// DFS and compile every subrouter
// eslint-disable-next-line
export const compileRouter = (prefixPath: string, router: AnyRouter, state: AppRouterCompilerState, prevValue: CachedMiddlewareCompilationResult): void => {
  // Cache the middleware result
  const middlewareResult = compileMiddlewares(router, state, prevValue);

  // Load all routes into the tree
  for (let i = 0,
    routeTrees = state.routeTrees,
    routes = router.routes,
    l = routes.length; i < l; i++
  ) {
    const route = routes[i];
    const path = route[1] === '/'
      ? prefixPath === '' ? '/' : prefixPath
      : prefixPath + route[1];

    // TODO: Prebuilds
    if (Array.isArray(route[2]))
      throw new Error('TODO: Prebuild');

    // Load that into the tree to compile later on
    insertItem(
      route[0] === null
        ? routeTrees[1] ??= createRouter()
        : (routeTrees[0] ??= {})[route[0]] ??= createRouter(),
      path,
      [middlewareResult, route[2]]
    );
  }

  // Visit and compile all sub-routers
  for (let i = 0, subrouters = router.subrouters, l = subrouters.length; i < l; i++) {
    const subrouterData = subrouters[i];

    compileRouter(
      subrouterData[0] === '/' ? prefixPath : prefixPath + subrouterData[0],
      subrouterData[1],
      state,
      middlewareResult
    );
  }
};

// Compile a single item
// eslint-disable-next-line
export const compileItem: AppRouterCompilerState['compileItem'] = (item, state, hasParam) => {
  const middlewareResult = item[0];

  state.contentBuilder.push(middlewareResult[1] === null
    ? middlewareResult[0] + compileHandler(item[1], state.externalValues, middlewareResult[2], hasParam)
    : middlewareResult[1] + selectCtxParamsDef(!hasParam) + middlewareResult[0] + compileHandler(item[1], state.externalValues, middlewareResult[2], null));

  if (middlewareResult[2])
    state.contentBuilder.push(compilerConstants.ASYNC_END);
};

// eslint-disable-next-line
export const compile = (router: AnyRouter, loadOnlyDependency: boolean): AppRouterCompilerState => {
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
      // Method should not be malformed
      contentBuilder.push(`${hasMultiple ? 'else ' : ''}if(${compilerConstants.METHOD}==="${key}"){${compilerConstants.PARSE_PATH}`);
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
};
