import { REQ } from '@mapl/router/constants.js';
import { compile } from './index.js';
import type { AnyRouter } from '../router/index.js';
import { getExternalKeys, getDeclarations } from '@mapl/compiler';
import { CONST_VARS } from './constants.js';
import type { MaybePromise } from '../types/utils.js';

/**
 * Build a function to handle requests
 */
export function jitc(router: AnyRouter): (req: Request) => MaybePromise<Response> {
  const state = compile(router, 0);
  // eslint-disable-next-line
  return Function(...getExternalKeys(state), `'use strict';${CONST_VARS}${getDeclarations(state)}return (${REQ})=>{${state.contentBuilder.join('')}}`)(...state.externalValues);
}

/**
 * Create a function string to be used in files
 */
export function aotfn(router: AnyRouter): string {
  const state = compile(router, 1);
  return `((${getExternalKeys(state).join(',')})=>{${CONST_VARS}${getDeclarations(state)}return (${REQ})=>{${state.contentBuilder.join('')}}})`;
}

/**
 * Get router dependencies to inject
 */
export function aotdeps(router: AnyRouter): any[] {
  return compile(router, 2).externalValues as any[];
}
