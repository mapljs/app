import { router } from '@mapl/app';

const app = router()
  .use((c) => c.headers.push(['server', 'mapl']))
  .get('/', {
    type: 'text',
    fn: () => 'Hi'
  })
  .get('/user/*', {
    type: 'text',
    fn: (c) => c.params[0]
  })
  .post('/json', {
    type: 'json',
    fn: async (c) => c.req.json()
  });

export default app;
