import { router } from '@mapl/app/index.js';

const app = router()
  .get('/', () => 'Hi')
  .get('/user/*', {
    type: 'html',
    fn: (c) => `<p>Hello ${c.params[0]}</p>`
  })
  .any('/**', (c) => {
      c.status = 404;
      return null;
  });

export default app;
