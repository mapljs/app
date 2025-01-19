/// <reference types='bun-types' />
import { existsSync, rmSync } from 'node:fs';
import { resolve, join } from 'node:path/posix';

import { transpileDeclaration } from 'typescript';
import tsconfig from '../tsconfig.json';
import * as constants from '../src/constants.ts';

// Constants
const ROOTDIR = resolve(import.meta.dir, '..');
const SOURCEDIR = `${ROOTDIR}/src`;
const OUTDIR = join(ROOTDIR, tsconfig.compilerOptions.declarationDir);

// Remove old content
if (existsSync(OUTDIR)) rmSync(OUTDIR, { recursive: true });

// Transpile files concurrently
const transpiler = new Bun.Transpiler({
  loader: 'ts',
  target: 'node',

  // Lighter output
  minifyWhitespace: true,
  treeShaking: true,

  // Inline constants
  inline: true,
  define: Object.fromEntries(Object.entries(constants).map((entry) => [`compilerConstants.${entry[0]}`, JSON.stringify(entry[1])]))
});

for (const path of new Bun.Glob('**/*.ts').scanSync(SOURCEDIR)) {
  const srcPath = `${SOURCEDIR}/${path}`;

  const pathExtStart = path.lastIndexOf('.');
  const outPathNoExt = `${OUTDIR}/${path.substring(0, pathExtStart >>> 0)}`;

  Bun.file(srcPath)
    .text()
    .then((buf) => {
      // Inline constants directly in this file
      if (path === 'constants.ts')
        Bun.write(`${outPathNoExt}.js`, Object.entries(constants).map((entry) => `export let ${entry[0]}=${JSON.stringify(entry[1])};`).join(''))
      else {
        transpiler.transform(buf)
          .then((res) => {
            if (res.length !== 0)
              Bun.write(`${outPathNoExt}.js`, res.replace(/const /g, 'let '));
          });
      }

      Bun.write(`${outPathNoExt}.d.ts`, transpileDeclaration(buf, tsconfig as any).outputText);
    });
}
