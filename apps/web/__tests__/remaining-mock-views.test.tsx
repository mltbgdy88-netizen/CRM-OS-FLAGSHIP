import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { CalendarView } from '../components/calendar-view';
import { InboxView } from '../components/inbox-view';
import { OrderListView } from '../components/order-list-view';
import { SettingsView } from '../components/settings-view';
import { TicketListView } from '../components/ticket-list-view';

describe('OrderListView', () => {
  it('renders mock orders', () => {
    render(<OrderListView />);
    expect(screen.getByTestId('order-list')).toBeInTheDocument();
    expect(screen.getByText('SIP-2026-0089')).toBeInTheDocument();
  });
});

describe('TicketListView', () => {
  it('renders mock tickets with SLA', () => {
    render(<TicketListView />);
    expect(screen.getByTestId('ticket-list')).toBeInTheDocument();
    expect(screen.getByTestId('ticket-row-tkt-001')).toBeInTheDocument();
  });
});

describe('InboxView', () => {
  it('shows conversation thread', async () => {
    const user = userEvent.setup();
    render(<InboxView />);

    expect(screen.getByTestId('inbox-thread')).toBeInTheDocument();
    await user.click(screen.getByTestId('inbox-item-inb-002'));
    expect(screen.getByRole('heading', { name: 'Murat Kaya' })).toBeInTheDocument();
  });
});

describe('CalendarView', () => {
  it('renders day events', () => {
    render(<CalendarView />);
    expect(screen.getByTestId('calendar-page')).toBeInTheDocument();
    expect(screen.getByTestId('calendar-event-evt-001')).toBeInTheDocument();
    expect(screen.getByText('Demo görüşmesi')).toBeInTheDocument();
  });
});

describe('SettingsView', () => {
  it('renders workspace and profile', () => {
    render(<SettingsView />);
    expect(screen.getByTestId('settings-page')).toBeInTheDocument();
    expect(screen.getByText('Default Workspace')).toBeInTheDocument();
    expect(screen.getByText('admin@default.local')).toBeInTheDocument();
  });
});
