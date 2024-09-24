import type { RouterCompilerState } from '@mapl/router/types';

// @ts-expect-error Override types
export interface AppRouterCompilerState extends RouterCompilerState {
  compileItem: (item: any, state: AppRouterCompilerState) => void;
}
