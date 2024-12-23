import { router } from '@mapl/app/index.js';
import { measureApp } from '@measure';

const app = router()
  .use(console.log)
  .set('id', Date.now);

for (let i = 0; i < 10000; i++)
  app.get(`/${i}/*/dyn/**`, {
    type: 'json',
    fn: (c) => c.id
  });

await measureApp(app);
export default app;
