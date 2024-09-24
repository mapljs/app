// eslint-disable-next-line
const AsyncFunction = (async () => { }).constructor;

export default function isAsync(fn: any): fn is (...args: any[]) => Promise<any> {
  return fn instanceof AsyncFunction;
}
