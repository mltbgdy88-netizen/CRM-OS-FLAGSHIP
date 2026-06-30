'use client';

/** Bitrix-style right utility rail — notifications / AI quick access (placeholders). */
export function UtilityRail() {
  return (
    <aside className="utility-rail" aria-label="Quick tools" data-testid="utility-rail">
      <button type="button" className="utility-rail__btn" title="Notifications" aria-label="Notifications">
        <span className="utility-rail__icon" aria-hidden>
          ◉
        </span>
        <span className="utility-rail__badge">0</span>
      </button>
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
