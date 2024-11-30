import { aotfn, jitc, router } from '@mapl/app/index.js';

const app = router()
  .build('/', () => 'Hi');

export default
  await jitc(app, { exposeStatic: true });
