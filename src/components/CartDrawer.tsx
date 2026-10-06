import { useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductsContext';
import { formatPrice } from '../data/products';
import { FREE_SHIPPING_OVER, shippingFor } from '../lib/payment';
import { useOverlay } from '../hooks';
import ProductVisual from './ProductVisual';

export default function CartDrawer() {
  const { items, subtotal, isOpen, closeCart, setQty, removeItem, startCheckout } = useCart();
  const { getProduct } = useProducts();
  const closeRef = useRef<HTMLButtonElement>(null);

  useOverlay(isOpen, closeCart);

  useEffect(() => {
    if (isOpen) closeRef.current?.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  const remaining = FREE_SHIPPING_OVER - subtotal;
  const shipping = shippingFor(subtotal);

  return (
    <div className="overlay overlay--right" onMouseDown={(e) => e.target === e.currentTarget && closeCart()}>
      <aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
        <header className="drawer__head">
          <h2 id="cart-title">Your cart</h2>
          <button ref={closeRef} type="button" className="icon-btn" onClick={closeCart} aria-label="Close cart">
            ✕
          </button>
        </header>

        {items.length === 0 ? (
          <div className="drawer__empty">
            <h3>Your cart is empty</h3>
            <p>Add a cap, tee or tote to get started.</p>
            <button type="button" className="btn btn--ink" onClick={closeCart}>
              Browse products
            </button>
          </div>
        ) : (
          <>
            <div className="ship">
              <p>
                {remaining > 0
                  ? `Add ${formatPrice(remaining)} more for free shipping`
                  : 'You’ve unlocked free shipping'}
              </p>
              <div className="ship__bar" aria-hidden="true">
                <span style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_OVER) * 100)}%` }} />
              </div>
            </div>
            <ul className="lines">
              {items.map((item) => {
                const p = getProduct(item.productId);
                if (!p) return null;
                return (
                  <li key={item.key} className="line">
                    <ProductVisual className="line__art" product={p} colorName={item.color} />
                    <div className="line__info">
                      <p className="line__name">{p.name}</p>
                      <p className="line__sub">
                        {item.color}
                        {item.size ? ` · ${item.size}` : ''}
                      </p>
                      <div className="qty">
                        <button type="button" onClick={() => setQty(item.key, item.qty - 1)} aria-label={`Decrease quantity of ${p.name}`}>
                          −
                        </button>
                        <span aria-live="polite">{item.qty}</span>
                        <button type="button" onClick={() => setQty(item.key, item.qty + 1)} aria-label={`Increase quantity of ${p.name}`}>
                          +
                        </button>
                      </div>
                    </div>
                    <div className="line__end">
                      <p>{formatPrice(p.price * item.qty)}</p>
                      <button type="button" className="link-btn" onClick={() => removeItem(item.key)}>
                        Remove
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
            <footer className="drawer__foot">
              <p className="total">
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal)}</strong>
              </p>
              <p className="drawer__note">
                {shipping === 0 ? 'Free shipping' : `Shipping ${formatPrice(shipping)}`}. Taxes included.
              </p>
              <button type="button" className="btn btn--ink btn--block" onClick={startCheckout}>
                Continue to payment
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
