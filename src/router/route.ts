import type { AnyRouter, Router } from './index.js';
import type { Handler, HandlerData } from './types/handler.js';

export type RouteRegister<
  Method extends string | null | 0,
  State,
  Routes extends HandlerData[],
  SubRouters extends [string, AnyRouter][]
> = <Path extends string, T extends Handler<State>>(path: Path, handler: T) => Router<
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
    insert: <Method extends string, Path extends string, T extends Handler<State>>(method: Method, path: Path, handler: T) => Router<
      State,
      [...Routes, [Method, Path, T]],
      SubRouters
    >
  };
