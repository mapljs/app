import { REQ } from '@mapl/router/constants';
import { compile } from '.';
import type { AnyRouter } from '../router';
import { getExternalKeys, getDeclarations, getContent } from '@mapl/compiler';
import { CONST_VARS, RESPONSE_404 } from './constants';
import type { MaybePromise } from '../types/utils';

export function jitc(router: AnyRouter): (req: Request) => MaybePromise<Response> {
  const state = compile(router);
  // eslint-disable-next-line
  return Function(...getExternalKeys(state), `${CONST_VARS}${getDeclarations(state)}return (${REQ})=>{${getContent(state)}return ${RESPONSE_404};}`)(...state.externalValues);
}
