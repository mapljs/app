import { Router, macro, staticException } from '@mapl/app/index.js';
import { CTX, REQ, HOLDER } from '@mapl/app/constants.js';
import { createAsyncScope, createEmptyContext, createHolder } from '@mapl/app/compiler/middleware.js';
import { loadExceptionHandler } from '@mapl/app/compiler/exceptions.js';

export const invalidBodyFormat = staticException();

export const parseBody = macro<Router<{ body: { name: string } }, [], []>>((ctx) => {
  createAsyncScope(ctx);
  createEmptyContext(ctx);

  // Build
  ctx[0] += `${createHolder(ctx)}=await ${REQ}.json().catch(()=>null);if(${HOLDER}===null||typeof ${HOLDER}!=='object'||typeof ${HOLDER}.name!=='string'){${
    loadExceptionHandler(ctx[4], invalidBodyFormat[1], true, true)
  }}${CTX}.body=${HOLDER};`;
});
