import { router } from '@mapl/app/index.js';

import basic from './routes/basic.js';
import patterns from './routes/patterns.js';
import auth from './routes/auth.js';
import timer from './routes/timer.js';
import inline from './routes/inline.js';

const app = router()
  .route('/basic', basic)
  .route('/patterns', patterns)
  .route('/auth', auth)
  .route('/timer', timer)
  .route('/inline', inline);

// Load stress test
if (Bun.env.STRESS_TEST === '1')
  app.route('/stress', (await import('./routes/stress.js')).default);

export default app;
