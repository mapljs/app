import type { StaticHandler } from '../router/types/handler.js';
import type { AppCompilerState } from '../types/compiler.js';
import { toHeaderTuples } from '../compiler/utils.js';

export const buildStaticHandler = (body: StaticHandler['body'], options: StaticHandler['options'], externalValues: AppCompilerState['externalValues'], contextNeedParam: boolean | null): void => {
  // Has context then serialize options to
  // statements that changes the context
  if (contextNeedParam === null) {
    if (typeof options?.headers === 'object')
      externalValues.push(toHeaderTuples(options.headers));

    externalValues.push(body);
  }

  // Save the entire response object in memory and clone when necessary
  externalValues.push(new Response(body, options));
};
