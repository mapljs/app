import { router } from '@mapl/app/index.js';

const app = router()
  .get('/', () => 'Hi')
  .get('/user/*', {
    type: 'html',
    fn: (params) => `<p>Hello ${params[0]}</p>`
  })
  .any('/**', (params, c) => {
    c.status = 404;
    return params[0] + ' not found!';
  });

export default app;
