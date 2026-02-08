/**
 * HTTP Client Utility with Request ID Propagation
 * Ensures distributed tracing across microservices
 * Phase 4: Cloud-Native Kubernetes Deployment
 */

import { Request } from 'express';
import { getRequestId, getCorrelationId, REQUEST_ID_HEADER, CORRELATION_ID_HEADER } from '../middleware/request-id.middleware';

/**
 * Headers to propagate for distributed tracing
 */
export interface TracingHeaders {
  [REQUEST_ID_HEADER]: string;
  [CORRELATION_ID_HEADER]?: string;
}

/**
 * Get tracing headers from the current request
 * Use these headers when making outbound HTTP requests
 */
export function getTracingHeaders(req: Request): TracingHeaders {
  const headers: TracingHeaders = {
    [REQUEST_ID_HEADER]: getRequestId(req),
  };

  const correlationId = getCorrelationId(req);
  if (correlationId) {
    headers[CORRELATION_ID_HEADER] = correlationId;
  }

  return headers;
}

/**
 * Create fetch options with tracing headers
 */
export function createFetchOptions(
  req: Request,
  options: RequestInit = {}
): RequestInit {
  const tracingHeaders = getTracingHeaders(req);

  return {
    ...options,
    headers: {
      ...tracingHeaders,
      ...(options.headers || {}),
    },
  };
}

/**
 * Fetch with automatic request ID propagation
 */
export async function tracedFetch(
  req: Request,
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const fetchOptions = createFetchOptions(req, options);
  return fetch(url, fetchOptions);
}

/**
 * Create axios request config with tracing headers
 * For use with axios HTTP client
 */
export function createAxiosConfig(
  req: Request,
  config: Record<string, any> = {}
): Record<string, any> {
  const tracingHeaders = getTracingHeaders(req);

  return {
    ...config,
    headers: {
      ...tracingHeaders,
      ...(config.headers || {}),
    },
  };
}
