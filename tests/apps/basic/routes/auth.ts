import { router, dynamicException } from '@mapl/app/index.js';

const authException = dynamicException<string>();

const app = router()
  .parse('token', (c) => {
    const val = c.req.headers.get('authorization');

    return val === null
      ? authException('No Authorization header was specified')
      : val.startsWith('Bearer ')
        ? val.slice(7)
        : authException('Invalid Authorization header: ' + val);
  })
  .catch(authException, (payload, c) => {
    c.status = 400;
    return payload;
  })
  .get('/yield', (c) => c.token);

export default app;
