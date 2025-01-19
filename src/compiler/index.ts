import type { AnyHandler } from '../router/types/handler.js';
import type { AnyRouter } from '../router/index.js';
import type { AppCompilerState, CompilerOptions } from '../types/compiler.js';

import { createRouter, insertItem } from '@mapl/router';
import buildRouter from '@mapl/router/compile.js';
import fastBuildRouter, { injectMatcher, injectRouter } from '@mapl/router/fast-compile.js';

import { compileMiddlewares, type MiddlewareState } from './middleware.js';
import { compileHandler } from './handler.js';

const compileHandlerWithMiddleware = (
  middlewareResult: MiddlewareState,
  handler: AnyHandler, state: AppCompilerState,
  hasParam: boolean
): string => (middlewareResult[1] === null
  ? middlewareResult[0] + compileHandler(handler, state.externalValues, middlewareResult[2], hasParam, false)
  : middlewareResult[1] + compilerConstants.CTX_DEF + middlewareResult[0] + compileHandler(handler, state.externalValues, middlewareResult[2], hasParam, true)
) + (middlewareResult[2] ? compilerConstants.ASYNC_END : '');

// DFS and compile every subrouter
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
    routes = router.routes;
    i < routes.length; i++
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
        `(()=>{let ${compilerConstants.REQ}=new Request("http://127.0.0.1${path}");${compilerConstants.PARSE_PATH}${
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
  for (let i = 0, subrouters = router.subrouters; i < subrouters.length; i++) {
    const subrouterData = subrouters[i];

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

export const compile = async (router: AnyRouter): Promise<AppCompilerState> => {
  const state: AppCompilerState = {
    routeTrees: [null, null],
    prebuilds: [],

    declarationBuilders: [],
    globalBuilders: new Map(),

    externalValues: []
  };

  // Put all stuff into the radix tree
  await compileRouter('', false, router, state, ['', null, false, null, {}, 0, new Set()]);
  return state;
};

export const loadStatePrebuilds = (state: AppCompilerState, options: CompilerOptions): string => {
  const prebuilds = state.prebuilds;
  if (prebuilds.length === 0) return '';

  const responses = state.declarationBuilders.push(`await Promise.all([${prebuilds.map((val) => val[1]).join()}])`);

  // Expose static routes
  if (options.exposeStatic === true)
    return `,static:{${prebuilds.map((val, idx) => `"${val[0]}":d${responses}[${idx}]`).join()}}`;

  // Inject as dependencies
  const emptyResponses = state.declarationBuilders.push(`d${responses}.map((r)=>new Response(null,{status:r.status,statusText:r.statusText,headers:r.headers}))`);

  for (
    let i = 0,
      routeTrees = state.routeTrees[0] ??= {},
      // eslint-disable-next-line
      GET = routeTrees.GET ??= createRouter(),
      // eslint-disable-next-line
      HEAD = routeTrees.HEAD ??= createRouter(),
      // eslint-disable-next-line
      OPTIONS = routeTrees.OPTIONS ??= createRouter(),
      // State
      emptyResponseRet: string, path: string;
    i < prebuilds.length;
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

export function loadStateTree(state: AppCompilerState): string {
  let builder = compilerConstants.PARSE_PATH;
  const routeTrees = state.routeTrees;

  if (routeTrees[0] !== null) {
    // Start the switch statement
    builder += `switch(${compilerConstants.REQ}.method){`;
    for (const key in routeTrees[0]) builder += `case"${key}":{${buildRouter(routeTrees[0][key])}break;}`;
    builder += '}';
  }

  // Load all method routes
  return (routeTrees[1] === null
    ? builder
    : builder + buildRouter(routeTrees[1])
  ) + compilerConstants.RET_404;
}

export function fastLoadStateTree(state: AppCompilerState): string {
  let builder = '';

  const routeTrees = state.routeTrees;
  const decls = state.declarationBuilders as string[];
  const deps = state.externalValues;

  // Inject the route matcher into outside dependencies
  const matcherId = injectMatcher(deps);

  if (routeTrees[0] !== null) {
    // Start the switch statement
    builder += `switch(${compilerConstants.REQ}.method){`;

    for (const key in routeTrees[0]) {
      builder += `case"${key}":{${compilerConstants.PARSE_PATH}${
        fastBuildRouter(routeTrees[0][key], decls, injectRouter(deps, routeTrees[0][key]), matcherId, compilerConstants.CAPTURE_ARGS)
      }break;}`;
    }
    builder += '}';
  }

  // Load all method routes
  if (routeTrees[1] !== null) {
    builder += compilerConstants.PARSE_PATH;
    builder += fastBuildRouter(routeTrees[1], decls, injectRouter(deps, routeTrees[1]), matcherId, compilerConstants.CAPTURE_ARGS);
  }

  return builder + compilerConstants.RET_404;
}
