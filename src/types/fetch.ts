import type { MaybePromise } from './utils.js';

// A type declaration file for fetch function
export type FetchFunc = (req: Request) => MaybePromise<Response>;

export interface BuildResult {
  fetch: FetchFunc;
}

export type BuildFunc = (deps: any[]) => Promise<BuildResult>;
