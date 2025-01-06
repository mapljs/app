import type { AnyRouter, Router } from './index.js';
import type { Handler, HandlerData } from './types/handler.js';

export type InferParams<Path extends string> = Path extends `${string}*${infer Rest}`
  ? Rest extends '*' ? [string] : [string, ...InferParams<Rest>]
  : [];

export type RouteRegister<
  Method extends string | null | 0,
  State,
  Routes extends HandlerData[],
  SubRouters extends [string, AnyRouter][]
> = <
  const Path extends string,
  const T extends (InferParams<Path>['length'] extends 0
    ? Handler<State>
    : Handler<State, [InferParams<Path>]>
  )
>(path: Path, handler: T) => Router<
  State,
  [...Routes, [Method, Path, T]],
  SubRouters
>;

// Request method type utils
export type Methods = 'get' | 'head' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'trace';

export type RouteRegisters<
  State,
  Routes extends HandlerData[],
  SubRouters extends [string, AnyRouter][]
> = { [Method in Methods]: RouteRegister<Uppercase<Method>, State, Routes, SubRouters> }
  & {
    // Weird stuff
    any: RouteRegister<null, State, Routes, SubRouters>,
    build: RouteRegister<0, State, Routes, SubRouters>,

    // Custom stuff
    insert: <const Method extends string, const Path extends string, const T extends Handler<State>>(method: Method, path: Path, handler: T) => Router<
      State,
      [...Routes, [Method, Path, T]],
      SubRouters
    >
  };
