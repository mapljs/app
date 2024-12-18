import { type AnyRouter, aotdeps, aotfn, jitc } from '@mapl/app/index.js';
import { measure } from 'mitata';

const format = (nanosec: number) => (nanosec / 1e6).toFixed(2) + 'ms';
const measureAvg = async (fn: () => any) => format((await measure(fn)).avg);

export const measureAppAOT = async (app: AnyRouter) => {
  await Bun.write(`${import.meta.dir}/fetch.js`, `export default ${await aotfn(app, { exposeStatic: true })};`);
  // @ts-ignore
  console.log(`AOT compilation: ${await measureAvg(async () => await (await import('./fetch.js')).default(...await aotdeps(app)))}`);
}

export const measureAppJIT = async (app: AnyRouter) =>
  console.log(`JIT compilation: ${await measureAvg(async () => await jitc(app, { exposeStatic: true }))}`);

export const measureApp = (app: AnyRouter) => Promise.all([
  measureAppAOT(app), measureAppJIT(app)
]);
