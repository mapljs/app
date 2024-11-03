import type { DynamicException, StaticException, ExcludeExceptionType } from '../exception.js';
import type { RouteRegisters } from './route.js';
import type { Context } from './types/context.js';
import type { AnyHandler, Handler, HandlerData, PrebuildData } from './types/handler.js';
import type { MacroMiddlewareFunction, MiddlewareData, MiddlewareFunction } from './types/middleware.js';

export type AnyRouter = Router<any, HandlerData[], [string, AnyRouter][]>;
export type BaseRouter = Router<{}, [], []>;

// Merge two router types
export type MergeRouter<T1 extends AnyRouter, T2 extends AnyRouter> = Router<
  T1['stateType'] & T2['stateType'],
  [...T1['routes'], ...T2['routes']],
  [...T1['subrouters'], ...T2['subrouters']]
>;

interface Router<
  State,
  Routes extends HandlerData[],
  SubRouters extends [string, AnyRouter][]
> extends RouteRegisters<State, Routes, SubRouters> { }

// eslint-disable-next-line
class Router<State, Routes, SubRouters> {
  declare public readonly stateType: State;

  // Leave handling to the main app
  public readonly middlewares: MiddlewareData[];
  public readonly routes: Routes;
  public readonly subrouters: SubRouters;

  public readonly exceptRoutes: [error: StaticException | DynamicException<any>, handler: AnyHandler][];
  public allExceptRoute?: Handler<State>;

  public constructor() {
    this.middlewares = [];
    this.routes = [] as unknown as Routes;
    this.subrouters = [] as unknown as SubRouters;
    this.exceptRoutes = [];
  }

  /**
   * Register a subrouter
   */
  public route<Path extends string, SubRouter extends AnyRouter>(path: string, subrouter: SubRouter): Router<
    State, Routes, [...SubRouters, [Path, SubRouter]]
  > {
    this.subrouters.push([path, subrouter]);
    return this as any;
  }

  /**
   * Register a macro
   */
  public inline<TypeExtension extends AnyRouter>(fn: MacroMiddlewareFunction<TypeExtension>): MergeRouter<this, TypeExtension> {
    this.middlewares.push([0, fn]);
    return this as any;
  }

  /**
   * Register a function to parse and set the result to the context
   */
  public parse<Prop extends string, ParserReturn>(prop: Prop, fn: (ctx: Context & State) => ParserReturn): Router<
    State & { [K in Prop]: ExcludeExceptionType<Awaited<ParserReturn>> }, Routes, SubRouters
  > {
    this.middlewares.push([1, fn, prop]);
    return this as any;
  }

  /**
   * Register a function that validate every request
   */
  public validate(fn: MiddlewareFunction<State>): this {
    this.middlewares.push([2, fn]);
    return this;
  }

  /**
   * Register a function that runs on every request
   */
  public use(fn: MiddlewareFunction<State>): this {
    this.middlewares.push([3, fn]);
    return this;
  }

  /**
   * Register a function that runs on every request and set result to context
   */
  public set<Prop extends string, ParserReturn>(prop: Prop, fn: (ctx: Context & State) => ParserReturn): Router<
    State & { [K in Prop]: Awaited<ParserReturn> }, Routes, SubRouters
  > {
    this.middlewares.push([4, fn, prop]);
    return this as any;
  }

  /**
   * Add response headers
   */
  public headers(headers: HeadersInit): this {
    this.middlewares.push([
      5, Array.isArray(headers)
        ? headers
        : headers instanceof Headers
          ? Array.from(headers.entries())
          : Object.entries(headers)
    ]);

    return this;
  }

  /**
   * Handle a static exception
   */
  public catch<T extends Handler<{}>>(exception: StaticException, handler: T): Router<
    State, Routes, SubRouters
  >;

  /**
   * Handle a dynamic exception
   */
  public catch<Payload, T extends Handler<{}, [Payload]>>(exception: DynamicException<Payload>, handler: T): Router<
    State, Routes, SubRouters
  >;

  /**
   * @internal
   * @ignore
   */
  public catch(exception: any, handler: any): any {
    this.exceptRoutes.push([exception, handler]);
    return this;
  }

  /**
   * Handle all exceptions
   */
  public catchAll<T extends Handler<{}>>(handler: T): Router<
    State, Routes, SubRouters
  > {
    this.allExceptRoute = handler;
    return this as any;
  }

  /**
   * @internal
   * @ignore
   */
  public get(path: string, handler: any): any {
    this.routes.push(['GET', path, handler]);
    return this;
  }

  /**
   * @internal
   * @ignore
   */
  public head(path: string, handler: any): any {
    this.routes.push(['HEAD', path, handler]);
    return this;
  }

  /**
   * @internal
   * @ignore
   */
  public post(path: string, handler: any): any {
    this.routes.push(['POST', path, handler]);
    return this;
  }

  /**
   * @internal
   * @ignore
   */
  public put(path: string, handler: any): any {
    this.routes.push(['PUT', path, handler]);
    return this;
  }

  /**
   * @internal
   * @ignore
   */
  public delete(path: string, handler: any): any {
    this.routes.push(['DELETE', path, handler]);
    return this;
  }

  /**
   * @internal
   * @ignore
   */
  public patch(path: string, handler: any): any {
    this.routes.push(['PATCH', path, handler]);
    return this;
  }

  /**
   * @internal
   * @ignore
   */
  public options(path: string, handler: any): any {
    this.routes.push(['OPTIONS', path, handler]);
    return this;
  }

  /**
   * @internal
   * @ignore
   */
  public trace(path: string, handler: any): any {
    this.routes.push(['TRACE', path, handler]);
    return this;
  }

  /**
   * @internal
   * @ignore
   */
  public any(path: string, handler: any): any {
    this.routes.push([null, path, handler]);
    return this;
  }

  /**
   * @internal
   * @ignore
   */
  public prebuild(path: string, handler: any): any {
    this.routes.push([0, path, handler]);
    return this;
  }
}

export { Router };

export function router(): BaseRouter {
  return new Router();
}
