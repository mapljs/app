import type { AnyRouter } from '../router/index.js';
import type { AnyHandler } from '../router/types/handler.js';
import type { AppCompilerState } from '../types/compiler.js';
import type { ExceptHandlerBuilders } from '../compiler/exceptions.js';
import { buildStaticHandler } from './utils.js';

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

// eslint-disable-next-line
const emptyCb = () => '';

// Load new exception handlers

export const buildExceptionHandlers = (prevValue: ExceptHandlerBuilders, router: AnyRouter, externalValues: AppCompilerState['externalValues']): ExceptHandlerBuilders => {
  const routes = router.exceptRoutes;
  const allExceptRoute = router.allExceptRoute;

  // No new routes have been set
  if (routes.length === 0 && typeof allExceptRoute === 'undefined') return prevValue;

  const newRoutes = { ...prevValue };
  for (let i = 0, l = routes.length; i < l; i++) {
    const exception = routes[i][0];
    buildHandler(routes[i][1], externalValues);
    newRoutes[Array.isArray(exception) ? exception[1] : exception(null)[1]] = emptyCb;
  }

  // Set all except route
  if (typeof allExceptRoute !== 'undefined') {
    buildHandler(allExceptRoute, externalValues);
    newRoutes[0] = emptyCb;
  }

  return newRoutes;
};
