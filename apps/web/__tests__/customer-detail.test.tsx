import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { CustomerDetailView } from '../components/customer-detail';

vi.mock('../lib/api/customers-client', () => ({
  getCustomer: vi.fn(),
  updateCustomer: vi.fn(),
}));

import { getCustomer } from '../lib/api/customers-client';

describe('CustomerDetailView', () => {
  beforeEach(() => {
    vi.mocked(getCustomer).mockReset();
  });

  it('renders read-only 360 aggregation sections', async () => {
    vi.mocked(getCustomer).mockResolvedValue({
      id: 'cust-1',
      displayName: 'Demo Customer',
      email: 'demo@default.local',
      phone: '+905551110000',
      status: 'active',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: null,
      version: 1,
      contacts: [
        {
          id: 'contact-1',
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com',
          phone: null,
          title: 'Owner',
          isPrimary: true,
        },
      ],
      addresses: [],
      tags: [{ id: 'tag-1', name: 'vip' }],
      notes: [{ id: 'note-1', title: 'Welcome', body: 'Hello', createdAt: '2026-01-01T00:00:00.000Z' }],
      files: [
        {
          id: 'file-1',
          fileName: 'contract.pdf',
          mimeType: 'application/pdf',
          byteSize: 2048,
          createdAt: '2026-01-01T00:00:00.000Z',
        },
      ],
    });

    render(<CustomerDetailView customerId="cust-1" />);

    await waitFor(() => {
      expect(screen.getByTestId('customer-detail')).toBeInTheDocument();
    });

    expect(screen.getByTestId('customer-360-contacts')).toHaveTextContent('Jane Doe');
    expect(screen.getByTestId('customer-360-tags')).toHaveTextContent('vip');
    expect(screen.getByTestId('customer-360-notes')).toHaveTextContent('Hello');
    expect(screen.getByTestId('customer-360-files')).toHaveTextContent('contract.pdf');
    expect(screen.getByTestId('no-file-upload-control')).toBeInTheDocument();
    expect(screen.queryByTestId('file-upload-input')).not.toBeInTheDocument();
  });
});
