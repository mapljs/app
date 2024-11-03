import type { AnyRouter, Router } from './index.js';
import type { Handler, HandlerData, PrebuildData } from './types/handler.js';

export type RouteRegister<
  Method extends string | null,
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
    any: RouteRegister<null, State, Routes, SubRouters>,

    prebuild: <Path extends string, T extends PrebuildData>(path: Path, ...options: T) => Router<
      State,
      [...Routes, [null, Path, T]],
      SubRouters
    >
  };
