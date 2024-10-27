import { summary, run, bench } from 'mitata';
import { optimizeNextInvocation } from 'bun:jsc';

// Warmup (de-optimize `bench()` calls)
bench('noop', () => { });
bench('noop2', () => { });

// Simulate warmup situation
summary(() => {
  const dataset = new Array(100000).fill(0).map(() => Math.random() < 0.5 ? null : true);

  {
    const f = (a: any) => a ?? false;
    bench('??', () => dataset.map(f));
  }

  {
    const f = (a: any) => a || false;
    bench('||', () => dataset.map(f));
  }

  {
    const f = (a: any) => a === null ? false : true;
    bench('Null check', () => dataset.map(f));
  }
});

// Start the benchmark
run();
