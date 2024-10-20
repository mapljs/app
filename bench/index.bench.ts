import { summary, run, bench } from 'mitata';

// Warmup (de-optimize `bench()` calls)
bench('noop', () => { });
bench('noop2', () => { });

// Example benchmark
summary(() => {
  const fn = () => null;
  bench('Reject with uncached error handler', async () => await Promise.reject().catch(() => null));
  bench('Reject with cached error handler', async () => await Promise.reject().catch(fn));
});

// Start the benchmark
run();
