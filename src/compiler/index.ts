import { createRouter, insertItem, compileRouter as compileBaseRouter } from '@mapl/router';

import type { AnyRouter } from '../router/index.js';
import type { AppCompilerState, CompilerOptions } from '../types/compiler.js';

import { compileMiddlewares, type MiddlewareState } from './middleware.js';
import { compileHandler } from './handler.js';
import { selectCtxParamsDef } from './utils.js';
import type { AnyHandler } from '../router/types/handler.js';

// eslint-disable-next-line
const compileHandlerWithMiddleware = (
  middlewareResult: MiddlewareState,
  handler: AnyHandler, state: AppCompilerState,
  hasParam: boolean
): string => (middlewareResult[1] === null
  ? middlewareResult[0] + compileHandler(handler, state.externalValues, middlewareResult[2], hasParam)
  : middlewareResult[1] + selectCtxParamsDef(!hasParam) + middlewareResult[0] + compileHandler(handler, state.externalValues, middlewareResult[2], null)
) + (middlewareResult[2] ? compilerConstants.ASYNC_END : '');

// DFS and compile every subrouter
// eslint-disable-next-line
export const compileRouter = async (
  prefixPath: string, hasParam: boolean,
  router: AnyRouter, state: AppCompilerState,
  prevValue: MiddlewareState
): Promise<void> => {
  // Cache the middleware result
  const middlewareResult = await compileMiddlewares(router, state, prevValue);

  // Load all routes into the tree
  for (let i = 0,
    routeTrees = state.routeTrees,
    routes = router.routes,
    l = routes.length; i < l; i++
  ) {
    const route = routes[i];

    // Route concatenation
    const path = route[1] === '/'
      ? prefixPath === '' ? '/' : prefixPath
      : prefixPath + route[1];

    if (route[0] === 0) {
      // Build an iife
      // How to compile this will be decided later
      state.prebuilds.push([
        path,
        // Polyfill all required props
        `(()=>{let ${compilerConstants.REQ}=new Request("http://127.0.0.1" + "${path}");${compilerConstants.PARSE_PATH}${
          compileHandlerWithMiddleware(middlewareResult, route[2], state, false)
        }})()`
      ]);
    } else {
      // Load that into the tree to compile later on
      insertItem(
        // Insert to the correct method tree
        route[0] === null
          ? routeTrees[1] ??= createRouter()
          : (routeTrees[0] ??= {})[route[0]] ??= createRouter(),
        path,
        // Check whether this path has params
        compileHandlerWithMiddleware(middlewareResult, route[2], state, hasParam || route[1].includes('*'))
      );
    }
  }

  // Visit and compile all sub-routers
  for (let i = 0, subrouters = router.subrouters, l = subrouters.length; i < l; i++) {
    const subrouterData = subrouters[i];

    // eslint-disable-next-line
    await compileRouter(
      subrouterData[0] === '/' ? prefixPath : prefixPath + subrouterData[0],
      // Check whether this path has params
      hasParam || subrouterData[0].includes('*'),

      subrouterData[1],
      state,
      middlewareResult
    );
  }
};

// eslint-disable-next-line
export const compile = async (router: AnyRouter): Promise<AppCompilerState> => {
  const state: AppCompilerState = {
    routeTrees: [null, null],
    prebuilds: [],

    // Fake content builder when only requires the external dependencies
    contentBuilder: [] as string[],
    declarationBuilders: [] as any[],

    externalValues: [] as any[]
  };

  // Put all stuff into the radix tree
  await compileRouter('', false, router, state, [`let ${compilerConstants.HOLDER};`, null, false, null, {} ]);
  return state;
};

// eslint-disable-next-line
export const loadStatePrebuilds = (state: AppCompilerState, options: CompilerOptions): string => {
  const prebuilds = state.prebuilds;
  if (prebuilds.length === 0) return '';

  const responses = state.declarationBuilders.push([`await Promise.all([${prebuilds.map((val) => val[1]).join()}])`]);

  // Expose static routes
  if (options.exposeStatic === true)
    return `,static:{${prebuilds.map((val, idx) => `"${val[0]}":d${responses}[${idx}]`).join()}}`;

  // Inject as dependencies
  const emptyResponses = state.declarationBuilders.push([`d${responses}.map((r)=>new Response(null,{status:r.status,statusText:r.statusText,headers:r.headers}))`]);

  for (
    let i = 0,
      l = prebuilds.length,
      routeTrees = state.routeTrees[0] ??= {},
      // eslint-disable-next-line
      GET = routeTrees.GET ??= createRouter(),
      // eslint-disable-next-line
      HEAD = routeTrees.HEAD ??= createRouter(),
      // eslint-disable-next-line
      OPTIONS = routeTrees.OPTIONS ??= createRouter(),
      // State
      emptyResponseRet: string, path: string;
    i < l;
    i++
  ) {
    path = prebuilds[i][0];
    insertItem(GET, path, `return d${responses}[${i}].clone();`);

    // Return the response with no body for HEAD and OPTIONS method
    emptyResponseRet = `return d${emptyResponses}[${i}];`;
    insertItem(HEAD, path, emptyResponseRet);
    insertItem(OPTIONS, path, emptyResponseRet);
  }

  return '';
};

export function loadStateTree(state: AppCompilerState): void {
  const routeTrees = state.routeTrees;
  const contentBuilder = state.contentBuilder;

  const hasMethodTrees = routeTrees[0] !== null;

  if (hasMethodTrees) {
    // Start the switch statement
    contentBuilder.push(`switch(${compilerConstants.REQ}.method){`);

    for (const key in routeTrees[0]) {
      // Method should not be malformed
      contentBuilder.push(`case"${key}":{${compilerConstants.PARSE_PATH}`);
      compileBaseRouter(routeTrees[0][key], contentBuilder as string[]);
      contentBuilder.push('}');
    }
  }

  // Load all method routes
  if (routeTrees[1] !== null) {
    if (hasMethodTrees)
      contentBuilder.push('default:{');

    contentBuilder.push(compilerConstants.PARSE_PATH);
    compileBaseRouter(routeTrees[1], contentBuilder as string[]);

    if (hasMethodTrees)
      contentBuilder.push('}');
  }

  // Close the switch statement
  if (hasMethodTrees)
    contentBuilder.push('}');

  contentBuilder.push(compilerConstants.RET_404);
}
