import createFetch from './build/fetch.js';

import { aotdeps } from '@mapl/app/index.js';
import app from '../app/main.js';

console.time('Create fetch');
createFetch(aotdeps(app));
console.timeEnd('Create fetch');
