import { summary, run, bench, do_not_optimize } from 'mitata';

// Simulate warmup situation
summary(() => {
  const dataset = new Array(100000).fill(0).map(() => Math.random() < 0.5 ? null : true);

  {
    const f = (a: any) => a ?? false;
    bench('??', () => do_not_optimize(dataset.map(f)));
  }

  {
    const f = (a: any) => a || false;
    bench('||', () => do_not_optimize(dataset.map(f)));
  }

  {
    const f = (a: any) => a === null ? false : true;
    bench('Null check', () => do_not_optimize(dataset.map(f)));
  }
});

// Start the benchmark
run();
