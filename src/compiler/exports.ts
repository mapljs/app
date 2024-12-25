import type { BuildResult } from '../types/fetch.js';
import type { CompilerOptions } from '../types/compiler.js';
import type { AnyRouter } from '../router/index.js';

import { compile, loadStatePrebuilds, loadStateTree, fastLoadStateTree } from './index.js';
import { AsyncFunction } from './utils.js';

import { getExternalKeys, getDeclarations } from '@mapl/compiler';

/**
 * Build a function to handle requests
 */
// eslint-disable-next-line
export const jitc = async (router: AnyRouter, options: CompilerOptions = {}): Promise<BuildResult> => {
  const state = await compile(router);
  // Load static options first to the tree if necessary
  const staticOptions = loadStatePrebuilds(state, options);

  // eslint-disable-next-line
  return AsyncFunction(
    ...getExternalKeys(state),
    `${compilerConstants.CONST_VARS}${getDeclarations(state)}return{fetch:(${compilerConstants.REQ})=>{${loadStateTree(state)}}${staticOptions}}`
  )(...state.externalValues);
};

/**
 * Build a function to handle requests
 */
// eslint-disable-next-line
export const jitcQuick = async (router: AnyRouter, options: CompilerOptions = {}): Promise<BuildResult> => {
  const state = await compile(router);

  // Load static options first to the tree if necessary
  const staticOptions = loadStatePrebuilds(state, options);

  // Output should be minimal
  const content = fastLoadStateTree(state);

  // eslint-disable-next-line
  return AsyncFunction(
    ...getExternalKeys(state),
    `${compilerConstants.CONST_VARS}${getDeclarations(state)}return{fetch:(${compilerConstants.REQ})=>{${content}}${staticOptions}}`
  )(...state.externalValues);
};

/**
 * Create a function string to be used in files
 */
// eslint-disable-next-line
export const aotfn = async (router: AnyRouter, options: CompilerOptions = {}): Promise<string> => {
  const state = await compile(router);

  // Load static options first to the tree if necessary
  const staticOptions = loadStatePrebuilds(state, options);

  // Output should be minimal
  const content = fastLoadStateTree(state);

  return `(async(${getExternalKeys(state).join(',')})=>{${compilerConstants.CONST_VARS}${getDeclarations(state)}return{fetch:(${compilerConstants.REQ})=>{${content}}${staticOptions}}})`;
};
