import { type AnyRouter, aotdeps, aotfn, jitc } from '@mapl/app/index.js';

export const measureAppAOT = async (app: AnyRouter) => {
  const str = `export default ${await aotfn(app)};`;
  await Bun.write(`${import.meta.dir}/fetch.js`, str);

  const start = Bun.nanoseconds();
  await (await import('./fetch.js')).default(...await aotdeps(app));

  console.log('AOT compilation: ' + ((Bun.nanoseconds() - start) / 1e6).toFixed(2) + 'ms');
  console.log('File size: ' + (str.length / 1024).toFixed(2) + 'kB');
  console.log('GZ size: ' + (Bun.gzipSync(str).length / 1024).toFixed() + 'kB')
}

export const measureAppJIT = async (app: AnyRouter) => {
  const start = Bun.nanoseconds();
  await jitc(app);

  console.log('JIT compilation: ' + ((Bun.nanoseconds() - start) / 1e6).toFixed(2) + 'ms');
}

export const measureApp = async (app: AnyRouter) => {
  await measureAppJIT(app);
  await measureAppAOT(app);
}
