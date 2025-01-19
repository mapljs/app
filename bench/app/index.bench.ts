import { barplot as plot, run, bench, do_not_optimize } from 'mitata';
import assert from 'node:assert';

// Apps
import elysia from './src/elysia';
import hono from './src/hono';
import mapl from './src/mapl';

// Zesti has types for these stuff
import { requests, setupTests } from './reqs';

(async () => {
  const apps: [string, { fetch: (req: Request) => any }][] = [
    ['Hono', hono],
    ['Elysia', elysia],
    ['Mapl', await mapl()]
  ];

  for (const [name, obj] of apps)
    await setupTests(name, assert.strictEqual, obj);

  // Main
  plot(() => {
    for (const [name, obj] of apps) {
      requests.forEach((t: Request) => obj.fetch(t));

      bench(name, () => {
        for (let i = 0; i < requests.length; i++)
          do_not_optimize(obj.fetch(requests[i]));
      }).gc('inner');
    }
  });

  console.log('Initial memory usage:', (process.memoryUsage().rss / 1e6).toFixed(2) + 'mb')

  // Start the benchmark
  run();
})();
