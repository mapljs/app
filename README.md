# Mapl

A low-overhead framework for all runtimes.

```ts
import { jitc, router } from '@mapl/app';

const app = router()
  // Example middleware
  .use((c) => c.headers.push(['server', 'mapl']))

  // Send normal text
  .get('/', {
    type: 'text',
    fn: () => 'Hi'
  })

  // Send html
  .get('/home', {
    type: 'html',
    fn: () => '<p>Hi</p>'
  });

  // Send JSON
  .get('/req', {
    type: 'json',
    fn: (ctx) => ctx
  });

// Compile the app to a fetch function
const fetch = jitc(app);

// Example request
fetch(new Request('http://127.0.0.1:3000')); // new Response('Hi')
```
