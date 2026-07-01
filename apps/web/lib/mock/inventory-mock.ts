export function formatQuantity(value: number): string {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  }).format(value);
}

export function movementTypeLabel(type: string): string {
  switch (type) {
    case 'in':
      return 'Giriş';
    case 'out':
      return 'Çıkış';
    case 'adjust':
      return 'Düzeltme';
    case 'transfer':
      return 'Transfer';
    case 'reserve':
      return 'Rezervasyon';
    case 'release':
      return 'Serbest bırakma';
    default:
      return type;
  }
}

export function movementTypeClass(type: string): string {
  switch (type) {
    case 'in':
      return 'status-pill status-pill--success';
    case 'out':
      return 'status-pill status-pill--danger';
    case 'adjust':
      return 'status-pill status-pill--warning';
    default:
      return 'status-pill';
  }
}

export const MOCK_RESERVATIONS = [
  {
    id: 'res-001',
    orderNumber: 'ORD-2026-0142',
    productSku: 'CRM-ENT-001-STD',
    quantity: 5,
    status: 'active',
    warehouseCode: 'main',
  },
  {
    id: 'res-002',
    orderNumber: 'ORD-2026-0158',
    productSku: 'CRM-ENT-001-STD',
    quantity: 3,
    status: 'pending',
    warehouseCode: 'main',
  },
];
