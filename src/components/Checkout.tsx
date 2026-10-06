import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import type { Order, PaymentMethod } from '../types';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductsContext';
import { useOrders } from '../context/OrdersContext';
import { formatPrice } from '../data/products';
import {
  brandLabel,
  detectBrand,
  expiryError,
  formatGcashNumber,
  luhnValid,
  normalizeGcashNumber,
  shippingFor,
} from '../lib/payment';
import { useOverlay } from '../hooks';
import { saveLastOrder } from '../lib/orders';
import ProductVisual from './ProductVisual';

const emptyForm = { name: '', email: '', address: '', city: '', postal: '', country: '' };
const emptyCard = { number: '', name: '', expiry: '', cvc: '' };

const methods: { id: PaymentMethod; label: string; hint: string }[] = [
  { id: 'paypal', label: 'PayPal', hint: 'Pay from your PayPal balance or bank' },
  { id: 'gcash', label: 'GCash', hint: 'Pay with your GCash e-wallet' },
  { id: 'cod', label: 'Cash on delivery', hint: 'Pay the courier when it arrives' },
];

function Field({
  id,
  label,
  error,
  children,
  className,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`field ${className ?? ''}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error && (
        <p className="field__error" id={`${id}-err`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default function Checkout({ onTrack }: { onTrack?: (id: string, email: string) => void }) {
  const { isCheckout, closeCheckout, items, subtotal, clear } = useCart();
  const { getProduct } = useProducts();
  const { addOrder } = useOrders();

  const [form, setForm] = useState(emptyForm);
  const [method, setMethod] = useState<PaymentMethod>('card');
  const [card, setCard] = useState(emptyCard);
  const [gcash, setGcash] = useState('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [placed, setPlaced] = useState<Order | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const timer = useRef<number | undefined>(undefined);

  const onClose = useCallback(() => {
    if (!processing) closeCheckout();
  }, [processing, closeCheckout]);
  useOverlay(isCheckout, onClose);

  // Reset when the checkout closes. Card details are never kept around.
  useEffect(() => {
    if (isCheckout) {
      closeRef.current?.focus();
      return;
    }
    window.clearTimeout(timer.current);
    setCard(emptyCard);
    setGcash('');
    setTouched({});
    setSubmitted(false);
    setProcessing(false);
    setPlaced(null);
  }, [isCheckout]);

  useEffect(() => () => window.clearTimeout(timer.current), []);


  const digits = card.number.replace(/\D/g, '');
  const brand = detectBrand(digits);
  const cvcLength = brand === 'amex' ? 4 : 3;

  const errors = useMemo(() => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Enter your full name';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email address';
    if (!form.address.trim()) e.address = 'Enter your street address';
    if (!form.city.trim()) e.city = 'Enter your city';
    if (!form.postal.trim()) e.postal = 'Enter your postal code';
    if (!form.country.trim()) e.country = 'Enter your country';
    if (method === 'card') {
      if (!luhnValid(digits)) e.number = 'Enter a valid card number';
      if (!card.name.trim()) e.cardName = 'Enter the name on the card';
      const ex = expiryError(card.expiry);
      if (ex) e.expiry = ex;
      if (card.cvc.length !== cvcLength) e.cvc = `Enter the ${cvcLength}-digit security code`;
    }
    if (method === 'gcash' && !normalizeGcashNumber(gcash)) {
      e.gcash = 'Enter the mobile number linked to your GCash (e.g. 0917 123 4567)';
    }
    return e;
  }, [form, method, card, digits, cvcLength, gcash]);

  const show = (k: string) => (submitted || touched[k] ? errors[k] : undefined);
  const blur = (k: string) => () => setTouched((t) => ({ ...t, [k]: true }));
  const setF = (k: keyof typeof emptyForm) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;

  if (!isCheckout) return null;

  const pay = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const first = Object.keys(errors)[0];
    if (first) {
      document.getElementById(`co-${first}`)?.focus();
      return;
    }
    setProcessing(true);
    // Demo: a real shop would send the order to your server / payment provider here.
    timer.current = window.setTimeout(() => {
      const createdAt = new Date().toISOString();
      const order: Order = {
        id: `ARC-${Date.now().toString(36).toUpperCase()}`,
        createdAt,
        customer: { ...form },
        lines: items.flatMap((i) => {
          const p = getProduct(i.productId);
          return p ? [{ name: p.name, color: i.color, size: i.size, qty: i.qty, price: p.price }] : [];
        }),
        subtotal,
        shipping,
        total,
        payment: {
          method,
          detail:
            method === 'card'
              ? `${brandLabel[brand]} ending ${digits.slice(-4)}`
              : method === 'paypal'
                ? 'PayPal'
                : method === 'gcash'
                  ? `GCash ending ${(normalizeGcashNumber(gcash) ?? '').slice(-4)}`
                  : 'Cash on delivery',
          paid: method !== 'cod',
        },
        status: 'new',
        history: [{ status: 'new', at: createdAt }],
      };
      addOrder(order);
      saveLastOrder(order.id, order.customer.email);
      clear();
      setCard(emptyCard);
      setGcash('');
      setPlaced(order);
      setProcessing(false);
    }, 1400);
  };



  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal checkout" role="dialog" aria-modal="true" aria-labelledby="co-title">
        <button ref={closeRef} type="button" className="icon-btn modal__close" onClick={onClose} aria-label="Close checkout" disabled={processing}>
          ✕
        </button>

        {placed ? (
          <div className="done">
            <div className="done__tick" aria-hidden="true">✓</div>
            <h2 id="co-title">Thanks, {placed.customer.name.split(' ')[0]}. Order placed.</h2>
            <p>
              Order <strong>{placed.id}</strong> is confirmed. We’ll email a receipt to{' '}
              <strong>{placed.customer.email}</strong>.
            </p>
            <p className="done__pay">
              {placed.payment.method === 'cod'
                ? `Please have ${formatPrice(placed.total)} ready for the courier.`
                : `${formatPrice(placed.total)} paid with ${placed.payment.detail}.`}
            </p>
            <p className="done__demo">Demo store: no money was taken and no email was sent.</p>
            <div className="done__actions">
              {onTrack && (
                <button
                  type="button"
                  className="btn btn--ink"
                  onClick={() => {
                    closeCheckout();
                    onTrack(placed.id, placed.customer.email);
                  }}
                >
                  Track this order
                </button>
              )}
              <button type="button" className="btn btn--line" onClick={closeCheckout}>
                Continue shopping
              </button>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="done">
            <h2 id="co-title">Your cart is empty</h2>
            <button type="button" className="btn btn--ink" onClick={closeCheckout}>
              Back to shop
            </button>
          </div>
        ) : (
          <form className="co" onSubmit={pay} noValidate>
            <div className="co__main">
              <h2 id="co-title">Checkout</h2>

              <fieldset className="co__sec">
                <legend>Delivery details</legend>
                <div className="grid2">
                  <Field id="co-name" label="Full name" error={show('name')}>
                    <input id="co-name" className="input" autoComplete="name" value={form.name} onChange={setF('name')} onBlur={blur('name')} aria-invalid={!!show('name')} />
                  </Field>
                  <Field id="co-email" label="Email" error={show('email')}>
                    <input id="co-email" type="email" className="input" autoComplete="email" value={form.email} onChange={setF('email')} onBlur={blur('email')} aria-invalid={!!show('email')} />
                  </Field>
                </div>
                <Field id="co-address" label="Street address" error={show('address')}>
                  <input id="co-address" className="input" autoComplete="street-address" value={form.address} onChange={setF('address')} onBlur={blur('address')} aria-invalid={!!show('address')} />
                </Field>
                <div className="grid3">
                  <Field id="co-city" label="City" error={show('city')}>
                    <input id="co-city" className="input" autoComplete="address-level2" value={form.city} onChange={setF('city')} onBlur={blur('city')} aria-invalid={!!show('city')} />
                  </Field>
                  <Field id="co-postal" label="Postal code" error={show('postal')}>
                    <input id="co-postal" className="input" autoComplete="postal-code" value={form.postal} onChange={setF('postal')} onBlur={blur('postal')} aria-invalid={!!show('postal')} />
                  </Field>
                  <Field id="co-country" label="Country" error={show('country')}>
                    <input id="co-country" className="input" autoComplete="country-name" value={form.country} onChange={setF('country')} onBlur={blur('country')} aria-invalid={!!show('country')} />
                  </Field>
                </div>
              </fieldset>

              <fieldset className="co__sec">
                <legend>Payment method</legend>
                <div className="pms" role="radiogroup">
                  {methods.map((m) => (
                    <label key={m.id} className={`pm ${method === m.id ? 'pm--on' : ''}`}>
                      <input type="radio" name="method" value={m.id} checked={method === m.id} onChange={() => setMethod(m.id)} />
                      <span>
                        <strong>{m.label}</strong>
                        <small>{m.hint}</small>
                      </span>
                    </label>
                  ))}
                </div>

                
                        {method === 'paypal' && (
                  <p className="note">You’ll be redirected to PayPal to complete your purchase securely.</p>
                )}
                {method === 'gcash' && (
                  <div className="gcashbox">
                    <div className="gcashbadge" aria-hidden="true">
                      <span className="gcashbadge__logo">G</span>
                      <span>GCash</span>
                    </div>
                    <Field id="co-gcash" label="GCash mobile number" error={show('gcash')}>
                      <input id="co-gcash" className="input" type="tel" inputMode="tel" autoComplete="tel" placeholder="0917 123 4567" value={gcash} onChange={(e) => setGcash(formatGcashNumber(e.target.value))} onBlur={blur('gcash')} aria-invalid={!!show('gcash')} />
                    </Field>
                  </div>
                )}
                {method === 'cod' && (
                  <p className="note">Pay in cash when the courier hands over your parcel. Please have the exact amount ready.</p>
                )}
              </fieldset>
            </div>

            <aside className="co__sum" aria-label="Order summary">
              <h3>Order summary</h3>
              <ul className="sumlines">
                {items.map((i) => {
                  const p = getProduct(i.productId);
                  if (!p) return null;
                  return (
                    <li key={i.key}>
                      <ProductVisual className="sumlines__art" product={p} colorName={i.color} />
                      <span>
                        {p.name} × {i.qty}
                        <small>{i.color}{i.size ? ` · ${i.size}` : ''}</small>
                      </span>
                      <span>{formatPrice(p.price * i.qty)}</span>
                    </li>
                  );
                })}
              </ul>
              <dl className="sumtotals">
                <div><dt>Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
                <div><dt>Shipping</dt><dd>{shipping === 0 ? 'Free' : formatPrice(shipping)}</dd></div>
                <div className="sumtotals__grand"><dt>Total</dt><dd>{formatPrice(total)}</dd></div>
              </dl>
              <button type="submit" className="btn btn--sun btn--block" disabled={processing}>
                {processing
                  ? 'Processing…'
                  : method === 'paypal'
                    ? 'Pay with PayPal'
                    : method === 'gcash'
                      ? `Pay ${formatPrice(total)} with GCash`
                      : method === 'cod'
                        ? 'Place order'
                        : `Pay ${formatPrice(total)}`}
              </button>
              {submitted && Object.keys(errors).length > 0 && (
                <p className="field__error" role="alert">Please fix the highlighted fields.</p>
              )}
            </aside>
          </form>
        )}
      </div>
    </div>
  );
}
