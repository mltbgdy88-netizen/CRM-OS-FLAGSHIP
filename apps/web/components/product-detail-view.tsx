'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { ApiClientError } from '../lib/api/authenticated-fetch';
import { getProduct, type ProductDetail } from '../lib/api/products-client';
import { formatProductPrice, productStatusClass, productStatusLabel } from '../lib/mock/products-mock';
import { TableSkeleton } from './table-skeleton';

interface ProductDetailViewProps {
  productId: string;
}

export function ProductDetailView({ productId }: ProductDetailViewProps) {
  const [state, setState] = useState<'loading' | 'error' | 'forbidden' | 'success'>('loading');
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const loadProduct = useCallback(async () => {
    setState('loading');
    try {
      const result = await getProduct(productId);
      setProduct(result);
      setState('success');
    } catch (error) {
      if (error instanceof ApiClientError && error.kind === 'forbidden') {
        setState('forbidden');
        return;
      }
      if (error instanceof ApiClientError && error.kind === 'not_found') {
        setErrorMessage('Ürün bulunamadı.');
        setState('error');
        return;
      }
      setErrorMessage(error instanceof Error ? error.message : 'Ürün yüklenemedi');
      setState('error');
    }
  }, [productId]);

  useEffect(() => {
    void loadProduct();
  }, [loadProduct]);

  if (state === 'loading') {
    return (
      <section className="workspace-card entity-page" data-testid="product-detail">
        <TableSkeleton rows={6} testId="product-detail-loading" />
      </section>
    );
  }

  if (state === 'forbidden') {
    return (
      <section className="workspace-card entity-page" data-testid="product-detail">
        <p className="state-message state-message--forbidden" data-testid="product-detail-forbidden">
          Ürün detayını görüntüleme yetkiniz yok.
        </p>
      </section>
    );
  }

  if (state === 'error' || !product) {
    return (
      <section className="workspace-card entity-page" data-testid="product-detail">
        <p className="state-message state-message--error" data-testid="product-detail-error">
          {errorMessage}
        </p>
      </section>
    );
  }

  const defaultPrice =
    product.prices.find((price) => price.isDefault) ?? product.prices[0] ?? null;

  return (
    <section className="workspace-card entity-page" data-testid="product-detail">
      <header className="entity-page__header">
        <div className="entity-page__title-block">
          <h1 className="entity-page__title">{product.name}</h1>
          <span className={productStatusClass(product.status)}>
            {productStatusLabel(product.status)}
          </span>
        </div>
        <div className="entity-page__header-actions">
          <Link href="/products" className="btn-ghost">
            ← Liste
          </Link>
        </div>
      </header>

      <dl className="detail-info-grid" data-testid="product-detail-header">
        <div>
          <dt>SKU</dt>
          <dd>{product.sku}</dd>
        </div>
        <div>
          <dt>Marka</dt>
          <dd>{product.brand?.name ?? '—'}</dd>
        </div>
        <div>
          <dt>Kategori</dt>
          <dd>{product.category?.name ?? '—'}</dd>
        </div>
        <div>
          <dt>Liste fiyatı</dt>
          <dd>
            {defaultPrice
              ? formatProductPrice(defaultPrice.amount, defaultPrice.currencyCode)
              : '—'}
          </dd>
        </div>
      </dl>

      {product.description ? (
        <p className="detail-tab-panel__empty" data-testid="product-detail-description">
          {product.description}
        </p>
      ) : null}

      <h2 className="customer-360__section-title">Varyantlar</h2>
      {product.variants.length === 0 ? (
        <p className="detail-tab-panel__empty" data-testid="product-detail-variants-empty">
          Varyant kaydı yok.
        </p>
      ) : (
        <div className="data-table-wrap data-table-wrap--flush">
          <table className="data-table data-table--premium" data-testid="product-detail-variants">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Ad</th>
                <th>Fiyat</th>
              </tr>
            </thead>
            <tbody>
              {product.variants.map((variant) => {
                const variantPrice = variant.prices[0];
                return (
                  <tr key={variant.id} data-testid={`product-variant-${variant.id}`}>
                    <td className="data-table__muted">{variant.sku}</td>
                    <td>{variant.name}</td>
                    <td>
                      {variantPrice
                        ? formatProductPrice(variantPrice.amount, variantPrice.currencyCode)
                        : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="customer-360__section-title">Fiyatlar</h2>
      {product.prices.length === 0 ? (
        <p className="detail-tab-panel__empty" data-testid="product-detail-prices-empty">
          Fiyat kaydı yok.
        </p>
      ) : (
        <div className="data-table-wrap data-table-wrap--flush">
          <table className="data-table data-table--premium" data-testid="product-detail-prices">
            <thead>
              <tr>
                <th>Tutar</th>
                <th>Para birimi</th>
                <th>Varsayılan</th>
              </tr>
            </thead>
            <tbody>
              {product.prices.map((price) => (
                <tr key={price.id} data-testid={`product-price-${price.id}`}>
                  <td>{formatProductPrice(price.amount, price.currencyCode)}</td>
                  <td>{price.currencyCode}</td>
                  <td>{price.isDefault ? 'Evet' : 'Hayır'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
