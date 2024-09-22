import type { DynamicException, StaticException } from '../exception';
import type { RouteRegisters } from './route';
import type { Context } from './types/context';
import type { Handler, HandlerData, InferHandlerResponse } from './types/handler';
import type { MacroMiddlewareFunction, MiddlewareData, MiddlewareFunction } from './types/middleware';

export type AnyRouter = Router<any, any, any, any>;

interface Router<
  State,
  Routes extends HandlerData[],
  SubRouters extends [string, AnyRouter][],
  ErrorReturnType
> extends RouteRegisters<State, Routes, SubRouters, ErrorReturnType> { }

// eslint-disable-next-line
class Router<State, Routes, SubRouters, ErrorReturnType> {
  // Type inference
  declare public readonly errorReturnType: ErrorReturnType;

  // Leave handling to the main app
  public readonly middlewares: MiddlewareData[];
  public readonly routes: Routes;
  public readonly subrouters: SubRouters;

  public readonly errorRoutes: [error: StaticException | DynamicException<any>, handler: any][];
  public allErrorRoute?: Handler<State>;

  public constructor() {
    this.middlewares = [];
    this.routes = [] as unknown as Routes;
    this.subrouters = [] as unknown as SubRouters;
    this.errorRoutes = [];
  }

  /**
   * Register a subrouter
   */
  public route<Path extends string, SubRouter extends AnyRouter>(path: string, subrouter: SubRouter): Router<
    State, Routes, [...SubRouters, [Path, SubRouter]], ErrorReturnType
  > {
    this.subrouters.push([path, subrouter]);
    return this as any;
  }

  /**
   * Inline code to the execution
   */
  public inline(fn: MacroMiddlewareFunction): this {
    this.middlewares.push([0, fn]);
    return this;
  }

  /**
   * Register a function to parse and set the result to the context
   */
  public parse<Prop extends string, ParserReturn>(prop: Prop, fn: (ctx: Context & State) => ParserReturn): Router<
    State & { [K in Prop]: Awaited<ParserReturn> }, Routes, SubRouters, ErrorReturnType
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
   * Handle a static exception
   */
  public catch<T extends Handler<State>>(exception: StaticException, handler: T): Router<
    State, Routes, SubRouters, ErrorReturnType | InferHandlerResponse<T>
  >;

  /**
   * Handle a dynamic exception
   */
  public catch<Payload, T extends Handler<State, [Payload]>>(exception: DynamicException<Payload>, handler: T): Router<
    State, Routes, SubRouters, ErrorReturnType | InferHandlerResponse<T>
  >;

  /**
   * @internal
   * @ignore
   */
  public catch(exception: any, handler: any): any {
    this.errorRoutes.push([exception, handler]);
    return this;
  }

  /**
   * Handle all exceptions
   */
  public catchAll<T extends Handler<State>>(handler: T): Router<
    State, Routes, SubRouters, ErrorReturnType | InferHandlerResponse<T>
  > {
    this.allErrorRoute = handler;
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
}

export { Router };

export function router(): Router<{}, [], [], never> {
  return new Router() as any;
}
