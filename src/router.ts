import type { Context } from './types/context';
import type { HandlerData } from './types/handler';
import type { MacroMiddlewareFunction, MiddlewareData, MiddlewareFunction } from './types/middleware';

export type AnyRouter = Router<any, any, any, any>;

export class Router<
  State = {},
  Routes extends HandlerData[] = [],
  SubRouters extends [string, AnyRouter][] = [],
  ErrorReturnType = never
> {
  // Type inference
  declare public readonly errorReturnType: ErrorReturnType;

  public readonly middlewares: MiddlewareData[];
  public readonly routes: Routes;
  public readonly subrouters: SubRouters;

  public constructor() {
    this.middlewares = [];
    this.routes = [] as unknown as Routes;
    this.subrouters = [] as unknown as SubRouters;
  }

  /**
   * Register a subrouter
   */
  public route<Path extends string, SubRouter extends AnyRouter>(path: string, router: SubRouter): Router<
    State, Routes, [...SubRouters, [Path, SubRouter]], ErrorReturnType
  > {
    this.subrouters.push([path, router]);
    return this as any;
  }

  /**
   * Inline code to the execution
   */
  public macro(fn: MacroMiddlewareFunction): this {
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
  public prepare(fn: MiddlewareFunction<State>): this {
    this.middlewares.push([3, fn]);
    return this;
  }
}

