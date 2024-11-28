import { createRouter, insertItem, compileRouter as compileBaseRouter } from '@mapl/router';
import { statelessNoOpBuilder, type Builder } from '@mapl/compiler';

import type { AnyRouter } from '../router/index.js';
import type { AppCompilerState, CompilerOptions } from '../types/compiler.js';

import { compileMiddlewares, type CachedMiddlewareCompilationResult } from './middleware.js';
import { compileHandler } from './handler.js';
import { selectCtxParamsDef } from './utils.js';
import type { AnyHandler } from '../router/types/handler.js';

// eslint-disable-next-line
const compileHandlerWithMiddleware = (
  middlewareResult: CachedMiddlewareCompilationResult,
  handler: AnyHandler, state: AppCompilerState,
  hasParam: boolean
): string => (middlewareResult[1] === null
  ? middlewareResult[0] + compileHandler(handler, state.externalValues, middlewareResult[2], hasParam)
  : middlewareResult[1] + selectCtxParamsDef(!hasParam) + middlewareResult[0] + compileHandler(handler, state.externalValues, middlewareResult[2], null)
) + (middlewareResult[2] ? compilerConstants.ASYNC_END : '');

// DFS and compile every subrouter
// eslint-disable-next-line
export const compileRouter = (
  prefixPath: string, hasParam: boolean,
  router: AnyRouter, state: AppCompilerState,
  prevValue: CachedMiddlewareCompilationResult
): void => {
  // Cache the middleware result
  const middlewareResult = compileMiddlewares(router, state, prevValue);

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
        `(()=>{let ${compilerConstants.REQ}=new Request("http://127.0.0.1" + "${path}"),${compilerConstants.METHOD}="GET";${compilerConstants.PARSE_PATH}${
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

    compileRouter(
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
export const compile = (router: AnyRouter): AppCompilerState => {
  const state: AppCompilerState = {
    routeTrees: [null, null],
    prebuilds: [],

    // Fake content builder when only requires the external dependencies
    contentBuilder: [] as string[],
    declarationBuilders: [] as any[],

    externalValues: [] as any[]
  };

  // Put all stuff into the radix tree
  compileRouter('', false, router, state, ['', null, false, false, {}, null]);
  return state;
};

/**
 * Get router dependencies to inject
 */
// eslint-disable-next-line
export const compileDeps = (router: AnyRouter): any[] => {
  const externalValues = [] as any[];

  // Put all stuff into the radix tree
  compileRouter('', false, router, {
    routeTrees: [null, null],
    prebuilds: [],

    // Fake content builder when only requires the external dependencies
    contentBuilder: statelessNoOpBuilder as Builder<string>,
    declarationBuilders: statelessNoOpBuilder as Builder<Builder<string>>,

    externalValues
  }, ['', null, false, false, {}, null]);

  return externalValues;
};

// eslint-disable-next-line
export const loadStatePrebuilds = (state: AppCompilerState, options: CompilerOptions): string => {
  const prebuilds = state.prebuilds;
  if (prebuilds.length === 0) return '';

  const responses = state.declarationBuilders.push([`await Promise.all([${prebuilds.map((val) => val[1]).join()}])`]);

  //
  if (options.exportPrebuilds === true)
    return `,static:{${prebuilds.map((val, idx) => `"${val[0]}":d${responses}[${idx}]`).join()}}`;

  const emptyResponses = state.declarationBuilders.push([`d${responses}.map((r)=>new Response(null,{status:r.status,statusText:r.statusText,headers:r.headers}))`]);

  for (let i = 0, l = prebuilds.length, routeTrees = state.routeTrees; i < l; i++) {
    insertItem(
      // eslint-disable-next-line
      (routeTrees[0] ??= {}).GET ??= createRouter(),
      prebuilds[i][0],
      `return d${responses}[${i}].clone();`
    );

    // Return the response with no body for HEAD and OPTIONS method
    insertItem(
      // eslint-disable-next-line
      (routeTrees[0] ??= {}).HEAD ??= createRouter(),
      prebuilds[i][0],
      `return d${emptyResponses}[${i}];`
    );

    insertItem(
      // eslint-disable-next-line
      (routeTrees[0] ??= {}).OPTIONS ??= createRouter(),
      prebuilds[i][0],
      `return d${emptyResponses}[${i}];`
    );
  }

  return '';
};

export function loadStateTree(state: AppCompilerState): void {
  const routeTrees = state.routeTrees;
  const contentBuilder = state.contentBuilder;

  if (routeTrees[0] !== null) {
    contentBuilder.push(`let ${compilerConstants.METHOD}=${compilerConstants.REQ}.method;`);
    const methodTrees = routeTrees[0];

    // Track whether this has more than 1 element
    let hasMultiple = false;

    for (const key in methodTrees) {
      // Method should not be malformed
      contentBuilder.push(`${hasMultiple ? 'else ' : ''}if(${compilerConstants.METHOD}==="${key}"){${compilerConstants.PARSE_PATH}`);
      compileBaseRouter(methodTrees[key], contentBuilder);
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
    compileBaseRouter(routeTrees[1], contentBuilder);

    if (routeTrees[0] !== null)
      contentBuilder.push('}');
  }

  contentBuilder.push(compilerConstants.RET_404);
}
