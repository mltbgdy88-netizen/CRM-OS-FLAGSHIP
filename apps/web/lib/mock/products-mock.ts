export type ProductStatus = 'active' | 'draft' | 'archived';

export function productStatusLabel(status: ProductStatus | string): string {
  switch (status) {
    case 'active':
      return 'Aktif';
    case 'draft':
      return 'Taslak';
    case 'archived':
      return 'Arşiv';
    default:
      return status;
  }
}

export function productStatusClass(status: ProductStatus | string): string {
  switch (status) {
    case 'active':
      return 'status-pill status-pill--success';
    case 'draft':
      return 'status-pill status-pill--info';
    case 'archived':
      return 'status-pill status-pill--muted';
    default:
      return 'status-pill';
  }
}

export function formatProductPrice(amount: number, currencyCode: string): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(amount);
}
