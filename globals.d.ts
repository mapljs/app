import * as constants from './src/constants.js';

// Zero-cost constants at runtime
declare global {
  const compilerConstants: typeof constants;
}
