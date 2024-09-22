import { router } from '../../lib/router';

export const routes = router()
  // Send text
  .get('/', {
    type: 'text',
    fn: () => 'Hi'
  })

  // Send JSON
  .post('/json', {
    type: 'json',
    fn: (ctx) => ctx.headers
  })

  // Send html
  .get('/html', {
    type: 'html',
    fn: () => '<p>Hi</p>'
  })

  // Send macro
  .head('/macro', {
    type: 'macro',
    fn: (ctx) => {
      ctx.contentBuilder.push('return new Response("Hi");');
    }
  });
