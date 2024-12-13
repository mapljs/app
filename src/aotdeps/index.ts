import { statelessNoOpBuilder, type Builder } from '@mapl/compiler';

import type { AnyRouter } from '../router/index.js';
import type { AppCompilerState } from '../types/compiler.js';

import { compileMiddlewares } from './middleware.js';
import type { MiddlewareState } from '../compiler/middleware.js';
import { buildStaticHandler } from './utils.js';

// DFS and compile every subrouter
// eslint-disable-next-line
export const compileRouter = (
  hasParam: boolean,
  router: AnyRouter, state: AppCompilerState,
  prevValue: MiddlewareState
): void => {
  // Cache the middleware result
  const middlewareResult = compileMiddlewares(router, state, prevValue);

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
  for (let i = 0, subrouters = router.subrouters, l = subrouters.length; i < l; i++) {
    const subrouterData = subrouters[i];

    compileRouter(
      // Check whether this path has params
      hasParam || subrouterData[0].includes('*'),

      subrouterData[1],
      state,
      middlewareResult
    );
  }
};

/**
 * Get router dependencies to inject
 */
export default (router: AnyRouter): any[] => {
  const externalValues = [] as any[];

  // Put all stuff into the radix tree
  compileRouter(false, router, {
    routeTrees: [null, null],
    prebuilds: [],

    // Fake content builder when only requires the external dependencies
    contentBuilder: statelessNoOpBuilder as Builder<string>,
    declarationBuilders: statelessNoOpBuilder as Builder<Builder<string>>,

    externalValues
  }, ['', null, false, false, {}, null]);

  return externalValues;
};
