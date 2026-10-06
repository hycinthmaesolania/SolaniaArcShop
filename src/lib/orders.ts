import type { Order } from '../types';

export const normOrderId = (s: string) => s.trim().toUpperCase().replace(/^#/, '');

/** An order is only found when both the order number and the email used at checkout match. */
export function findOrder(orders: Order[], id: string, email: string): Order | undefined {
  const wantId = normOrderId(id);
  const wantEmail = email.trim().toLowerCase();
  if (!wantId || !wantEmail) return undefined;
  return orders.find((o) => o.id.toUpperCase() === wantId && o.customer.email.trim().toLowerCase() === wantEmail);
}

const LAST_KEY = 'arc-last-order';

/** Remember the most recent order on this device so forms can be pre-filled. */
export function saveLastOrder(id: string, email: string) {
  try {
    localStorage.setItem(LAST_KEY, JSON.stringify({ id, email }));
  } catch {
    /* ignore */
  }
}

export function loadLastOrder(): { id: string; email: string } | null {
  try {
    const v = JSON.parse(localStorage.getItem(LAST_KEY) ?? 'null') as { id?: unknown; email?: unknown } | null;
    return v && typeof v.id === 'string' && typeof v.email === 'string' ? { id: v.id, email: v.email } : null;
  } catch {
    return null;
  }
}
