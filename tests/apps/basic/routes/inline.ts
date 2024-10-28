import { router } from '@mapl/app/index.js';
import { parseBody } from '../macros/parseBody.js';

const app = router()
  .inline(parseBody)
  .post('/yield', {
    type: 'json',
    fn: (c) => c.body
  });

export default app;
