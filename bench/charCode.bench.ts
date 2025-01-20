import { summary, run, bench, do_not_optimize } from 'mitata';

// Example benchmark
summary(() => {
  const dataset = new Array(100).fill(0).map(() => String.fromCharCode(97 + Math.round(Math.random() * 22)));

  const fn1 = (str: string) => str[0] === 'c' ? 1 : 0;
  fn1('a');
  fn1('b');
  fn1('c');
  fn1('d');
  bench('Char check', () => do_not_optimize(dataset.map(fn1)))

  const fn2 = (str: string) => str.charCodeAt(0) === 99 ? 1 : 0;
  fn2('a');
  fn2('b');
  fn2('c');
  fn2('d');
  bench('Char code check', () => do_not_optimize(dataset.map(fn2)));
});

// Start the benchmark
run();
