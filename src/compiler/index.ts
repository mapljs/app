import { createRouter, insertItem, compileRouter as compileBaseRouter } from '@mapl/router';
import { statelessNoOpBuilder } from '@mapl/compiler';

import type { AnyRouter } from '../router/index.js';
import type { AppRouterCompilerState } from '../types/compiler.js';

import { compileMiddlewares, type CachedMiddlewareCompilationResult } from './middleware.js';
import { compileHandler } from './handler.js';
import { symbol as exceptionSymbol } from '../exception.js';
import { selectCtxParamsDef } from './utils.js';
import type { AnyHandler } from '../router/types/handler.js';

// eslint-disable-next-line
const compileHandlerWithMiddleware = (
  middlewareResult: CachedMiddlewareCompilationResult,
  handler: AnyHandler, state: AppRouterCompilerState,
  hasParam: boolean
): string => (middlewareResult[1] === null
  ? middlewareResult[0] + compileHandler(handler, state.externalValues, middlewareResult[2], hasParam)
  : middlewareResult[1] + selectCtxParamsDef(!hasParam) + middlewareResult[0] + compileHandler(handler, state.externalValues, middlewareResult[2], null)
) + (middlewareResult[2] ? compilerConstants.ASYNC_END : '');

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

    if (route[0] === 0) {
      // Build an iife
      // How to compile this will be decided later
      state.prebuilds.push([
        path,
        // Polyfill all required props
        `(()=>{let ${compilerConstants.REQ}=new Request(${JSON.stringify(path)}),${compilerConstants.METHOD}="GET";${compilerConstants.PARSE_PATH}${
          compileHandlerWithMiddleware(middlewareResult, route[2], state, false)
        }})()`
      ]);
    } else {
      // Load that into the tree to compile later on
      insertItem(
        route[0] === null
          ? routeTrees[1] ??= createRouter()
          : (routeTrees[0] ??= {})[route[0]] ??= createRouter(),
        path,
        [middlewareResult, route[2]]
      );
    }
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

// eslint-disable-next-line
export const compile = (router: AnyRouter, loadOnlyDependency: boolean): AppRouterCompilerState => {
  const routeTrees: AppRouterCompilerState['routeTrees'] = [null, null];
  const prebuilds: AppRouterCompilerState['prebuilds'] = [];
  // Fake content builder when only requires the external dependencies
  const contentBuilder = loadOnlyDependency ? statelessNoOpBuilder : [] as string[];

  const state: AppRouterCompilerState = {
    routeTrees,
    prebuilds,

    compileItem: (item, currentState, hasParam) => state.contentBuilder.push(compileHandlerWithMiddleware(...item, currentState, hasParam)),

    contentBuilder,
    declarationBuilders: loadOnlyDependency ? statelessNoOpBuilder : [] as any[],

    // Exception symbol is f0
    externalValues: [exceptionSymbol]
  };

  // Put all stuff into the radix tree
  compileRouter('', router, state, ['', null, false, false, {}, null]);

  // TODO: Add an option to either load prebuilts into the tree or export it

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
