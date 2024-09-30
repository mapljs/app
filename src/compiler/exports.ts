import { REQ } from '@mapl/router/constants.js';
import { compile } from './index.js';
import type { AnyRouter } from '../router/index.js';
import { getExternalKeys, getDeclarations, getContent } from '@mapl/compiler';
import { CONST_VARS } from './constants.js';
import type { MaybePromise } from '../types/utils.js';
import type { AppRouterCompilerState } from '../types/compiler.ts';

/**
 * Build a function to handle requests
 */
export function jitc(router: AnyRouter): (req: Request) => MaybePromise<Response> {
  const state = compile(router);
  // eslint-disable-next-line
  return Function(...getExternalKeys(state), `'use strict';${CONST_VARS}${getDeclarations(state)}return (${REQ})=>{${getContent(state)}}`)(...state.externalValues);
}

export { compile as aotc };

/**
 * Create a function string to be used in files
 */
export function aotfn(state: AppRouterCompilerState): string {
  return `((${getExternalKeys(state).join(',')})=>{${CONST_VARS}${getDeclarations(state)}return (${REQ})=>{${getContent(state)}}})`;
}
