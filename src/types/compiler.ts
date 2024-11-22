import type { Router } from '@mapl/router';
import type { RouterCompilerState } from '@mapl/router/types.js';

export type RouteTrees = [Record<string, Router> | null, Router | null];

// @ts-expect-error Stfu
export interface AppRouterCompilerState extends RouterCompilerState {
  compileItem: (item: string, state: AppRouterCompilerState) => void;

  routeTrees: RouteTrees;
  prebuilds: ([route: string, content: string])[];
}

export interface CompilerOptions {
  exportPrebuilds?: boolean;
}
