import { Hono } from 'hono';
import { pathMap } from '../reqs';
import { RegExpRouter } from 'hono/router/reg-exp-router';

const app = new Hono({ router: new RegExpRouter() });

for (const path in pathMap) {
  const fn: any = pathMap[path as keyof typeof pathMap];
  app.get(path, fn.length === 0
    ? (c) => c.body(fn())
    : (c) => c.body(fn(c.req.param('one')))
  );
}

export default app;
