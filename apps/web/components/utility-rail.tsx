'use client';

import Link from 'next/link';

/** Bitrix-style right utility rail — notifications / AI quick access (placeholders). */
export function UtilityRail() {
  return (
    <aside className="utility-rail" aria-label="Quick tools" data-testid="utility-rail">
      <Link
        href="/notifications"
        className="utility-rail__btn"
        title="Bildirimler"
        aria-label="Bildirimler"
        data-testid="utility-rail-notifications"
      >
        <span className="utility-rail__icon" aria-hidden>
          ◉
        </span>
      </Link>
      <button type="button" className="utility-rail__btn" title="AI Copilot" aria-label="AI Copilot">
        <span className="utility-rail__icon" aria-hidden>
          ✦
        </span>
      </button>
      <button type="button" className="utility-rail__btn" title="Activity" aria-label="Activity feed">
        <span className="utility-rail__icon" aria-hidden>
          ≡
        </span>
      </button>
    </aside>
  );
}
