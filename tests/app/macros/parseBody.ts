import { Router, macro, staticException } from '@mapl/app/index.js';
import { ASYNC_START, CTX, REQ, RESPONSE_400, VAR_PREFIX } from '@mapl/app/constants.js';
import { compileStaticExceptHandler } from '@mapl/app/compiler/handler.js';

export const invalidBodyFormat = staticException();
export const parseBody = macro<Router<{ body: { name: string } }, [], [], never>>((ctx, state) => {
  // Require async 
  if (!ctx[2]) {
    ctx[0] += ASYNC_START;
    ctx[2] = true;
  }

  // Require a context object
  if (ctx[1] === null) {
    ctx[1] = ctx[0];
    ctx[0] = '';
  }

  const id = state.localVarCount++;
  const exceptHandler = ctx[3][invalidBodyFormat[1]] ?? ctx[3][0];
  ctx[0] += `let ${VAR_PREFIX}${id}=await ${REQ}.json().catch(()=>null);if(${VAR_PREFIX}${id}===null||typeof ${VAR_PREFIX}${id}!=='object'||typeof ${VAR_PREFIX}${id}.name!=='string'){${typeof exceptHandler === 'undefined'
    ? `return ${RESPONSE_400};`
    : compileStaticExceptHandler(exceptHandler, true, null)
    }}${CTX}.body=${VAR_PREFIX}${id};`;
});


