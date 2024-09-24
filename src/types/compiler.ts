import type { RouterCompilerState } from '@mapl/router/types';

// @ts-expect-error Override types
export interface AppRouterCompilerState extends RouterCompilerState {
  compileItem: (item: any, state: AppRouterCompilerState) => void;
}

export type CachedCompilationResult = [string, requireAsync: boolean, requireContext: boolean];
export type CachedExceptCompilationResult = [[number, CachedCompilationResult, boolean][], CachedCompilationResult | null];
