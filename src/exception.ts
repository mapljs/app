const symbol: symbol = Symbol.for(compilerConstants.EXCEPT_SYMBOL_NAME);

export type StaticException = [symbol, number];
export type DynamicExceptionInstance<T> = [symbol, number, T];
export interface DynamicException<T> {
  id: number;
  init: (payload: T) => DynamicExceptionInstance<T>;
}

export type ExcludeExceptionType<T> = Exclude<T, StaticException | DynamicExceptionInstance<any>>;

let errorId = 0;

/**
 * Create a static error type
 */
// eslint-disable-next-line
export const staticException = (): StaticException => [symbol, errorId++];

/**
 * Create a dynamic error type
 */
export function dynamicException<T>(): DynamicException<T> {
  const id = errorId++;
  return { id, init: (payload: T) => [symbol, id, payload] };
}
