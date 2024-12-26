import { router } from '@mapl/app/index.js';

const app = router()
  .use(console.log)
  .set('id', Date.now);

for (let i = 0; i < 1000; i++)
  app.get(`/${i}/*/dyn/**`, {
    type: 'json',
    fn: (c) => c.id
  });

export default app;
