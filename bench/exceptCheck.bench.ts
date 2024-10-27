import { summary, run, bench } from 'mitata';
import { optimizeNextInvocation } from 'bun:jsc';

// Warmup (de-optimize `bench()` calls)
bench('noop', () => { });
bench('noop2', () => { });

// Example benchmark
summary(() => {
  const sym = [];

  const dataset = new Array(100000).fill(0).map(
    (_, i) => i % 5 === 0
      ? [sym]
      : i % 5 === 1
        ? []
        : i % 5 === 2
          ? 0
          : i % 5 === 3
            ? ''
            : null
  );

  {
    const f = (a: any) => a?.[0] === sym;
    dataset.forEach(f);
    optimizeNextInvocation(f);
    bench('?.', () => dataset.map(f));
  }

  {
    const f = (a: any) => Array.isArray(a) && a[0] === sym;
    dataset.forEach(f);
    optimizeNextInvocation(f);
    bench('Array check', () => dataset.map(f));
  }
});

// Start the benchmark
run();
