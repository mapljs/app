import { router } from "@mapl/app/index.js";
import init from './index.js';

export default router()
  .macro(init(0.3))
  .get('/', () => 'Hi');
