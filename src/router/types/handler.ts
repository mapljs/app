import type { Context } from './context.js';
import type { MaybePromise } from '../../types/utils.js';

export interface BufferHandler<State, Args extends any[]> {
  type: 'buffer';
  fn: (...args: [...Args, Context & State]) => MaybePromise<BodyInit | null>;
}

export type PlainHandler<State, Args extends any[]> = BufferHandler<State, Args>['fn'];

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

export interface ResponseHandler<State, Args extends any[]> {
  type: 'response';
  fn: (...args: [...Args, Context & State]) => MaybePromise<Response | null | undefined>;
}

export interface StaticHandler {
  type: 'static';
  body?: URLSearchParams | FormData | Blob | ArrayBuffer | string | null;
  options?: ResponseInit;
}

export type TypedHandler<State, Args extends any[] = []> =
  BufferHandler<State, Args> |
  TextHandler<State, Args> |
  JSONHandler<State, Args> |
  HTMLHandler<State, Args> |
  ResponseHandler<State, Args>;
export type AnyTypedHandler = TypedHandler<any> | TypedHandler<any, [any]>;

export type Handler<State, Args extends any[] = []> = PlainHandler<State, Args> | TypedHandler<State, Args> | StaticHandler;
export type AnyHandler = Handler<any> | Handler<any, [any]>;

// 0 is for prebuilt routes
// null is for any handler
export type HandlerData = [method: string | null | 0, path: string, AnyHandler];
