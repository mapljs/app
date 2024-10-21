import { summary, run, bench } from 'mitata';
import { optimizeNextInvocation } from 'bun:jsc';

// Warmup (de-optimize `bench()` calls)
bench('noop', () => { });
bench('noop2', () => { });

// Example benchmark
summary(() => {
  const dataset = new Array(100).fill(0).map(() => String.fromCharCode(97 + Math.round(Math.random() * 22)));

  const fn1 = (str: string) => str[0] === 'c' ? 1 : 0;
  fn1('a');
  fn1('b');
  fn1('c');
  fn1('d');
  optimizeNextInvocation(fn1);
  bench('Char check', () => dataset.map(fn1))

  const fn2 = (str: string) => str.charCodeAt(0) === 99 ? 1 : 0;
  fn2('a');
  fn2('b');
  fn2('c');
  fn2('d');
  optimizeNextInvocation(fn2);
  bench('Char code check', () => dataset.map(fn2));
});

// Start the benchmark
run();
