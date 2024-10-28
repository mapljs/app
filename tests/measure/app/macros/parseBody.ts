import { Router, macro, staticException } from '@mapl/app/index.js';
import { CTX, REQ, RET_400, TEXT_HEADER_DEF, HOLDER, CREATE_HOLDER, ASYNC_START } from '@mapl/app/constants.js';

export const invalidBodyFormat = staticException();
export const parseBody = macro<Router<{ body: { name: string } }, [], []>>((ctx, state) => {
  // Require async
  if (!ctx[2]) {
    ctx[0] += ASYNC_START;
    ctx[2] = true;
  }

  // Require a context object
  if (ctx[1] === null) {
    ctx[1] = ctx[0] + TEXT_HEADER_DEF
    ctx[0] = '';
  }

  const exceptHandler = ctx[4][invalidBodyFormat[1]] ?? ctx[4][0];

  // Build
  ctx[0] += `${ctx[3] ? HOLDER : CREATE_HOLDER}=await ${REQ}.json().catch(()=>null);if(${HOLDER}===null||typeof ${HOLDER}!=='object'||typeof ${HOLDER}.name!=='string'){${
    typeof exceptHandler === 'undefined' ? RET_400 : exceptHandler(true, true)
  }}${CTX}.body=${HOLDER};`;

  ctx[3] = true;
});
