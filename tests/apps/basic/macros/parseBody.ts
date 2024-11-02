import { Router, macro, staticException } from '@mapl/app/index.js';
import { CTX, REQ, HOLDER, RET_400 } from '@mapl/app/constants.js';
import { createAsyncScope, createEmptyContext, createHolder } from '@mapl/app/compiler/middleware.js';

export const invalidBodyFormat = staticException();

export const parseBody = macro<Router<{ body: { name: string } }, [], []>>((ctx) => {
  createAsyncScope(ctx);
  createEmptyContext(ctx);

  // Build
  ctx[0] += `${createHolder(ctx)}=await ${REQ}.json().catch(()=>null);if(${HOLDER}===null||typeof ${HOLDER}!=='object'||typeof ${HOLDER}.name!=='string'){${
    // Load the exception builder or fallback to return a 400 response
    (ctx[4][invalidBodyFormat[1]] ?? ctx[4][0])?.(true, true) ?? RET_400
  }}${CTX}.body=${HOLDER};`;
});
