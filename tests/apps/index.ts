import { router } from '@mapl/app';
import basic from './basic.js';
import patterns from './patterns.js';
import auth from './auth.js';

const app = router()
  .route('/basic', basic)
  .route('/patterns', patterns)
  .route('/auth', auth);

export default app;
