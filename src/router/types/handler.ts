import type { Context } from './context';
import type { MaybePromise } from '../../types/utils';

export type HandlerData = [method: any, path: any, Handler<any, any>];

export interface TextHandler<State, Args extends any[]> {
  type: 'text';
  fn: (...args: [...Args, Context & State]) => MaybePromise<BodyInit>;
}

export interface JSONHandler<State, Args extends any[]> {
  type: 'json';
  fn: (...args: [...Args, Context & State]) => unknown;
}

export interface HTMLHandler<State, Args extends any[]> {
  type: 'html';
  fn: (...args: [...Args, Context & State]) => MaybePromise<BodyInit>;
}

export type Handler<State, Args extends any[] = []> = TextHandler<State, Args> | JSONHandler<State, Args> | HTMLHandler<State, Args>;

// TODO
export type InferHandlerResponse<T extends Handler<any, any>> = Awaited<ReturnType<T['fn']>>;
