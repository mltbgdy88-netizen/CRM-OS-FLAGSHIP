'use client';

/** Sprint 33 mock — görsel placeholder (mockup AI Asistan paneli). */
export function AiAssistDock() {
  return (
    <aside className="ai-assist-dock" data-testid="ai-assist-dock" aria-label="AI Asistan">
      <header className="ai-assist-dock__header">
        <span className="ai-assist-dock__avatar" aria-hidden>
          ✦
        </span>
        <div>
          <h2>AI Asistan</h2>
          <p className="ai-assist-dock__subtitle">Önerilen sonraki adımlar</p>
        </div>
      </header>
      <p className="ai-assist-dock__summary">
        Müşteri profiline göre takip ve fırsat önerileri burada görünecek.
      </p>
      <div className="ai-assist-dock__chips">
        <span className="ai-assist-dock__chip">Zaman çizelgesini özetle</span>
        <span className="ai-assist-dock__chip">Takip e-postası taslağı</span>
        <span className="ai-assist-dock__chip">Risk analizi</span>
      </div>
      <textarea
        className="ai-assist-dock__input"
        disabled
        placeholder="Sprint 33 ile etkinleşecek…"
        aria-disabled="true"
      />
    </aside>
  );
}
