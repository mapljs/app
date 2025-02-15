import type { BuildResult } from '../types/fetch.js';
import type { AnyRouter } from '../router/index.js';

import { compile, loadStatePrebuilds, loadStateTree, fastLoadStateTree } from './index.js';
import { AsyncFunction } from './utils.js';

import { getExternalKeys, getDeclarations } from '@mapl/compiler';

/**
 * Build a function to handle requests
 */
export const jitc = async (router: AnyRouter): Promise<BuildResult> => {
  const state = await compile(router);
  // Load static options first to the tree if necessary
  loadStatePrebuilds(state);

  // eslint-disable-next-line
  return AsyncFunction(
    ...getExternalKeys(state),
    `${compilerConstants.CONST_VARS}${getDeclarations(state)}return{fetch:(${compilerConstants.REQ})=>{${loadStateTree(state)}}}`
  )(...state.externalValues);
};

/**
 * Build a function to handle requests
 */
export const jitcQuick = async (router: AnyRouter): Promise<BuildResult> => {
  const state = await compile(router);

  // Load static options first to the tree if necessary
  loadStatePrebuilds(state);

  // eslint-disable-next-line
  return AsyncFunction(
    ...getExternalKeys(state),
    `${compilerConstants.CONST_VARS}${getDeclarations(state)}return{fetch:(${compilerConstants.REQ})=>{${fastLoadStateTree(state)}}}`
  )(...state.externalValues);
};

/**
 * Create a function string to be used in files
 */
export const aotfn = async (router: AnyRouter): Promise<string> => {
  const state = await compile(router);

  // Load static options first to the tree if necessary
  loadStatePrebuilds(state);
  return `(async(${getExternalKeys(state).join(',')})=>{${compilerConstants.CONST_VARS}${getDeclarations(state)}return{fetch:(${compilerConstants.REQ})=>{${fastLoadStateTree(state)}}}})`;
};
