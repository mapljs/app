import { type AnyRouter, aotdeps, aotfn, jitc } from '@mapl/app/index.js';

export const measureAppAOT = async (app: AnyRouter) => {
  // Build the file
  await Bun.write(`${import.meta.dir}/fetch.js`, `export default ${await aotfn(app)};`);
  await Bun.build({
    entrypoints: [`${import.meta.dir}/fetch.js`],
    outdir: `${import.meta.dir}/lib`
  });

  // Output
  const target = `${import.meta.dir}/lib/fetch.js`;

  // Measure the actual time
  let start = Bun.nanoseconds();
  await (await import(target)).default(...await aotdeps(app));
  start = Bun.nanoseconds() - start;
  console.log('AOT compilation: ' + (start / 1e6).toFixed(2) + 'ms');

  // Report file size
  const str = await Bun.file(target).bytes();
  console.log('File size: ' + (str.byteLength / 1024).toFixed(2) + 'kB');
  console.log('GZ size: ' + (Bun.gzipSync(str).length / 1024).toFixed() + 'kB')
}

export const measureAppJIT = async (app: AnyRouter) => {
  let start = Bun.nanoseconds();
  await jitc(app);
  start = Bun.nanoseconds() - start;
  console.log('JIT compilation: ' + (start / 1e6).toFixed(2) + 'ms');
}

export const measureApp = async (app: AnyRouter) => {
  await measureAppJIT(app);
  await measureAppAOT(app);
}
