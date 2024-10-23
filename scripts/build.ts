/// <reference types='bun-types' />
import { existsSync, rmSync } from 'node:fs';
import { exec } from './utils';
import tsconfig from '../tsconfig.json';
import pkg from '../package.json';
import * as constants from '../src/constants.ts';

// Constants
const SOURCEDIR = './src';
const OUTDIR = tsconfig.compilerOptions.declarationDir;

// Remove old content
if (existsSync(OUTDIR)) rmSync(OUTDIR, { recursive: true });

const constantEntries = Object.entries(constants);

// Emit declaration files
exec`bun x tsc`;

Bun.build({
  entrypoints: [`${SOURCEDIR}/index.ts`],
  outdir: OUTDIR,
  minify: { whitespace: true },
  external: Object.keys(pkg.dependencies),

  // Inline every compilerConstants access
  define: Object.fromEntries(constantEntries.map((entry) => [`compilerConstants.${entry[0]}`, JSON.stringify(entry[1])]))
});

// Re-export constants
Bun.write('./lib/constants.js', `export const ${constantEntries.map((entry) => `${entry[0]}=${JSON.stringify(entry[1])}`)};`);
