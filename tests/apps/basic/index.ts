import { router } from '@mapl/app/index.js';

import basic from './routes/basic.js';
import patterns from './routes/patterns.js';
import auth from './routes/auth.js';
import timer from './routes/timer.js';
import macro from './routes/macro/index.js';

const app = router()
  .route('/basic', basic)
  .route('/patterns', patterns)
  .route('/auth', auth)
  .route('/timer', timer)
  .route('/macro', macro);

export default app;
