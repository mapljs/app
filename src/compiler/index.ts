import { createRouter, insertItem, compileRouter as compileBaseRouter } from '@mapl/router';
import type { AnyRouter } from '../router/index.js';
import type { AppRouterCompilerState } from '../types/compiler.js';
import { compileMiddlewares, type CachedMiddlewareCompilationResult } from './middleware.js';
import { PARAMS, REQ } from '@mapl/router/constants.js';
import { compileNormalHandler } from './handler.js';
import { METHOD, PARSE_PATH } from './constants.js';
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
  const contextPayload = hasParam ? `,params:${PARAMS}` : '';

  // Remember to close scope
  const closeScope = middlewareResult[2] ? '});' : '';

  if (middlewareResult[1] === null)
    state.contentBuilder.push(`${middlewareResult[0]}${compileNormalHandler(item[1], state.externalValues, middlewareResult[2], contextPayload)}${closeScope}`);
  else
    // Don't try to create a new context if it already has been created
    state.contentBuilder.push(`${middlewareResult[1]}${contextPayload}${middlewareResult[0]}${compileNormalHandler(item[1], state.externalValues, middlewareResult[2], null)}${closeScope}`);
};

export function compile(router: AnyRouter): AppRouterCompilerState {
  // Load all states in the tree first
  const contentBuilder: string[] = [];
  const routeTrees: AppRouterCompilerState['routeTrees'] = [null, null];
  const state: AppRouterCompilerState = {
    routeTrees,
    compileItem,

    contentBuilder,
    declarationBuilders: [],
    localVarCount: 0,
    externalValues: [exceptionSymbol]
  };

  // eslint-disable-next-line
  compileRouter('', router, state, ['', null, false, {}]);

  // Actually load the entire tree here
  if (routeTrees[0] !== null) {
    contentBuilder.push(`const ${METHOD}=${REQ}.method;`);
    const methodTrees = routeTrees[0];

    for (const key in methodTrees) {
      contentBuilder.push(`if(${METHOD}===${JSON.stringify(key)}){${PARSE_PATH}`);
      // @ts-expect-error Same state lol
      compileBaseRouter(methodTrees[key], state);
      contentBuilder.push('}');
    }
  }

  // Load all method routes
  if (routeTrees[1] !== null) {
    if (routeTrees[0] !== null)
      contentBuilder.push('else{');

    contentBuilder.push(PARSE_PATH);
    // @ts-expect-error Same state lol
    compileBaseRouter(routeTrees[1], state);

    if (routeTrees[0] !== null)
      contentBuilder.push('}');
  }

  return state;
}
