/**
 * Base API client for making requests to the backend
 */
'use client';

import { useCsrf } from '@/components/ui/csrf-provider';

type FetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  cache?: RequestCache;
  next?: { revalidate?: number | false; tags?: string[] };
};

export class ApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const defaultHeaders = {
  'Content-Type': 'application/json',
};

async function fetchAPI<T = any>(
  endpoint: string,
  options: FetchOptions = {},
  csrfToken?: string | null
): Promise<T> {
  const {
    method = 'GET',
    headers = {},
    body,
    cache,
    next,
  } = options;

  const requestHeaders = { ...defaultHeaders, ...headers };
  
  // Add CSRF token header for mutation requests
  if (csrfToken && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    requestHeaders['x-csrf-token'] = csrfToken;
  }

  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
    cache,
    next,
  };

  if (body) {
    // Add CSRF token to the body for mutation requests
    if (csrfToken && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      const bodyWithCsrf = { ...body, _csrf: csrfToken };
      requestOptions.body = JSON.stringify(bodyWithCsrf);
    } else {
      requestOptions.body = JSON.stringify(body);
    }
  }

  const response = await fetch(`/api${endpoint}`, requestOptions);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || errorData.error || `API request failed with status ${response.status}`;
    throw new ApiError(errorMessage, response.status);
  }

  // For 204 No Content responses
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// Client-side API client
export function useApiClient() {
  const { csrfToken } = useCsrf();
  
  return {
    get: <T = any>(endpoint: string, options: Omit<FetchOptions, 'method' | 'body'> = {}) =>
      fetchAPI<T>(endpoint, { ...options, method: 'GET' }, csrfToken),
      
    post: <T = any>(endpoint: string, data: any, options: Omit<FetchOptions, 'method'> = {}) =>
      fetchAPI<T>(endpoint, { ...options, method: 'POST', body: data }, csrfToken),
      
    put: <T = any>(endpoint: string, data: any, options: Omit<FetchOptions, 'method'> = {}) =>
      fetchAPI<T>(endpoint, { ...options, method: 'PUT', body: data }, csrfToken),
      
    patch: <T = any>(endpoint: string, data: any, options: Omit<FetchOptions, 'method'> = {}) =>
      fetchAPI<T>(endpoint, { ...options, method: 'PATCH', body: data }, csrfToken),
      
    delete: <T = any>(endpoint: string, options: Omit<FetchOptions, 'method'> = {}) =>
      fetchAPI<T>(endpoint, { ...options, method: 'DELETE' }, csrfToken),
  };
}

// Server-side API client (no CSRF token)
export const apiClient = {
  get: <T = any>(endpoint: string, options: Omit<FetchOptions, 'method' | 'body'> = {}) =>
    fetchAPI<T>(endpoint, { ...options, method: 'GET' }),
    
  post: <T = any>(endpoint: string, data: any, options: Omit<FetchOptions, 'method'> = {}) =>
    fetchAPI<T>(endpoint, { ...options, method: 'POST', body: data }),
    
  put: <T = any>(endpoint: string, data: any, options: Omit<FetchOptions, 'method'> = {}) =>
    fetchAPI<T>(endpoint, { ...options, method: 'PUT', body: data }),
    
  patch: <T = any>(endpoint: string, data: any, options: Omit<FetchOptions, 'method'> = {}) =>
    fetchAPI<T>(endpoint, { ...options, method: 'PATCH', body: data }),
    
  delete: <T = any>(endpoint: string, options: Omit<FetchOptions, 'method'> = {}) =>
    fetchAPI<T>(endpoint, { ...options, method: 'DELETE' }),
};