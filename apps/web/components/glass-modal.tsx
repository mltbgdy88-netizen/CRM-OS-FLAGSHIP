'use client';

import { useEffect, type ReactNode } from 'react';

interface GlassModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  testId?: string;
}

/** Bitrix24-style centered glass modal for quick-create flows. */
export function GlassModal({ open, title, onClose, children, testId = 'glass-modal' }: GlassModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className="glass-modal glass-modal--open" data-testid={testId} role="dialog" aria-modal="true">
      <button
        type="button"
        className="glass-modal__backdrop"
        aria-label="Close dialog"
        onClick={onClose}
        data-testid={`${testId}-backdrop`}
      />
      <div className="glass-modal__dialog">
        <header className="glass-modal__header">
          <h2>{title}</h2>
          <button
            type="button"
            className="glass-modal__close"
            onClick={onClose}
            aria-label="Close"
            data-testid={`${testId}-close`}
          >
            ×
          </button>
        </header>
        <div className="glass-modal__body">{children}</div>
      </div>
    </div>
  );
}
