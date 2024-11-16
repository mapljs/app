import type { Router } from '@mapl/router';
import type { RouterCompilerState } from '@mapl/router/types.js';
import type { AnyHandler } from '../router/types/handler.js';
import type { CachedMiddlewareCompilationResult } from '../compiler/middleware.js';

export type RouteTrees = [Record<string, Router> | null, Router | null];
export type NodeItem = [CachedMiddlewareCompilationResult, AnyHandler];

// @ts-expect-error Override types
export interface AppRouterCompilerState extends RouterCompilerState {
  compileItem: (item: NodeItem, state: AppRouterCompilerState, hasParam: boolean) => void;

  routeTrees: RouteTrees;
  prebuilds: ([route: string, content: string])[];
}
