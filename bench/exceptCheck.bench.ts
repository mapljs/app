import { summary, run, bench, do_not_optimize } from 'mitata';

// Example benchmark
summary(() => {
  const sym: any = [];

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
    bench('?.', () => do_not_optimize(dataset.map(f)));
  }

  {
    const f = (a: any) => Array.isArray(a) && a[0] === sym;
    dataset.forEach(f);
    bench('Array check', () => do_not_optimize(dataset.map(f)));
  }
});

// Start the benchmark
run();
