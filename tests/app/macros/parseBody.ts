import { Router, macro, staticException } from '@mapl/app/index.js';
import { CTX, REQ, VAR_PREFIX, RET_400, CREATE_EMPTY_HEADER } from '@mapl/app/constants.js';

export const invalidBodyFormat = staticException();
export const parseBody = macro<Router<{ body: { name: string } }, [], [], never>>((ctx, state) => {
  // Require async
  if (!ctx[2]) {
    ctx[0] += 'return (async()=>{';
    ctx[2] = true;
  }

  // Require a context object
  if (ctx[1] === null) {
    ctx[1] = ctx[0] + CREATE_EMPTY_HEADER;
    ctx[0] = '';
  }

  const id = state.localVarCount++;
  const exceptHandler = ctx[3][invalidBodyFormat[1]] ?? ctx[3][0];

  // Build
  ctx[0] += `let ${VAR_PREFIX}${id}=await ${REQ}.json().catch(()=>null);if(${VAR_PREFIX}${id}===null||typeof ${VAR_PREFIX}${id}!=='object'||typeof ${VAR_PREFIX}${id}.name!=='string'){${
    typeof exceptHandler === 'undefined' ? RET_400 : exceptHandler('', true, true)
  }}${CTX}.body=${VAR_PREFIX}${id};`;
});
