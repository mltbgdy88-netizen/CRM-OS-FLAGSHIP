import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { InventoryOverviewView } from '../components/inventory-overview-view';
import { ReservationPanel } from '../components/reservation-panel';
import { StockLedgerView } from '../components/stock-ledger-view';

vi.mock('../lib/api/inventory-client', () => ({
  getInventoryOverview: vi.fn(),
  listStocks: vi.fn(),
  listStockReservations: vi.fn(),
}));

import { getInventoryOverview, listStockReservations, listStocks } from '../lib/api/inventory-client';

const mockOverview = {
  totalSkus: 1,
  totalOnHand: 120,
  totalReserved: 10,
  totalAvailable: 110,
  criticalCount: 0,
  warehouses: [
    {
      id: 'wh-001',
      name: 'Ana Depo',
      code: 'main',
      stockCount: 1,
      onHandTotal: 120,
    },
  ],
  recentMovements: [
    {
      id: 'mov-001',
      warehouseId: 'wh-001',
      productVariantId: 'var-001',
      stockId: 'stock-001',
      movementType: 'in',
      quantity: 120,
      referenceType: 'seed',
      referenceId: null,
      movementAt: '2026-06-01T10:00:00Z',
      notes: 'Initial stock',
      warehouse: { id: 'wh-001', name: 'Ana Depo', code: 'main' },
      productVariant: {
        id: 'var-001',
        sku: 'CRM-ENT-001-STD',
        name: 'Standard Edition',
        product: { id: 'prod-001', sku: 'CRM-ENT-001', name: 'CRM OS Enterprise License' },
      },
    },
  ],
};

const mockStocks = [
  {
    id: 'stock-001',
    warehouseId: 'wh-001',
    productVariantId: 'var-001',
    quantityOnHand: 120,
    quantityReserved: 10,
    quantityAvailable: 110,
    criticalLevel: 25,
    isCritical: false,
    warehouse: { id: 'wh-001', name: 'Ana Depo', code: 'main' },
    productVariant: {
      id: 'var-001',
      sku: 'CRM-ENT-001-STD',
      name: 'Standard Edition',
      product: { id: 'prod-001', sku: 'CRM-ENT-001', name: 'CRM OS Enterprise License' },
    },
  },
];

describe('InventoryOverviewView', () => {
  beforeEach(() => {
    vi.mocked(getInventoryOverview).mockReset();
    vi.mocked(getInventoryOverview).mockResolvedValue(mockOverview);
  });

  it('renders inventory overview KPIs and warehouse table', async () => {
    render(<InventoryOverviewView />);

    await waitFor(() => {
      expect(screen.getByTestId('inventory-kpi-row')).toBeInTheDocument();
    });

    expect(screen.getByTestId('inventory-overview')).toBeInTheDocument();
    expect(screen.getByText('Envanter')).toBeInTheDocument();
    expect(screen.getByTestId('inventory-warehouse-wh-001')).toBeInTheDocument();
    expect(screen.getByTestId('inventory-movement-mov-001')).toBeInTheDocument();
  });

  it('switches to stock ledger tab', async () => {
    vi.mocked(listStocks).mockResolvedValue({
      items: mockStocks,
      total: 1,
      page: 1,
      pageSize: 100,
    });

    const user = userEvent.setup();
    render(<InventoryOverviewView />);

    await waitFor(() => {
      expect(screen.getByTestId('inventory-kpi-row')).toBeInTheDocument();
    });

    await user.click(screen.getByTestId('inventory-tab-ledger'));

    await waitFor(() => {
      expect(screen.getByTestId('stock-ledger-items')).toBeInTheDocument();
    });

    expect(screen.getByTestId('stock-row-stock-001')).toBeInTheDocument();
  });
});

describe('StockLedgerView', () => {
  beforeEach(() => {
    vi.mocked(listStocks).mockReset();
    vi.mocked(listStocks).mockResolvedValue({
      items: mockStocks,
      total: 1,
      page: 1,
      pageSize: 100,
    });
  });

  it('renders stock ledger rows', async () => {
    render(<StockLedgerView />);

    await waitFor(() => {
      expect(screen.getByTestId('stock-ledger-items')).toBeInTheDocument();
    });

    expect(screen.getByTestId('stock-row-stock-001')).toBeInTheDocument();
    expect(screen.getByText('CRM OS Enterprise License')).toBeInTheDocument();
  });
});

describe('ReservationPanel', () => {
  const mockReservations = [
    {
      id: 'res-001',
      orderId: 'order-001',
      orderNumber: 'ORD-2026-0142',
      stockId: 'stock-001',
      warehouseId: 'wh-001',
      productVariantId: 'var-001',
      quantity: 5,
      status: 'active',
      releasedAt: null,
      createdAt: '2026-06-01T10:00:00Z',
      warehouse: { id: 'wh-001', name: 'Ana Depo', code: 'main' },
      productVariant: {
        id: 'var-001',
        sku: 'CRM-ENT-001-STD',
        name: 'Standard Edition',
        product: { id: 'prod-001', sku: 'CRM-ENT-001', name: 'CRM OS Enterprise License' },
      },
    },
  ];

  beforeEach(() => {
    vi.mocked(listStockReservations).mockReset();
    vi.mocked(listStockReservations).mockResolvedValue({
      items: mockReservations,
      total: 1,
      page: 1,
      pageSize: 50,
    });
  });

  it('renders reservation rows from API', async () => {
    render(<ReservationPanel />);

    await waitFor(() => {
      expect(screen.getByTestId('reservation-panel-items')).toBeInTheDocument();
    });

    expect(screen.getByTestId('reservation-row-res-001')).toBeInTheDocument();
    expect(screen.getByText('ORD-2026-0142')).toBeInTheDocument();
  });
});
