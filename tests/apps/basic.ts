import { router } from '@mapl/app';

export default router()
  .use((c) => c.headers.push(['server', 'mapl']))

  .get('/', {
    type: 'text',
    fn: () => 'Hi'
  })
  .get('/*', {
    type: 'text',
    fn: (c) => c.params[0]
  });
