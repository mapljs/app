import { router } from '@mapl/app';

const app = router()
  .get('/', {
    type: 'text',
    fn: () => 'Hi'
  })
  .get('/user/*', {
    type: 'html',
    fn: (c) => `<p>Hello ${c.params[0]}</p>`
  })
  .any('/**', {
    type: 'text',
    fn: (c) => {
      c.status = 404;
      return null;
    }
  });

export default app;
