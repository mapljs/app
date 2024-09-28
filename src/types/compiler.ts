import type { Router } from '@mapl/router';
import type { RouterCompilerState } from '@mapl/router/types';
import type { Handler } from '../router/types/handler';
import type { CachedMiddlewareCompilationResult } from '../compiler/middleware';

export type RouteTrees = [Record<string, Router> | null, Router | null];
export type NodeItem = [CachedMiddlewareCompilationResult, Handler<any>];

// @ts-expect-error Override types
export interface AppRouterCompilerState extends RouterCompilerState {
  compileItem: (item: NodeItem, state: AppRouterCompilerState, hasParam: boolean) => void;
  routeTrees: RouteTrees;
}

