import { useRef, useState } from 'react';
import type { Order, OrderStatus } from '../types';
import { useOrders } from '../context/OrdersContext';
import { formatPrice } from '../data/products';
import { findOrder, loadLastOrder } from '../lib/orders';
import { useOverlay } from '../hooks';

interface Props {
  prefill?: { id: string; email: string };
  onClose: () => void;
}

const STEPS: { status: OrderStatus; label: string; note: string }[] = [
  { status: 'new', label: 'Order placed', note: 'We’ve received your order.' },
  { status: 'shipped', label: 'Shipped', note: 'Your order is on its way.' },
  { status: 'delivered', label: 'Delivered', note: 'Your order has arrived.' },
];

const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '');

function timeOf(order: Order, status: OrderStatus): string | undefined {
  const entries = (order.history ?? []).filter((h) => h.status === status);
  if (entries.length) return entries[entries.length - 1].at;
  return status === 'new' ? order.createdAt : undefined;
}

export default function TrackOrder({ prefill, onClose }: Props) {
  const { orders } = useOrders();
  const start = prefill ?? loadLastOrder();
  const [id, setId] = useState(start?.id ?? '');
  const [email, setEmail] = useState(start?.email ?? '');
  // The order is looked up live, so a status change made in the admin shows up straight away.
  const [query, setQuery] = useState<{ id: string; email: string } | null>(prefill ?? null);
  const closeRef = useRef<HTMLButtonElement>(null);
  useOverlay(true, onClose);

  const order = query ? findOrder(orders, query.id, query.email) : undefined;
  const notFound = query !== null && !order;

  const steps = order?.status === 'cancelled'
    ? [STEPS[0], { status: 'cancelled' as OrderStatus, label: 'Cancelled', note: 'This order was cancelled.' }]
    : STEPS;
  const current = order ? Math.max(steps.findIndex((s) => s.status === order.status), 0) : 0;

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal track" role="dialog" aria-modal="true" aria-labelledby="track-title">
        <button ref={closeRef} type="button" className="icon-btn modal__close" onClick={onClose} aria-label="Close">✕</button>
        <h2 id="track-title">Track your order</h2>
        <p className="track__lede">Enter the order number from your confirmation and the email you used at checkout.</p>

        <form
          className="track__form"
          onSubmit={(e) => {
            e.preventDefault();
            setQuery({ id, email });
          }}
        >
          <div className="grid2">
            <div className="field">
              <label htmlFor="tr-id">Order number</label>
              <input id="tr-id" className="input" value={id} onChange={(e) => setId(e.target.value)} placeholder="ARC-XXXXXXXX" autoFocus />
            </div>
            <div className="field">
              <label htmlFor="tr-email">Email</label>
              <input id="tr-email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </div>
          </div>
          <button type="submit" className="btn btn--ink">Track order</button>
        </form>

        {notFound && (
          <p className="field__error track__error" role="alert">
            We couldn’t find an order with that number and email. Check them and try again.
          </p>
        )}

        {order && (
          <div className="track__result" aria-live="polite">
            <div className="track__top">
              <div>
                <p className="track__id">{order.id}</p>
                <p className="hint">Placed {fmt(order.createdAt)}</p>
              </div>
              <span className={`pill pill--${order.status}`}>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
            </div>

            <ol className="timeline">
              {steps.map((s, i) => {
                const done = i <= current;
                const when = timeOf(order, s.status);
                return (
                  <li
                    key={s.status}
                    className={`timeline__step${done ? ' is-done' : ''}${s.status === 'cancelled' ? ' is-cancelled' : ''}`}
                    aria-current={i === current ? 'step' : undefined}
                  >
                    <span className="timeline__dot" aria-hidden="true">{s.status === 'cancelled' ? '✕' : done ? '✓' : ''}</span>
                    <div>
                      <strong>{s.label}</strong>
                      <p>{done ? (when ? fmt(when) : s.note) : s.note}</p>
                    </div>
                  </li>
                );
              })}
            </ol>

            <div className="track__cols">
              <div>
                <h3>Items</h3>
                <ul>
                  {order.lines.map((l, i) => (
                    <li key={i}>
                      {l.qty} × {l.name} ({l.color}{l.size ? `, ${l.size}` : ''}) – {formatPrice(l.price * l.qty)}
                    </li>
                  ))}
                </ul>
                <p className="hint">
                  Shipping {order.shipping === 0 ? 'free' : formatPrice(order.shipping)} · Total <strong>{formatPrice(order.total)}</strong>
                </p>
              </div>
              <div>
                <h3>Delivering to</h3>
                <p>
                  {order.customer.name}<br />
                  {order.customer.address}<br />
                  {order.customer.city} {order.customer.postal}<br />
                  {order.customer.country}
                </p>
                <p className="hint">{order.payment.detail} · {order.payment.paid ? 'Paid' : 'Pay on delivery'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
