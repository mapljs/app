# Mapl

A low-overhead framework for all runtimes.

```ts
import { jitc, router } from '@mapl/app';

// Declare sub routers
const subroute = router()
  // Example middleware
  .use((c) => c.headers.push(['access-control-allow-origin', '*']))

  // Send html
  .get('/example', {
    type: 'html',
    fn: () => '<a href="https://example.com">example.com</a>'
  });

const app = router()
  // Send normal text
  .get('/', () => 'Hi')

  // Send JSON
  .get('/req', {
    type: 'json',
    fn: (ctx) => ctx
  })

  // Set subroutes
  .route('/api', subroute);

// Compile the app to a fetch function
const fetch = jitc(app);

// Example request
fetch(new Request('http://127.0.0.1:3000')); // new Response('Hi')
```
