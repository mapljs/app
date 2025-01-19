import { Elysia, type Context } from 'elysia';
import { pathMap } from '../reqs';

const app = new Elysia();

for (const path in pathMap) {
  const fn: any = pathMap[path as keyof typeof pathMap];
  app.get(path, fn.length === 0
    ? fn
    : (c: Context) => fn(c.params.one)
  );
}

// Pls don't kill my TSC
export default app as any;
