import { type AnyRouter, aotdeps, aotfn, jitc } from '@mapl/app/index.js';
import { measure } from 'mitata';

const format = (nanosec: number) => (nanosec / 1e6).toFixed(2) + 'ms';
const measureAvg = async (fn: () => any) => format((await measure(fn)).avg);

export const measureAppAOT = async (app: AnyRouter) => {
  await Bun.write(`${import.meta.dir}/fetch.js`, `export default ${aotfn(app)};`);
  const createFetch = (await import('./fetch.js')).default;
  console.log(`AOT compilation: ${await measureAvg(() => createFetch(aotdeps(app)))}`);
}

export const measureAppJIT = async (app: AnyRouter) =>
  console.log(`JIT compilation: ${await measureAvg(() => jitc(app))}`);

export const measureApp = (app: AnyRouter) => Promise.all([
  measureAppAOT(app), measureAppJIT(app)
]);
