'use client';

import { useState, type FormEvent } from 'react';
import { MockPreviewBadge } from './mock-preview-badge';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED_QUERIES = [
  'Bu hafta riskli fırsatlar hangileri?',
  'Pipeline forecast özeti',
  'Geciken görevler listesi',
  'En yüksek marjlı teklifler',
] as const;

const MOCK_RESPONSES: Record<string, string> = {
  'Bu hafta riskli fırsatlar hangileri?':
    '3 fırsat dikkat gerektiriyor: Orion Finans (düşük olasılık, bütçe engeli), CloudNine Retail (keşif aşaması gecikmiş) ve Nova Enerji (ilk temas bekliyor). Teklif aşamasındaki Acme ve Beta fırsatları için demo planlamanız önerilir.',
  'Pipeline forecast özeti':
    'Açık pipeline değeri ₺1.9M. Bu çeyrek tahmini kapanış ₺840K (%44 güven). Teklif aşamasında ₺1.1M, pazarlıkta ₺526K bulunuyor. Kazanma oranı son 30 günde %34.',
  'Geciken görevler listesi':
    '2 geciken görev: Beta Yazılım teklif revizyonu (Selin Yılmaz) ve Acme demo hazırlığı (Ahmet Yılmaz). Delta Medikal sözleşmesi dün tamamlandı.',
  'En yüksek marjlı teklifler':
    'Delta Medikal (%35 marj, kabul), TeknoPark İzmir (%30, kabul) ve Acme Teknoloji (%28, gönderildi). Upsell fırsatı: Acme için AI Copilot eklentisi önerilebilir.',
};

export function AiCopilotView() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Merhaba! CRM verileriniz üzerinde soru sorabilirsiniz. Aşağıdaki önerilerden birini seçin veya kendi sorunuzu yazın.',
    },
  ]);
  const [input, setInput] = useState('');

  function askQuestion(question: string) {
    const trimmed = question.trim();
    if (!trimmed) {
      return;
    }

    const response =
      MOCK_RESPONSES[trimmed] ??
      'Bu soru için demo yanıt hazırlanıyor. Sprint-33 ile gerçek AI sorgu API\'si bağlanacak.';

    setMessages((current) => [
      ...current,
      { id: `user-${Date.now()}`, role: 'user', content: trimmed },
      { id: `assistant-${Date.now()}`, role: 'assistant', content: response },
    ]);
    setInput('');
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    askQuestion(input);
  }

  return (
    <section className="workspace-card ai-copilot-page" data-testid="ai-copilot-page">
      <header className="entity-page__header">
        <div className="entity-page__title-block">
          <h1 className="entity-page__title">AI Copilot</h1>
          <span className="entity-page__count">Ask CRM</span>
        </div>
        <MockPreviewBadge />
      </header>

      <div className="ai-copilot-layout">
        <div className="ai-copilot-chat" data-testid="ai-copilot-chat">
          <div className="ai-copilot-messages">
            {messages.map((message) => (
              <article
                key={message.id}
                className={
                  message.role === 'user'
                    ? 'ai-copilot-message ai-copilot-message--user'
                    : 'ai-copilot-message ai-copilot-message--assistant'
                }
              >
                {message.role === 'assistant' ? (
                  <span className="ai-copilot-message__avatar" aria-hidden>
                    ✦
                  </span>
                ) : null}
                <p className="ai-copilot-message__text">{message.content}</p>
              </article>
            ))}
          </div>

          <div className="ai-copilot-suggestions">
            <p className="ai-copilot-suggestions__label">Önerilen sorular</p>
            <div className="ai-copilot-suggestions__chips">
              {SUGGESTED_QUERIES.map((query) => (
                <button
                  key={query}
                  type="button"
                  className="ai-copilot-chip"
                  onClick={() => askQuestion(query)}
                >
                  {query}
                </button>
              ))}
            </div>
          </div>

          <form className="ai-copilot-input-row" onSubmit={handleSubmit}>
            <input
              type="text"
              className="ai-copilot-input"
              placeholder="CRM hakkında soru sorun…"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              aria-label="AI sorusu"
            />
            <button type="submit" className="btn-accent-green btn-accent-green--compact">
              Gönder
            </button>
          </form>
        </div>

        <aside className="ai-copilot-sidebar" aria-label="Kaynaklar">
          <h2 className="ai-copilot-sidebar__title">Veri kaynakları</h2>
          <ul className="ai-copilot-sources">
            <li>Pipeline · 11 fırsat</li>
            <li>Leadler · 10 kayıt</li>
            <li>Teklifler · 7 kayıt</li>
            <li>Görevler · 8 açık</li>
            <li>Müşteriler · canlı API</li>
          </ul>
          <p className="ai-copilot-sidebar__hint">
            Yanıtlar demo veriden üretilir. Sprint-33 ile gerçek RAG bağlantısı gelecek.
          </p>
        </aside>
      </div>
    </section>
  );
}
