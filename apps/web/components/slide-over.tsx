'use client';

import { useEffect, type ReactNode } from 'react';

interface SlideOverProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
  testId?: string;
}

/** Bitrix24-style right slide-over panel — list stays visible underneath. */
export function SlideOver({ open, title, onClose, children, testId = 'slide-over' }: SlideOverProps) {
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
    <div
      className="slide-over slide-over--open"
      data-testid={testId}
      role="dialog"
      aria-modal="true"
      aria-label={title ?? 'Detail panel'}
    >
      <button
        type="button"
        className="slide-over__backdrop"
        aria-label="Close panel"
        onClick={onClose}
        data-testid={`${testId}-backdrop`}
      />
      <aside className="slide-over__panel">
        <header className="slide-over__header">
          {title ? <h2 className="slide-over__title">{title}</h2> : <span />}
          <button
            type="button"
            className="slide-over__close"
            onClick={onClose}
            aria-label="Close"
            data-testid={`${testId}-close`}
          >
            ×
          </button>
        </header>
        <div className="slide-over__body">{children}</div>
      </aside>
    </div>
  );
}
