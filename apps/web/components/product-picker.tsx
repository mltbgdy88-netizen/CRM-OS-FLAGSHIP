'use client';

import { useEffect, useMemo, useState } from 'react';
import { ApiClientError } from '../lib/api/authenticated-fetch';
import { listProducts, type ProductListItem } from '../lib/api/products-client';

interface ProductPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (product: ProductListItem) => void;
}

export function ProductPicker({ open, onClose, onSelect }: ProductPickerProps) {
  const [state, setState] = useState<'loading' | 'error' | 'success'>('loading');
  const [items, setItems] = useState<ProductListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    async function load() {
      setState('loading');
      try {
        const result = await listProducts(1, 50);
        if (cancelled) {
          return;
        }
        setItems(result.items);
        setState('success');
      } catch (error) {
        if (cancelled) {
          return;
        }
        if (error instanceof ApiClientError) {
          setState('error');
          return;
        }
        setState('error');
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [open]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return items;
    }
    return items.filter(
      (product) =>
        product.sku.toLowerCase().includes(query) || product.name.toLowerCase().includes(query),
    );
  }, [items, searchQuery]);

  if (!open) {
    return null;
  }

  return (
    <div className="modal-backdrop" data-testid="product-picker">
      <div className="modal-panel" role="dialog" aria-label="Ürün seç">
        <header className="modal-panel__header">
          <h2>Ürün seç</h2>
          <button type="button" className="btn-ghost" onClick={onClose}>
            Kapat
          </button>
        </header>

        <label className="entity-page__search">
          <span className="sr-only">Ürün ara</span>
          <input
            type="search"
            placeholder="SKU veya ürün adı"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </label>

        {state === 'loading' ? (
          <p className="state-message" data-testid="product-picker-loading">
            Yükleniyor…
          </p>
        ) : null}

        {state === 'error' ? (
          <p className="state-message state-message--error" data-testid="product-picker-error">
            Ürünler yüklenemedi.
          </p>
        ) : null}

        {state === 'success' ? (
          <ul className="detail-timeline-list" data-testid="product-picker-items">
            {filteredItems.map((product) => (
              <li key={product.id} className="detail-timeline-list__item">
                <button
                  type="button"
                  className="btn-ghost"
                  data-testid={`product-picker-item-${product.id}`}
                  onClick={() => {
                    onSelect(product);
                    onClose();
                  }}
                >
                  <span className="data-table__primary">{product.name}</span>
                  <span className="data-table__muted">
                    {' '}
                    — {product.sku}
                    {product.brand ? ` · ${product.brand.name}` : ''}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
