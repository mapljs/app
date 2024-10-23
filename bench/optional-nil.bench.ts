import { summary, run, bench } from 'mitata';
import { optimizeNextInvocation } from 'bun:jsc';

// Warmup (de-optimize `bench()` calls)
bench('noop', () => { });
bench('noop2', () => { });

// Example benchmark
summary(() => {
  const dataset = new Array(100).fill(0).map(() => Math.random() < 0.5 ? null : true);

  const fn1 = (str: any) => str ?? false;
  bench('??', () => dataset.map(fn1))

  const fn2 = (str: any) => str || false;
  bench('||', () => dataset.map(fn2));

  const fn3 = (str: any) => str === null ? false : true;
  fn3(null);
  fn3(true);
  fn3(null);
  fn3(true);
  optimizeNextInvocation(fn3);
  bench('Equality check', () => dataset.map(fn3));
});

// Start the benchmark
run();
