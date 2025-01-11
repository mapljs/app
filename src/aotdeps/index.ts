import type { AnyRouter } from '../router/index.js';
import type { AppCompilerState, RouteTrees } from '../types/compiler.js';

import { compileMiddlewares } from './middleware.js';
import type { MiddlewareState } from '../compiler/middleware.js';
import { buildStaticHandler } from './utils.js';
import { injectMatcher, injectRouter } from '@mapl/router/fast-compile.js';

// DFS and compile every subrouter
export const compileRouter = async (
  hasParam: boolean,
  router: AnyRouter, state: AppCompilerState,
  prevValue: MiddlewareState
): Promise<void> => {
  // Cache the middleware result
  const middlewareResult = await compileMiddlewares(router, state, prevValue);

  // Load all routes into the tree
  for (let i = 0,
    routes = router.routes;
    i < routes.length; i++
  ) {
    const route = routes[i];

    // Mimic compile a handler here
    if (typeof route[2] === 'function')
      state.externalValues.push(route[2]);
    else if (route[2].type === 'static') {
      buildStaticHandler(route[2].body, route[2].options, state.externalValues, middlewareResult[1] === null
        ? route[0] !== 0 && (hasParam || route[1].includes('*')) // Need params when not a prebuilt route
        : null); // Already has context so no
    } else
      state.externalValues.push(route[2].fn);
  }

  // Visit and compile all sub-routers
  for (let i = 0, subrouters = router.subrouters, cur; i < subrouters.length; i++) {
    cur = subrouters[i];

    await compileRouter(
      // Check whether this path has params
      hasParam || cur[0].includes('*'),
      // Target router
      cur[1],
      // States
      state,
      middlewareResult
    );
  }
};

// eslint-disable-next-line
const emptyCb = () => { };
// Memory saving trick
const proxy = new Proxy({}, { get: () => emptyCb });

/**
 * Get router dependencies to inject
 */
export default async (router: AnyRouter): Promise<any[]> => {
  const externalValues = [] as any[];
  const routeTrees = [null, null] as RouteTrees;

  // Put all stuff into the radix tree
  await compileRouter(false, router, {
    routeTrees,
    prebuilds: [],

    declarationBuilders: [],
    globalBuilders: new Map(),

    externalValues
  }, ['', null, false, null, proxy, 0, []]);

  // fastLoadStateTree
  injectMatcher(externalValues);

  if (routeTrees[0] !== null)
    for (const key in routeTrees[0]) injectRouter(externalValues, routeTrees[0][key]);
  if (routeTrees[1] !== null)
    injectRouter(externalValues, routeTrees[1]);
  return externalValues;
};
