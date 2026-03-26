import { AsyncLocalStorage } from "async_hooks";

export type RequestContext = {
  userId?: string;
  organizationId?: string | null;
  ipAddress?: string;
  userAgent?: string;
};

export const requestContext = new AsyncLocalStorage<RequestContext>();

/**
 * Gets the current request context or returns empty object if not in a request
 */
export function getContext(): RequestContext {
  return requestContext.getStore() || {};
}
