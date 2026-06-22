import { getApiBaseUrl } from './config';
import { getAccessToken } from '../auth/token-storage';

export type ApiClientErrorKind = 'auth' | 'forbidden' | 'network' | 'not_found' | 'unknown';

export class ApiClientError extends Error {
  readonly status: number;
  readonly kind: ApiClientErrorKind;

  constructor(message: string, status: number, kind: ApiClientErrorKind) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.kind = kind;
  }
}

export interface ApiDataEnvelope<T> {
  data: T;
  meta: { timestamp: string; requestId?: string };
}

export async function authenticatedFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const token = getAccessToken();
  if (!token) {
    throw new ApiClientError('Authentication required', 401, 'auth');
  }

  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${token}`);
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }

  const url = `${getApiBaseUrl()}${path}`;

  try {
    return await fetch(url, { ...init, headers });
  } catch {
    throw new ApiClientError(
      'Network error. Check API connectivity and try again.',
      0,
      'network',
    );
  }
}

export async function parseApiResponse<T>(response: Response): Promise<T> {
  if (response.status === 401) {
    throw new ApiClientError('Authentication required', 401, 'auth');
  }
  if (response.status === 403) {
    throw new ApiClientError('Insufficient permissions', 403, 'forbidden');
  }
  if (response.status === 404) {
    throw new ApiClientError('Resource not found', 404, 'not_found');
  }
  if (!response.ok) {
    throw new ApiClientError('Request failed', response.status, 'unknown');
  }

  const body = (await response.json()) as ApiDataEnvelope<T>;
  return body.data;
}
