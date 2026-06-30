'use client';

/** Sprint 33 mock — visual placeholder only (canon vFinal). */
export function AiAssistDock() {
  return (
    <aside className="ai-assist-dock" data-testid="ai-assist-dock" aria-label="AI Assist">
      <header className="ai-assist-dock__header">
        <h2>AI Assist</h2>
        <p className="ai-assist-dock__subtitle">Sprint 33 placeholder</p>
      </header>
      <div className="ai-assist-dock__chips">
        <span className="ai-assist-dock__chip">Summarize timeline</span>
        <span className="ai-assist-dock__chip">Draft follow-up</span>
      </div>
      <textarea
        className="ai-assist-dock__input"
        disabled
        placeholder="AI query unavailable until Sprint 33"
        aria-disabled="true"
      />
    </aside>
  );
}
