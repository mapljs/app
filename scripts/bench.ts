import { Glob } from 'bun';
import { exec } from './utils';

const exactBench = process.argv[2];
if (exactBench != null) {
  const path = `bench/${exactBench}.bench.ts`;
  console.log('Running benchmark:', path);
  await exec`bun run ${path}`;
} else for (const path of new Glob('**/*.bench.ts').scanSync('./bench')) {
  console.log('Running benchmark:', path);
  await exec`bun run bench/${path}`;
}
