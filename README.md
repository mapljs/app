# Library template

An NPM library template using Bun.

## Scripts

All script sources.

### [Build](./scripts/build.ts)

Emit `.js` and `.d.ts` files to [`lib`](./lib).

### [Publish](./scripts/publish.ts)

Move [`package.json`](./package.json), [`README.md`](./README.md) to [`lib`](./lib) and publish the package.

### [Bench](./scripts/bench.ts)

Run files that ends with `.bench.ts` extension.

## Package scripts

All specified scripts in [`package.json`](./package.json).

```bash
# Build and run tests
bun build:test

# Build and run benchmarks
bun build:bench

# Build and publish the package
bun build:publish

# Lint
bun lint

# Lint and fix if possible
bun lint:fix
```
