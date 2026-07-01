import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductDetailView } from '../components/product-detail-view';
import { ProductListView } from '../components/product-list-view';
import { ProductPicker } from '../components/product-picker';

vi.mock('../lib/api/products-client', () => ({
  listProducts: vi.fn(),
  getProduct: vi.fn(),
}));

import { getProduct, listProducts } from '../lib/api/products-client';

const mockProducts = [
  {
    id: 'prod-001',
    sku: 'CRM-ENT-001',
    name: 'CRM OS Enterprise License',
    description: 'Annual subscription license',
    status: 'active' as const,
    brandId: 'brand-1',
    categoryId: 'cat-1',
    brand: { id: 'brand-1', name: 'CRM OS', code: 'crm-os' },
    category: { id: 'cat-1', name: 'Yazılım', code: 'software' },
    createdAt: '2026-06-01T10:00:00Z',
    updatedAt: null,
    version: 1,
  },
  {
    id: 'prod-002',
    sku: 'IMPL-001',
    name: 'Implementation Package',
    description: 'Onboarding services',
    status: 'draft' as const,
    brandId: null,
    categoryId: 'cat-2',
    brand: null,
    category: { id: 'cat-2', name: 'Hizmet', code: 'services' },
    createdAt: '2026-06-02T10:00:00Z',
    updatedAt: null,
    version: 1,
  },
];

const mockProductDetail = {
  ...mockProducts[0],
  variants: [
    {
      id: 'var-1',
      sku: 'CRM-ENT-001-STD',
      name: 'Standard',
      sortOrder: 1,
      prices: [
        {
          id: 'price-1',
          amount: 95_000,
          currencyCode: 'TRY',
          isDefault: true,
          variantId: 'var-1',
          createdAt: '2026-06-01T10:00:00Z',
          version: 1,
        },
      ],
      createdAt: '2026-06-01T10:00:00Z',
      updatedAt: null,
      version: 1,
    },
  ],
  prices: [
    {
      id: 'price-2',
      amount: 95_000,
      currencyCode: 'TRY',
      isDefault: true,
      variantId: null,
      createdAt: '2026-06-01T10:00:00Z',
      version: 1,
    },
  ],
};

describe('ProductListView', () => {
  beforeEach(() => {
    vi.mocked(listProducts).mockReset();
    vi.mocked(listProducts).mockResolvedValue({
      items: mockProducts,
      total: 2,
      page: 1,
      pageSize: 50,
    });
  });

  it('renders product list with table rows', async () => {
    render(<ProductListView />);

    await waitFor(() => {
      expect(screen.getByTestId('product-list-items')).toBeInTheDocument();
    });

    expect(screen.getByTestId('product-list')).toBeInTheDocument();
    expect(screen.getByText('Ürünler')).toBeInTheDocument();
    expect(screen.getByTestId('product-row-prod-001')).toBeInTheDocument();
    expect(screen.getByText('CRM OS Enterprise License')).toBeInTheDocument();
  });

  it('filters products by search query', async () => {
    const user = userEvent.setup();
    render(<ProductListView />);

    await waitFor(() => {
      expect(screen.getByText('Implementation Package')).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText('Ürün ara'), 'Enterprise');

    expect(screen.queryByText('Implementation Package')).not.toBeInTheDocument();
    expect(screen.getByText('CRM OS Enterprise License')).toBeInTheDocument();
  });
});

describe('ProductDetailView', () => {
  beforeEach(() => {
    vi.mocked(getProduct).mockReset();
    vi.mocked(getProduct).mockResolvedValue(mockProductDetail);
  });

  it('renders product detail with variants and prices', async () => {
    render(<ProductDetailView productId="prod-001" />);

    await waitFor(() => {
      expect(screen.getByTestId('product-detail-header')).toBeInTheDocument();
    });

    expect(screen.getByText('CRM OS Enterprise License')).toBeInTheDocument();
    expect(screen.getByTestId('product-detail-variants')).toBeInTheDocument();
    expect(screen.getByText('Standard')).toBeInTheDocument();
    expect(screen.getByTestId('product-detail-prices')).toBeInTheDocument();
  });
});

describe('ProductPicker', () => {
  beforeEach(() => {
    vi.mocked(listProducts).mockReset();
    vi.mocked(listProducts).mockResolvedValue({
      items: mockProducts,
      total: 2,
      page: 1,
      pageSize: 50,
    });
  });

  it('selects a product from picker', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const onClose = vi.fn();

    render(<ProductPicker open onClose={onClose} onSelect={onSelect} />);

    await waitFor(() => {
      expect(screen.getByTestId('product-picker-items')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('product-picker-item-prod-001'));

    expect(onSelect).toHaveBeenCalledWith(mockProducts[0]);
    expect(onClose).toHaveBeenCalled();
  });
});
