import { measure } from 'mitata';

const format = (nanosec: number) => (nanosec / 1e6).toFixed(2) + 'ms';

export default async (label: string, fn: () => any) =>
  console.log(`${label}: `, format((await measure(fn)).avg));
