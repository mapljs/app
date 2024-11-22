import type { MaybePromise } from './utils.js';

// A type declaration file for fetch function
export type FetchFunc = (req: Request) => MaybePromise<Response>;

export interface BuildResult {
  /**
   * The built fetch function
   */
  fetch: FetchFunc;

  /**
   * The loaded static route responses
   */
  static: Record<string, Response>;
}

export type BuildFunc = (...deps: any[]) => Promise<BuildResult>;
