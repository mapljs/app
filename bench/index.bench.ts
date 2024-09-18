import { group, run, bench } from 'mitata';

// Warmup (de-optimize `bench()` calls)
bench('noop', () => { });
bench('noop2', () => { });

// Example benchmark
group('Example', () => {
  bench('Date.now()', () => Date.now());
  bench('performance.now()', () => performance.now());
});

// Start the benchmark
run();
