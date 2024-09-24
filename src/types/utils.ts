export type MaybePromise<T> = T extends Promise<any> ? T : Promise<T> | T;
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
