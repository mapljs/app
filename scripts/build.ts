/// <reference types='bun-types' />
import { existsSync, rmSync } from 'node:fs';
import { exec } from './utils';
import tsconfig from '../tsconfig.json';
import * as constants from '../src/constants.ts';

// Constants
const SOURCEDIR = './src';
const OUTDIR = tsconfig.compilerOptions.declarationDir;

// Remove old content
if (existsSync(OUTDIR)) rmSync(OUTDIR, { recursive: true });

// Emit declaration files
exec`bun x tsc`;

const constantEntries = Object.entries(constants);

// Transpile files concurrently
const transpiler = new Bun.Transpiler({
  loader: 'tsx',
  target: 'node',

  // Lighter and more optimized output
  treeShaking: true,
  minifyWhitespace: true,
  inline: true,

  // Inline constants
  define: Object.fromEntries(constantEntries.map((entry) => [`compilerConstants.${entry[0]}`, JSON.stringify(entry[1])]))
});

for (const path of new Bun.Glob('**/*.ts').scanSync(SOURCEDIR))
  Bun.file(`${SOURCEDIR}/${path}`)
    .arrayBuffer()
    .then((buf) => transpiler.transform(buf)
      .then((res) => {
        if (res.length !== 0) {
          const pathExtStart = path.lastIndexOf('.');
          Bun.write(`${OUTDIR}/${path.substring(0, pathExtStart === -1 ? path.length : pathExtStart) + '.js'}`, res);
        }
      })
    );
