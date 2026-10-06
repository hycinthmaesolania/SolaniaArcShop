import { useMemo, useState } from 'react';
import type { Product } from '../types';
import { useReviews } from '../context/ReviewsContext';
import { useOrders } from '../context/OrdersContext';
import { findOrder, loadLastOrder } from '../lib/orders';
import Stars from './Stars';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Reviews for one product. Only people who bought it (order number + email) can leave one. */
export default function Reviews({ product }: { product: Product }) {
  const { forProduct, addReview } = useReviews();
  const { orders } = useOrders();
  const list = forProduct(product.id);
  const average = list.length ? list.reduce((n, r) => n + r.rating, 0) / list.length : 0;

  const last = useMemo(loadLastOrder, []);
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [thanks, setThanks] = useState(false);
  const [orderId, setOrderId] = useState(last?.id ?? '');
  const [email, setEmail] = useState(last?.email ?? '');
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!orderId.trim()) err.orderId = 'Enter your order number.';
    if (!EMAIL_RE.test(email.trim())) err.email = 'Enter the email you used at checkout.';
    if (!name.trim()) err.name = 'Enter the name to show with your review.';
    if (rating < 1) err.rating = 'Choose a star rating.';
    if (text.trim().length < 5) err.text = 'Write a few words about the product.';

    if (!err.orderId && !err.email) {
      const order = findOrder(orders, orderId, email);
      if (!order) err.orderId = 'We couldn’t find an order with that number and email.';
      else if (order.status === 'cancelled') err.orderId = 'That order was cancelled.';
      else if (!order.lines.some((l) => l.name === product.name)) err.orderId = `That order doesn’t include ${product.name}.`;
      else if (list.some((r) => r.orderId === order.id)) err.orderId = 'You’ve already reviewed this product for that order.';
    }

    setErrors(err);
    if (Object.keys(err).length) return;

    addReview({
      productId: product.id,
      orderId: orderId.trim().toUpperCase().replace(/^#/, ''),
      name: name.trim(),
      rating,
      text: text.trim(),
    });
    setOpen(false);
    setThanks(true);
    setName('');
    setRating(0);
    setText('');
  };

  const shown = showAll ? list : list.slice(0, 3);

  return (
    <section className="reviews" aria-labelledby="reviews-title">
      <div className="reviews__head">
        <div>
          <h3 id="reviews-title">Reviews</h3>
          {list.length > 0 ? (
            <p className="reviews__sum">
              <Stars value={average} /> <strong>{average.toFixed(1)}</strong> · {list.length} {list.length === 1 ? 'review' : 'reviews'}
            </p>
          ) : (
            <p className="reviews__sum">No reviews yet. Be the first to review this product.</p>
          )}
        </div>
        {!open && (
          <button type="button" className="btn btn--line btn--small" onClick={() => { setThanks(false); setOpen(true); }}>
            Write a review
          </button>
        )}
      </div>

      {thanks && <p className="notice" role="status">Thanks! Your review is now showing below.</p>}

      {open && (
        <form className="reviews__form" onSubmit={submit} noValidate>
          <p className="hint">Only buyers can leave a review. Use the order number and email from your order.</p>
          <div className="grid2">
            <div className="field">
              <label htmlFor="rv-order">Order number</label>
              <input id="rv-order" className="input" value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="ARC-XXXXXXXX" aria-invalid={errors.orderId ? true : undefined} />
              {errors.orderId && <p className="field__error" role="alert">{errors.orderId}</p>}
            </div>
            <div className="field">
              <label htmlFor="rv-email">Email used at checkout</label>
              <input id="rv-email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={errors.email ? true : undefined} />
              {errors.email && <p className="field__error" role="alert">{errors.email}</p>}
            </div>
          </div>
          <div className="field">
            <label htmlFor="rv-name">Your name</label>
            <input id="rv-name" className="input" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} aria-invalid={errors.name ? true : undefined} />
            {errors.name && <p className="field__error" role="alert">{errors.name}</p>}
          </div>
          <div className="field">
            <span id="rv-rating-label" className="field__label">Rating</span>
            <div className="rate" role="radiogroup" aria-labelledby="rv-rating-label">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={rating === n}
                  aria-label={`${n} ${n === 1 ? 'star' : 'stars'}`}
                  className={n <= rating ? 'is-on' : ''}
                  onClick={() => setRating(n)}
                >
                  ★
                </button>
              ))}
            </div>
            {errors.rating && <p className="field__error" role="alert">{errors.rating}</p>}
          </div>
          <div className="field">
            <label htmlFor="rv-text">Your review</label>
            <textarea id="rv-text" className="input" rows={4} maxLength={1000} value={text} onChange={(e) => setText(e.target.value)} aria-invalid={errors.text ? true : undefined} />
            {errors.text && <p className="field__error" role="alert">{errors.text}</p>}
          </div>
          <div className="reviews__actions">
            <button type="submit" className="btn btn--ink btn--small">Post review</button>
            <button type="button" className="btn btn--line btn--small" onClick={() => { setOpen(false); setErrors({}); }}>Cancel</button>
          </div>
        </form>
      )}

      {list.length > 0 && (
        <ul className="reviews__list">
          {shown.map((r) => (
            <li key={r.id} className="review">
              <div className="review__top">
                <Stars value={r.rating} />
                <strong>{r.name}</strong>
                <span className="review__tag">Verified buyer</span>
                <time dateTime={r.createdAt}>{new Date(r.createdAt).toLocaleDateString()}</time>
              </div>
              <p>{r.text}</p>
            </li>
          ))}
        </ul>
      )}
      {list.length > 3 && (
        <button type="button" className="link-btn" onClick={() => setShowAll((v) => !v)}>
          {showAll ? 'Show fewer reviews' : `Show all ${list.length} reviews`}
        </button>
      )}
    </section>
  );
}
