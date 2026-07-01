'use client';

import { FormEvent, useState } from 'react';
import { ApiClientError } from '../lib/api/authenticated-fetch';
import { createActivity } from '../lib/api/tasks-client';

const ACTIVITY_TYPES = [
  { value: 'call', label: 'Arama' },
  { value: 'note', label: 'Not' },
  { value: 'meeting', label: 'Toplantı' },
  { value: 'email', label: 'E-posta' },
] as const;

interface ActivityComposerProps {
  taskId?: string | null;
  onLogged?: () => void;
}

export function ActivityComposer({ taskId, onLogged }: ActivityComposerProps) {
  const [activityType, setActivityType] = useState<string>('note');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [state, setState] = useState<'idle' | 'submitting' | 'success' | 'error' | 'forbidden'>(
    'idle',
  );
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setState('submitting');
    setErrorMessage('');

    try {
      await createActivity({
        activityType,
        title: title.trim(),
        body: body.trim() || undefined,
        taskId: taskId ?? undefined,
      });
      setTitle('');
      setBody('');
      setState('success');
      onLogged?.();
    } catch (error) {
      if (error instanceof ApiClientError && error.kind === 'forbidden') {
        setState('forbidden');
        return;
      }
      setErrorMessage(error instanceof Error ? error.message : 'Aktivite kaydedilemedi');
      setState('error');
    }
  }

  return (
    <section className="calendar-sidebar" data-testid="activity-composer">
      <h2>Aktivite kaydet</h2>

      {state === 'forbidden' ? (
        <p className="state-message state-message--forbidden" data-testid="activity-composer-forbidden">
          Aktivite kaydetme yetkiniz yok.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="customer-create-form">
          <label htmlFor="activity-type">Tür</label>
          <select
            id="activity-type"
            value={activityType}
            onChange={(event) => setActivityType(event.target.value)}
            data-testid="activity-composer-type"
          >
            {ACTIVITY_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <label htmlFor="activity-title">Başlık</label>
          <input
            id="activity-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Örn. Müşteri takip araması"
            required
            data-testid="activity-composer-title"
          />

          <label htmlFor="activity-body">Açıklama</label>
          <textarea
            id="activity-body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={3}
            placeholder="Aktivite detayı…"
            data-testid="activity-composer-body"
          />

          <div className="form-actions">
            <button
              type="submit"
              className="btn-primary"
              disabled={state === 'submitting'}
              data-testid="activity-composer-submit"
            >
              {state === 'submitting' ? 'Kaydediliyor…' : 'Kaydet'}
            </button>
          </div>
        </form>
      )}

      {state === 'success' ? (
        <p className="form-message form-message--success" data-testid="activity-composer-success">
          Aktivite kaydedildi.
        </p>
      ) : null}

      {state === 'error' ? (
        <p className="form-message form-message--error" data-testid="activity-composer-error">
          {errorMessage}
        </p>
      ) : null}
    </section>
  );
}
