import type { CompilerState } from '@mapl/compiler';
import type { Router } from '@mapl/router';

export type RouteTrees = [Record<string, Router> | null, Router | null];

export interface AppCompilerState extends CompilerState {
  routeTrees: RouteTrees;
  prebuilds: ([route: string, content: string])[];
}

export interface CompilerOptions {
  exportPrebuilds?: boolean;
}
