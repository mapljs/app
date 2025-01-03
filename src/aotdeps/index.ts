import type { AnyRouter } from '../router/index.js';
import type { AppCompilerState } from '../types/compiler.js';

import { compileMiddlewares } from './middleware.js';
import type { MiddlewareState } from '../compiler/middleware.js';
import { buildStaticHandler } from './utils.js';

// DFS and compile every subrouter
// eslint-disable-next-line
export const compileRouter = async (
  hasParam: boolean,
  router: AnyRouter, state: AppCompilerState,
  prevValue: MiddlewareState
): Promise<void> => {
  // Cache the middleware result
  const middlewareResult = await compileMiddlewares(router, state, prevValue);

  // Load all routes into the tree
  for (let i = 0,
    routes = router.routes,
    l = routes.length; i < l; i++
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
  for (let i = 0, subrouters = router.subrouters, l = subrouters.length, cur; i < l; i++) {
    cur = subrouters[i];

    // eslint-disable-next-line
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

/**
 * Get router dependencies to inject
 */
export default async (router: AnyRouter): Promise<any[]> => {
  const externalValues = [] as any[];

  // Put all stuff into the radix tree
  await compileRouter(false, router, {
    routeTrees: [null, null],
    prebuilds: [],

    declarationBuilders: [],
    globalBuilders: new Map(),

    externalValues
  }, ['', null, false, null, {}, 0, []]);

  return externalValues;
};
