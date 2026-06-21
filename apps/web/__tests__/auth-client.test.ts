import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { AuthClientError, login } from '../lib/api/auth-client';

describe('auth-client login', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('POSTs login payload to /api/v1/auth/login', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          tokenType: 'Bearer',
          tenantId: 'tenant-1',
          user: {
            id: 'user-1',
            email: 'admin@default.local',
            firstName: 'Default',
            lastName: 'Admin',
          },
        },
        meta: { timestamp: '2026-06-21T00:00:00.000Z' },
      }),
    } as Response);

    const result = await login({
      email: 'admin@default.local',
      password: 'Admin123!',
      tenantSlug: 'default',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/auth/login',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@default.local',
          password: 'Admin123!',
          tenantSlug: 'default',
        }),
      }),
    );
    expect(result.accessToken).toBe('access-token');
  });

  it('throws auth error on 401', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 401,
    } as Response);

    await expect(
      login({ email: 'bad@example.com', password: 'wrong', tenantSlug: 'default' }),
    ).rejects.toMatchObject({
      kind: 'auth',
      status: 401,
    } satisfies Partial<AuthClientError>);
  });

  it('throws network error when fetch fails', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('offline'));

    await expect(
      login({ email: 'admin@default.local', password: 'Admin123!' }),
    ).rejects.toMatchObject({
      kind: 'network',
    } satisfies Partial<AuthClientError>);
  });
});
