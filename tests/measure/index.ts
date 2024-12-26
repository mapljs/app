import { type AnyRouter, aotfn } from '@mapl/app/index.js';
import { rm } from 'fs/promises';
import { resolve } from 'path/posix';

const ROOT = import.meta.dir;
const OUTDIR = `${ROOT}/lib`;

export const prepareAppAOT = async (appSource: string, app: AnyRouter) =>
  (await Bun.write(`${ROOT}/aot.js`, `import{aotdeps}from'@mapl/app/index.js';import app from'${appSource}';export default ${await aotfn(app)}(...await aotdeps(app));`), `${ROOT}/aot.js`);

export const prepareAppJIT = async (appSource: string) =>
  (await Bun.write(`${ROOT}/jit.js`, `import{jitc}from'@mapl/app/index.js';import app from'${appSource}';export default await jitc(app);`), `${ROOT}/jit.js`);

// Main
let arg = process.argv[2];
if (typeof arg !== 'string') throw new Error('Ayo');

arg = resolve(arg);
const app = (await import(arg)).default;

const entrypoints = await Promise.all([prepareAppJIT(arg), prepareAppAOT(arg, app)]);

// Build the files
await Bun.build({
  entrypoints,
  outdir: OUTDIR,
  minify: true
});
await Promise.all(entrypoints.map((e) => rm(e)));

export const reportFileSize = async (target: string, label: string) => {
  const str = await Bun.file(target).bytes();
  console.log(label + ' File size: ' + (str.byteLength / 1024).toFixed(2) + 'kB');
  console.log(label + ' GZ size: ' + (Bun.gzipSync(str).length / 1024).toFixed() + 'kB')
}

export const measureAppAOT = async () => {
  const target = `${OUTDIR}/aot.js`;
  reportFileSize(target, 'AOT');

  // Measure the actual time
  let start = Bun.nanoseconds();
  await import(target);
  start = Bun.nanoseconds() - start;
  console.log('AOT compilation: ' + (start / 1e6).toFixed(2) + 'ms');
}

export const measureAppJIT = async () => {
  const target = `${OUTDIR}/jit.js`;
  reportFileSize(target, 'JIT');

  let start = Bun.nanoseconds();
  await import(target);
  start = Bun.nanoseconds() - start;
  console.log('JIT compilation: ' + (start / 1e6).toFixed(2) + 'ms');
}

await measureAppJIT();
await measureAppAOT();
