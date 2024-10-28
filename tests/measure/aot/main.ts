import createFetch from './build/fetch.js';

import { aotdeps } from '@mapl/app/index.js';
import app from '../app/main.js';
import measure from '../measure.js';

measure('Create fetch', () => createFetch(aotdeps(app)));
