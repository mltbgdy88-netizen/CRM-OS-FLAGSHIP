export type InboxChannel = 'email' | 'whatsapp' | 'chat' | 'sms';

export interface MockInboxMessage {
  id: string;
  channel: InboxChannel;
  customer: string;
  preview: string;
  unread: boolean;
  lastAt: string;
}

export const MOCK_INBOX: MockInboxMessage[] = [
  {
    id: 'inb-001',
    channel: 'email',
    customer: 'Acme Teknoloji',
    preview: 'Demo sonrası teklif revizyonu hakkında…',
    unread: true,
    lastAt: '2026-06-21T08:45:00Z',
  },
  {
    id: 'inb-002',
    channel: 'whatsapp',
    customer: 'Murat Kaya',
    preview: 'Atlas Lojistik için fiyat listesi gönderebilir misiniz?',
    unread: true,
    lastAt: '2026-06-21T07:30:00Z',
  },
  {
    id: 'inb-003',
    channel: 'chat',
    customer: 'Zeynep Arslan',
    preview: 'Entegrasyon dokümantasyonuna erişemiyorum.',
    unread: false,
    lastAt: '2026-06-20T16:20:00Z',
  },
  {
    id: 'inb-004',
    channel: 'email',
    customer: 'Delta Medikal',
    preview: 'Sözleşme imzalandı, teşekkürler.',
    unread: false,
    lastAt: '2026-06-20T11:00:00Z',
  },
  {
    id: 'inb-005',
    channel: 'sms',
    customer: 'Can Öztürk',
    preview: 'Yarınki toplantı saatini onaylıyorum.',
    unread: false,
    lastAt: '2026-06-19T18:15:00Z',
  },
];

export const MOCK_THREAD: Record<string, { from: 'customer' | 'agent'; text: string; at: string }[]> = {
  'inb-001': [
    { from: 'customer', text: 'Merhaba, demo çok verimli geçti. Teklifte lisans sayısını 50\'ye çıkarabilir miyiz?', at: '2026-06-21T08:30:00Z' },
    { from: 'agent', text: 'Tabii, revize teklifi bugün içinde paylaşacağım.', at: '2026-06-21T08:40:00Z' },
    { from: 'customer', text: 'Demo sonrası teklif revizyonu hakkında detaylı bilgi bekliyoruz.', at: '2026-06-21T08:45:00Z' },
  ],
  'inb-002': [
    { from: 'customer', text: 'Atlas Lojistik için fiyat listesi gönderebilir misiniz?', at: '2026-06-21T07:30:00Z' },
  ],
};

export function channelLabel(channel: InboxChannel): string {
  switch (channel) {
    case 'email':
      return 'E-posta';
    case 'whatsapp':
      return 'WhatsApp';
    case 'chat':
      return 'Canlı sohbet';
    case 'sms':
      return 'SMS';
  }
}

export function channelIcon(channel: InboxChannel): string {
  switch (channel) {
    case 'email':
      return '✉';
    case 'whatsapp':
      return '◉';
    case 'chat':
      return '💬';
    case 'sms':
      return '▤';
  }
}
