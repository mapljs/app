import { router } from '@mapl/app';

export default router()
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
      return 'Where are u going?';
    }
  });

