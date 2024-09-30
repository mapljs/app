export const symbol: unique symbol = Symbol();
export type ExceptionSymbol = typeof symbol;

export type StaticException = [ExceptionSymbol, number];
export type DynamicExceptionInstance<T> = [ExceptionSymbol, number, T];
export type ExcludeExceptionType<T> = Exclude<T, StaticException | DynamicExceptionInstance<any>>;

let errorId = 0;

/**
 * Create a static error type
 */
export function staticException(): StaticException {
  errorId++;
  return [symbol, errorId];
}

export class DynamicException<T> {
  public readonly id: number;

  public constructor(id: number) {
    this.id = id;
  }

  public init(payload: T): DynamicExceptionInstance<T> {
    return [symbol, this.id, payload];
  }
}

/**
 * Create a dynamic error type
 */
export function dynamicException<T>(): DynamicException<T> {
  errorId++;
  return new DynamicException(errorId);
}
