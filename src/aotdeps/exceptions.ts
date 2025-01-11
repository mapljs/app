import type { AnyRouter } from '../router/index.js';
import type { AnyHandler } from '../router/types/handler.js';
import type { AppCompilerState } from '../types/compiler.js';
import { buildStaticHandler } from './utils.js';
import type { MiddlewareState } from '../compiler/middleware.js';

// Build closures that generates exception content
export const buildHandler = (handler: AnyHandler, externalValues: AppCompilerState['externalValues']): void => {
  // Plain text
  if (typeof handler === 'function')
    externalValues.push(handler);
  // Static response
  else if (handler.type === 'static') {
    buildStaticHandler(handler.body, handler.options, externalValues, null);
    buildStaticHandler(handler.body, handler.options, externalValues, false);
  } else externalValues.push(handler.fn);
};

// Load new exception handlers
export const buildExceptionHandlers = (prevState: MiddlewareState, router: AnyRouter, externalValues: AppCompilerState['externalValues']): MiddlewareState => {
  const routes = router.exceptRoutes;
  const allExceptRoute = router.allExceptRoute;

  // No new routes have been set
  if (routes.length === 0 && typeof allExceptRoute === 'undefined')
    return [...prevState];

  for (let i = 0; i < routes.length; i++) buildHandler(routes[i][1], externalValues);

  // Set all except route
  if (typeof allExceptRoute !== 'undefined')
    buildHandler(allExceptRoute, externalValues);

  // Reset exception content only
  return prevState.with(3, null) as MiddlewareState;
};
