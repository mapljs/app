import { router, jitc } from '@mapl/app';
import { pathMap } from '../reqs';

const app = router();

for (const path in pathMap) {
  const fn: any = pathMap[path as keyof typeof pathMap];
  app.get(path.replace(/\/:\w+/g, '/*'), fn.length === 0
    ? fn
    : (params: string[]) => fn(params[0])
  );
}

export default () => jitc(app);
