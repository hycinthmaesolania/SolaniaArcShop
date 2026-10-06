import { useState } from 'react';
import { useOrders } from '../context/OrdersContext';
import { formatPrice } from '../data/products';
import type { OrderStatus } from '../types';

const statuses: OrderStatus[] = ['new', 'shipped', 'delivered', 'cancelled'];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function OrdersPanel() {
  const { orders, setStatus, deleteOrder } = useOrders();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  if (orders.length === 0) {
    return (
      <div className="empty">
        <h3>No orders yet</h3>
        <p>Orders appear here as soon as someone completes checkout.</p>
      </div>
    );
  }

  return (
    <ul className="orders">
      {orders.map((o) => (
        <li key={o.id}>
          <details className="order">
            <summary>
              <span className="order__id">{o.id}</span>
              <span>{o.customer.name}</span>
              <span className="order__date">{new Date(o.createdAt).toLocaleString()}</span>
              <span className={`pill pill--${o.status}`}>{cap(o.status)}</span>
              <strong>{formatPrice(o.total)}</strong>
            </summary>
            <div className="order__body">
              <div>
                <h4>Items</h4>
                <ul>
                  {o.lines.map((l, i) => (
                    <li key={i}>
                      {l.qty} × {l.name} ({l.color}{l.size ? `, ${l.size}` : ''}) – {formatPrice(l.price * l.qty)}
                    </li>
                  ))}
                </ul>
                <p className="order__sub">
                  Subtotal {formatPrice(o.subtotal)} · Shipping {o.shipping === 0 ? 'free' : formatPrice(o.shipping)}
                </p>
              </div>
              <div>
                <h4>Ship to</h4>
                <p>
                  {o.customer.name}<br />
                  {o.customer.address}<br />
                  {o.customer.city} {o.customer.postal}<br />
                  {o.customer.country}<br />
                  <a href={`mailto:${o.customer.email}`}>{o.customer.email}</a>
                </p>
              </div>
              <div>
                <h4>Payment</h4>
                <p>
                  {o.payment.detail}<br />
                  {o.payment.paid ? 'Paid' : 'Payment due on delivery'}
                </p>
                <div className="field">
                  <label htmlFor={`st-${o.id}`}>Status</label>
                  <select id={`st-${o.id}`} className="input" value={o.status} onChange={(e) => setStatus(o.id, e.target.value as OrderStatus)}>
                    {statuses.map((s) => (
                      <option key={s} value={s}>{cap(s)}</option>
                    ))}
                  </select>
                </div>

                {(o.status === 'delivered' || o.status === 'cancelled') &&
                  (confirmId === o.id ? (
                    <span className="confirm">
                      Delete this order?
                      <button type="button" className="btn btn--danger btn--small" onClick={() => { deleteOrder(o.id); setConfirmId(null); }}>
                        Yes, delete
                      </button>
                      <button type="button" className="btn btn--line btn--small" onClick={() => setConfirmId(null)}>
                        Cancel
                      </button>
                    </span>
                  ) : (
                    <button type="button" className="link-btn" onClick={() => setConfirmId(o.id)}>
                      Delete order
                    </button>
                  ))}
              </div>
            </div>
          </details>
        </li>
      ))}
    </ul>
  );
}
