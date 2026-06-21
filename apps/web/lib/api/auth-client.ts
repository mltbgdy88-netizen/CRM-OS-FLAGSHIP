import { getApiBaseUrl } from './config';

export interface LoginRequest {
  email: string;
  password: string;
  tenantSlug?: string;
}

export interface LoginUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  tenantId: string;
  user: LoginUser;
}

export interface ApiDataEnvelope<T> {
  data: T;
  meta: { timestamp: string; requestId?: string };
}

export type AuthClientErrorKind = 'auth' | 'network' | 'unknown';

export class AuthClientError extends Error {
  readonly status: number;
  readonly kind: AuthClientErrorKind;

  constructor(message: string, status: number, kind: AuthClientErrorKind) {
    super(message);
    this.name = 'AuthClientError';
    this.status = status;
    this.kind = kind;
  }
}

export async function login(request: LoginRequest): Promise<LoginResponseData> {
  const url = `${getApiBaseUrl()}/api/v1/auth/login`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: request.email,
        password: request.password,
        tenantSlug: request.tenantSlug?.trim() || 'default',
      }),
    });
  } catch {
    throw new AuthClientError(
      'Network error. Check API connectivity and try again.',
      0,
      'network',
    );
  }

  if (!response.ok) {
    const kind: AuthClientErrorKind =
      response.status === 401 || response.status === 403 || response.status === 400
        ? 'auth'
        : 'unknown';
    throw new AuthClientError('Invalid credentials or tenant.', response.status, kind);
  }

  const body = (await response.json()) as ApiDataEnvelope<LoginResponseData>;
  return body.data;
}
