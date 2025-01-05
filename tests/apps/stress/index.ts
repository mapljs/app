import { router } from '@mapl/app/index.js';

const app = router()
  .use(console.log)
  .set('id', Date.now);

for (let i = 0; i < 1000; i++)
  app.get(`/${i}/*/dyn/**`, {
    type: 'json',
    fn: (params, c) => c.id + params[0] + params[1]
  });

export default app;
