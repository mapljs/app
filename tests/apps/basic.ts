import { jitc, router } from '@mapl/app';

const app = router()
  .use((c) => c.headers.push(['server', 'mapl']))

  .get('/', {
    type: 'text',
    fn: () => 'Hi'
  })
  .get('/*', {
    type: 'text',
    fn: (c) => c.params[0]
  });

Bun.serve({
  fetch: jitc(app)
});
