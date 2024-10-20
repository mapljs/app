import { jitc, router } from '@mapl/app/index.js';
import basic from './routes/basic.js';
import patterns from './routes/patterns.js';
import auth from './routes/auth.js';
import timer from './routes/timer.js';
import inline from './routes/inline.js';

console.time('Build time');

const fetch = jitc(
  router()
    .route('/basic', basic)
    .route('/patterns', patterns)
    .route('/auth', auth)
    .route('/timer', timer)
    .route('/inline', inline)
);

console.timeEnd('Build time');

export default { fetch };
