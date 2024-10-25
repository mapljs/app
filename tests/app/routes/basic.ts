import { router } from '@mapl/app/index.js';

const app = router()
  // A simple middleware
  .use((c) => c.headers.push(['server', 'mapl']))

  // Simple endpoint
  .get('/', () => 'Hi')

  // Dynamic path parameter
  .get('/user/*', (c) => c.params[0])

  // Send JSON
  .post('/json', {
    type: 'json',
    fn: async (c) => c.req.json()
  })

  // Example static response
  .get('/static', {
    type: 'static',

    body: '<p>This is static content</p>',
    options: {
      headers: {
        'content-type': 'text/html'
      },
      statusText: 'Hi'
    }
  })

  // Return a raw response
  .get('/response', {
    type: 'response',
    fn: async () => fetch('http://example.com')
  });

export default app;
