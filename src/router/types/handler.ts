import type { Context } from './context.js';
import type { MaybePromise } from '../../types/utils.js';

export type HandlerData = [method: string | null, path: string, Handler<any>];

export interface TextHandler<State, Args extends any[]> {
  type: 'text';
  fn: (...args: [...Args, Context & State]) => MaybePromise<BodyInit | null>;
}

export interface JSONHandler<State, Args extends any[]> {
  type: 'json';
  fn: (...args: [...Args, Context & State]) => any;
}

export interface HTMLHandler<State, Args extends any[]> {
  type: 'html';
  fn: (...args: [...Args, Context & State]) => MaybePromise<BodyInit | null>;
}

export type Handler<State, Args extends any[] = []> = TextHandler<State, Args> | JSONHandler<State, Args> | HTMLHandler<State, Args>;
export type AnyHandler = Handler<any> | Handler<any, [any]>;

// TODO
export type InferHandlerResponse<T extends AnyHandler> = Awaited<ReturnType<T['fn']>>;
