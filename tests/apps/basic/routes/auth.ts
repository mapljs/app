import { router, staticException } from '@mapl/app/index.js';

const authException = staticException();

const app = router()
  .parse('token', (c) => {
    const authPayload = c.req.headers.get('authorization');
    return authPayload === null || !authPayload.startsWith('Bearer ') ? authException : authPayload.slice(7);
  })
  .catch(authException, () => 'Invalid token')
  .get('/yield', (c) => c.token);

export default app;
