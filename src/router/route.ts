import type { AnyRouter, Router } from '.';
import type { Handler, HandlerData } from './types/handler';

export type RouteRegister<
  Method extends string,
  State,
  Routes extends HandlerData[],
  SubRouters extends [string, AnyRouter][],
  ErrorReturnType
> = <Path extends string, T extends Handler<State>>(path: Path, handler: T) => Router<
  State,
  [...Routes, [Method, Path, T]],
  SubRouters,
  ErrorReturnType
>;

// Request method type utils
export const methods = [] as const;
export type Methods = 'get' | 'head' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'trace';

export type RouteRegisters<
  State,
  Routes extends HandlerData[],
  SubRouters extends [string, AnyRouter][],
  ErrorReturnType
> = {
    [Method in Methods]: RouteRegister<Uppercase<Method>, State, Routes, SubRouters, ErrorReturnType>
  };