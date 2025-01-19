import { router } from '@mapl/app';

const app = router()
  .apply(console.log)
  .set('id', Date.now);

for (let i = 0; i < 1000; i++)
  app.get(`/${i}/*/dyn/**`, {
    type: 'json',
    fn: (params, c) => c.id + params[0] + params[1]
  });

export default app;
