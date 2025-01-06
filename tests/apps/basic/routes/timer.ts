import { router } from '@mapl/app/index.js';

const app = router()
  .set('totalTime', performance.now)
  .use((c) => c.headers.push(['Set-Cookie', `value=${Math.random()}`]))
  .set('totalTime', (c) => performance.now() - c.totalTime)

  .get('/', (c) => `Total time: ${c.totalTime}`);

export default app;
