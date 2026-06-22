import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { getCustomer360, getCustomerTimeline } from '../lib/api/customer-360-client';
import { getAccessToken } from '../lib/auth/token-storage';

vi.mock('../lib/auth/token-storage', () => ({
  getAccessToken: vi.fn(() => 'test-token'),
}));

describe('customer-360-client', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.mocked(getAccessToken).mockReturnValue('test-token');
  });

  it('fetches GET /customers/:id/360', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          id: 'cust-1',
          displayName: 'Demo',
          email: null,
          phone: null,
          status: 'active',
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: null,
          version: 1,
          scores: [],
          riskScore: null,
          lifetimeValue: null,
          notes: [],
          files: [],
          timelinePreview: [],
        },
        meta: { timestamp: '2026-01-01T00:00:00.000Z' },
      }),
    } as Response);

    const result = await getCustomer360('cust-1');

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/customers/cust-1/360',
      expect.objectContaining({
        headers: expect.any(Headers),
      }),
    );
    expect(result.id).toBe('cust-1');
  });

  it('fetches GET /customers/:id/timeline with pagination', async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          items: [
            {
              id: 'event-1',
              eventType: 'customer.created',
              title: 'Onboarded',
              summary: 'Seed event',
              occurredAt: '2026-01-01T00:00:00.000Z',
              createdAt: '2026-01-01T00:00:00.000Z',
            },
          ],
          total: 1,
          page: 1,
          pageSize: 20,
        },
        meta: { timestamp: '2026-01-01T00:00:00.000Z' },
      }),
    } as Response);

    const result = await getCustomerTimeline('cust-1', 1, 20);

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3001/api/v1/customers/cust-1/timeline?page=1&pageSize=20',
      expect.any(Object),
    );
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.title).toBe('Onboarded');
  });
});
