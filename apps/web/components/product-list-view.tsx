'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ApiClientError } from '../lib/api/authenticated-fetch';
import { listProducts, type ProductListItem, type ProductStatus } from '../lib/api/products-client';
import { productStatusClass, productStatusLabel } from '../lib/mock/products-mock';
import { TableSkeleton } from './table-skeleton';

type StatusFilter = 'all' | ProductStatus;

export function ProductListView() {
  const [state, setState] = useState<'loading' | 'empty' | 'error' | 'forbidden' | 'success'>(
    'loading',
  );
  const [items, setItems] = useState<ProductListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState('loading');
      try {
        const result = await listProducts(1, 50);
        if (cancelled) {
          return;
        }
        setItems(result.items);
        setTotal(result.total);
        setState(result.items.length === 0 ? 'empty' : 'success');
      } catch (error) {
        if (cancelled) {
          return;
        }
        if (error instanceof ApiClientError && error.kind === 'forbidden') {
          setState('forbidden');
          return;
        }
        setErrorMessage(error instanceof Error ? error.message : 'Ürünler yüklenemedi');
        setState('error');
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredItems = useMemo(() => {
    let result = items;
    if (statusFilter !== 'all') {
      result = result.filter((product) => product.status === statusFilter);
    }
    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter(
        (product) =>
          product.sku.toLowerCase().includes(query) ||
          product.name.toLowerCase().includes(query) ||
          (product.brand?.name.toLowerCase().includes(query) ?? false),
      );
    }
    return result;
  }, [items, searchQuery, statusFilter]);

  if (state === 'loading') {
    return (
      <section className="workspace-card entity-page" data-testid="product-list">
        <header className="entity-page__header">
          <h1 className="entity-page__title">Ürünler</h1>
        </header>
        <TableSkeleton rows={6} testId="product-list-loading" />
      </section>
    );
  }

  if (state === 'forbidden') {
    return (
      <section className="workspace-card entity-page" data-testid="product-list">
        <p className="state-message state-message--forbidden" data-testid="product-list-forbidden">
          Ürün kataloğunu görüntüleme yetkiniz yok.
        </p>
      </section>
    );
  }

  if (state === 'error') {
    return (
      <section className="workspace-card entity-page" data-testid="product-list">
        <p className="state-message state-message--error" data-testid="product-list-error">
          {errorMessage}
        </p>
      </section>
    );
  }

  return (
    <section className="workspace-card entity-page" data-testid="product-list">
      <header className="entity-page__header">
        <div className="entity-page__title-block">
          <h1 className="entity-page__title">Ürünler</h1>
          <p className="entity-page__subtitle">{total} kayıt</p>
        </div>
      </header>

      <div className="entity-page__toolbar">
        <label className="entity-page__search">
          <span className="sr-only">Ürün ara</span>
          <input
            type="search"
            placeholder="SKU, ürün adı veya marka"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </label>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
          aria-label="Durum filtresi"
        >
          <option value="all">Tüm durumlar</option>
          <option value="active">Aktif</option>
          <option value="draft">Taslak</option>
          <option value="archived">Arşiv</option>
        </select>
      </div>

      {state === 'empty' || filteredItems.length === 0 ? (
        <p className="state-message" data-testid="product-list-empty">
          Ürün kaydı bulunamadı.
        </p>
      ) : (
        <div className="data-table-wrap" data-testid="product-list-items">
          <table className="data-table data-table--premium">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Ürün</th>
                <th>Marka</th>
                <th>Kategori</th>
                <th>Durum</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((product) => (
                <tr key={product.id} data-testid={`product-row-${product.id}`}>
                  <td className="data-table__muted">{product.sku}</td>
                  <td>
                    <Link href={`/products/${product.id}`} className="data-table__link">
                      {product.name}
                    </Link>
                  </td>
                  <td>{product.brand?.name ?? '—'}</td>
                  <td>{product.category?.name ?? '—'}</td>
                  <td>
                    <span className={productStatusClass(product.status)}>
                      {productStatusLabel(product.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
