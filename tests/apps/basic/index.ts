import { router } from '@mapl/app/index.js';

import basic from './routes/basic.js';
import patterns from './routes/patterns.js';
import auth from './routes/auth.js';
import timer from './routes/timer.js';
import macro from './routes/macro/index.js';

import { measureApp } from '@measure';

const app = router()
  .route('/basic', basic)
  .route('/patterns', patterns)
  .route('/auth', auth)
  .route('/timer', timer)
  .route('/macro', macro);

measureApp(app);
export default app;
