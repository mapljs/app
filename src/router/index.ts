import { toHeaderTuples } from '../compiler/utils.js';

import type { DynamicException, StaticException, ExcludeExceptionType } from '../exception.js';
import type { Macro } from '../macro.js';
import type { RouteRegisters } from './route.js';
import type { Context } from './types/context.js';
import type { AnyHandler, Handler, HandlerData } from './types/handler.js';
import type { MiddlewareData, MiddlewareFunction } from './types/middleware.js';

export type AnyRouter = Router<any, HandlerData[], [string, AnyRouter][]>;

// Merge two router types
export type MergeRouter<T1 extends AnyRouter, T2 extends AnyRouter> = Router<
  T1['stateType'] & T2['stateType'],
  [...T1['routes'], ...T2['routes']],
  [...T1['subrouters'], ...T2['subrouters']]
>;

// Merge a list of routers
export type MergeRouters<List extends AnyRouter[]> = List extends [infer A extends AnyRouter, ...infer Rest extends AnyRouter[]]
  ? MergeRouter<A, MergeRouters<Rest>>
  : Router;

export type RouterPlugin<R = Router> = (router: Router) => R;
export type AnyRouterPlugin = RouterPlugin<any>;

// Merge a base router with plugins
export type MergeRouterWithPlugins<T extends AnyRouter, List extends AnyRouterPlugin[]> = List extends [infer A extends AnyRouterPlugin, ...infer Rest extends AnyRouterPlugin[]]
  ? MergeRouterWithPlugins<ReturnType<A> extends AnyRouter ? MergeRouter<T, ReturnType<A>> : T, Rest>
  : T;

interface Router<
  State = {},
  Routes extends HandlerData[] = [],
  SubRouters extends [string, AnyRouter][] = []
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
  public route<const Path extends string, const SubRouter extends AnyRouter>(path: string, subrouter: SubRouter): Router<
    State, Routes, [...SubRouters, [Path, SubRouter]]
  > {
    this.subrouters.push([path, subrouter]);
    return this as any;
  }

  /**
   * Register a function to parse and set the result to the context
   */
  public parse<const Prop extends string, const ParserReturn>(prop: Prop, fn: (ctx: Context & State) => ParserReturn): Router<
    State & Record<Prop, ExcludeExceptionType<Awaited<ParserReturn>>>, Routes, SubRouters
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
  public apply(fn: MiddlewareFunction<State>): this {
    this.middlewares.push([3, fn]);
    return this;
  }

  /**
   * Register a function that runs on every request and set result to context
   */
  public set<const Prop extends string, const ParserReturn>(prop: Prop, fn: (ctx: Context & State) => ParserReturn): Router<
    State & Record<Prop, Awaited<ParserReturn>>, Routes, SubRouters
  > {
    this.middlewares.push([4, fn, prop]);
    return this as any;
  }

  /**
   * Add response headers
   */
  public headers(headers: HeadersInit): this {
    this.middlewares.push([5, toHeaderTuples(headers)]);
    return this;
  }

  /**
   * Plug a list of plugins
   */
  public plug<const List extends AnyRouterPlugin[]>(...plugins: List): MergeRouterWithPlugins<this, List> {
    for (let i = 0; i < plugins.length; i++) plugins[i](this as any);
    return this as any;
  }

  /**
   * Handle a static exception
   */
  public catch<const T extends Handler<{}>>(exception: StaticException, handler: T): Router<
    State, Routes, SubRouters
  >;

  /**
   * Handle a dynamic exception
   */
  public catch<const Payload, const T extends Handler<{}, [Payload]>>(exception: DynamicException<Payload>, handler: T): Router<
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
  public catchAll<const T extends Handler<{}>>(handler: T): Router<
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
  public build(path: string, handler: any): any {
    this.routes.push([0, path, handler]);
    return this;
  }

  /**
   * @internal
   * @ignore
   */
  public insert(method: string, path: string, handler: any): any {
    this.routes.push([method, path, handler]);
    return this;
  }

  /**
   * Register a macro
   */
  public macro<const RouterType extends AnyRouter>(macro: Macro<any, RouterType>): RouterType & {} {
    this.middlewares.push([0, macro]);
    return this as any;
  }
}

export { Router };
export const router = (): Router => new Router();
