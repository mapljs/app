import { router } from '@mapl/app';

export default router()
  .get('/', {
    type: 'text',
    fn: () => 'Hi'
  })
  .get('/user/*', {
    type: 'html',
    fn: (ctx) => `<p>Hello ${ctx.params[0]}</p>`
  })
  .any('/**', {
    type: 'text',
    fn: (ctx) => {
      ctx.status = 404;
      return 'Where are u going?';
    }
  });

