export type MaybePromise<T> = T extends Promise<any> ? T : Promise<T> | T;
