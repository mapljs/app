import { router } from '@mapl/app/index.js';

const app = router()
  .set('startTime', performance.now)
  .use((c) => c.headers.push(['Set-Cookie', `value=${Math.random()}`]))
  .set('totalTime', (c) => performance.now() - c.startTime)

  .get('/', (c) => `Total time: ${c.totalTime}`);

export default app;
