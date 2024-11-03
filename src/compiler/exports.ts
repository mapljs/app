import { compile } from './index.js';
import type { AnyRouter } from '../router/index.js';
import { getExternalKeys, getDeclarations } from '@mapl/compiler';
import { AsyncFunction } from './utils.js';
import type { BuildResult } from '../types/fetch.js';

/**
 * Build a function to handle requests
 */
// eslint-disable-next-line
export const jitc = async (router: AnyRouter): Promise<BuildResult> => {
  const state = compile(router, false);

  // eslint-disable-next-line
  return AsyncFunction(
    ...getExternalKeys(state),
    `'use strict';${compilerConstants.CONST_VARS}${getDeclarations(state)}return{fetch:(${compilerConstants.REQ})=>{${state.contentBuilder.join('')}}}`
  )(...state.externalValues);
};

/**
 * Create a function string to be used in files
 */
// eslint-disable-next-line
export const aotfn = (router: AnyRouter): string => {
  const state = compile(router, false);
  return `(async(${getExternalKeys(state).join(',')})=>{${compilerConstants.CONST_VARS}${getDeclarations(state)}return{fetch:(${compilerConstants.REQ})=>{${state.contentBuilder.join('')}}}})`;
};

/**
 * Get router dependencies to inject
 */
// eslint-disable-next-line
export const aotdeps = (router: AnyRouter): any[] => compile(router, true).externalValues as any[];
