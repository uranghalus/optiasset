import { statement } from './auth-permission';

export type Resource = keyof typeof statement;

export type Action<T extends Resource> = (typeof statement)[T][number];
export type CanFunction = <T extends Resource>(
  resource: T,
  actions: Action<T>[],
) => boolean;
