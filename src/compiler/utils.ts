// eslint-disable-next-line
const AsyncFunction = (async () => { }).constructor;

export function isFunctionAsync(fn: any): fn is (...args: any[]) => Promise<any> {
  return fn instanceof AsyncFunction;
}
