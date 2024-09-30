import { router, staticException } from "@mapl/app";

const authException = staticException();
const app = router()
  .parse('token', (c) => {
    const authPayload = c.req.headers.get('authorization');
    return authPayload === null || !authPayload.startsWith('Bearer ') ? authException : authPayload.slice(7);
  })
  .catch(authException, {
    type: 'text',
    fn: () => 'Invalid token'
  })
  .get('/yield', {
    type: 'text',
    fn: (c) => c.token
  });

export default app;
