import { Glob } from 'bun';
import { exec } from './utils';

for (const path of new Glob('**/*.bench.ts').scanSync('.')) {
  console.log('Running benchmark:', path);
  await exec`bun run ${path}`;
}
