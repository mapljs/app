import { join } from 'node:path';
import { write, file, $ } from 'bun';

export const cpToLib = (path: string) => write(join('./lib', path), file(path));
export const exec: (...args: Parameters<typeof $>) => Promise<any> = async (...args) => $(...args).catch((err) => process.stderr.write(err.stderr));
