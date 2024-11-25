export const symbol: unique symbol = Symbol();
export type ExceptionSymbol = typeof symbol;

export type StaticException = [ExceptionSymbol, number];
export type DynamicExceptionInstance<T> = [ExceptionSymbol, number, T];
export type ExcludeExceptionType<T> = Exclude<T, StaticException | DynamicExceptionInstance<any>>;

let errorId = 0;

// eslint-disable-next-line
const exceptionInit = (...args: DynamicExceptionInstance<any>) => args;

/**
 * Create a static error type
 */
export function staticException(): StaticException {
  errorId++;
  return [symbol, errorId];
}

/**
 * Create a dynamic error type
 */
export function dynamicException<T>(): {
  id: number,
  init: (id: number, payload: T) => DynamicExceptionInstance<T>
} {
  errorId++;
  return {
    id: errorId,
    init: exceptionInit.bind(null, symbol, errorId)
  };
}
