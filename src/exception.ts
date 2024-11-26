export const symbol: symbol = Symbol.for(compilerConstants.EXCEPT_SYMBOL_NAME);
export type ExceptionSymbol = typeof symbol;

export type StaticException = [ExceptionSymbol, number];
export type DynamicExceptionInstance<T> = [ExceptionSymbol, number, T];
export type ExcludeExceptionType<T> = Exclude<T, StaticException | DynamicExceptionInstance<any>>;

let errorId = 0;

/**
 * Create a static error type
 */
// eslint-disable-next-line
export const staticException = (): StaticException => [symbol, errorId];

/**
 * Create a dynamic error type
 */
// eslint-disable-next-line
export const dynamicException = <T>() => {
  const id = errorId++;
  return { id, init: (payload: T) => [symbol, id, payload] as DynamicExceptionInstance<T> };
};
