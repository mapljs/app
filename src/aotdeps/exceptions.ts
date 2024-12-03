import type { AnyRouter } from '../router/index.js';
import type { AnyHandler } from '../router/types/handler.js';
import type { AppCompilerState } from '../types/compiler.js';
import type { ExceptHandlerBuilders, ExceptHandlerBuilder } from '../compiler/exceptions.js';
import { buildStaticHandler } from './utils.js';

// eslint-disable-next-line
const emptyCb = () => '';

// Build closures that generates exception content
// eslint-disable-next-line
export const buildHandler = (handler: AnyHandler, externalValues: AppCompilerState['externalValues']): ExceptHandlerBuilder => {
  // Plain text
  if (typeof handler === 'function') {
    externalValues.push(handler);
    return emptyCb;
  }

  // Static response
  if (handler.type === 'static') {
    // Lazily compile two cases
    let hasContextCase: string | null = null;
    let noContextCase: string | null = null;

    // eslint-disable-next-line
    return (hasContext) => hasContext
      ? hasContextCase ??= buildStaticHandler(handler.body, handler.options, externalValues, null)
      : noContextCase ??= buildStaticHandler(handler.body, handler.options, externalValues, false);
  }

  externalValues.push(handler.fn);
  return emptyCb;
};

// eslint-disable-next-line
export const loadExceptionHandlers = (builders: ExceptHandlerBuilders, hasContext: boolean, isAsync: boolean): string => {
  for (const id in builders) builders[id](hasContext, isAsync);

  if (typeof builders[0] !== 'undefined')
    builders[0](hasContext, isAsync);

  return '';
};

// Load new exception handlers
// eslint-disable-next-line
export const buildExceptionHandlers = (prevValue: ExceptHandlerBuilders, router: AnyRouter, externalValues: AppCompilerState['externalValues']): ExceptHandlerBuilders => {
  const routes = router.exceptRoutes;
  const allExceptRoute = router.allExceptRoute;

  // No new routes have been set
  if (routes.length === 0 && typeof allExceptRoute === 'undefined') return prevValue;

  const newRoutes = { ...prevValue };
  for (let i = 0, l = routes.length; i < l; i++) {
    const exception = routes[i][0];
    newRoutes[Array.isArray(exception) ? exception[1] : exception.id] = buildHandler(routes[i][1], externalValues);
  }

  // Set all except route
  if (typeof allExceptRoute !== 'undefined')
    newRoutes[0] = buildHandler(allExceptRoute, externalValues);

  return newRoutes;
};
