/**
 * Set STRESS_TEST=1 to run the route stress test
 */

console.info('JIT Compilation:');
await import('./jit/index.js');

console.info('AOT Compilation:');
await import('./aot/index.js');
