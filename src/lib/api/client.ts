/**
 * Base API client for making requests to the backend
 */

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
  options: FetchOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    headers = {},
    body,
    cache,
    next,
  } = options;

  const requestOptions: RequestInit = {
    method,
    headers: { ...defaultHeaders, ...headers },
    cache,
    next,
  };

  if (body) {
    requestOptions.body = JSON.stringify(body);
  }

  const response = await fetch(`/api${endpoint}`, requestOptions);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || `API request failed with status ${response.status}`;
    throw new ApiError(errorMessage, response.status);
  }

  // For 204 No Content responses
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

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