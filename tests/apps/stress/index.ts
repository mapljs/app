import { router } from '@mapl/app/index.js';
import { measureApp } from '@measure';

const app = router()
  .use(console.log)
  .set('id', Date.now);

for (let i = 0; i < 7000; i++)
  app.get(`/${i}/*/dyn/**`, {
    type: 'json',
    fn: (c) => c.id
  });

measureApp(app);
export default app;
