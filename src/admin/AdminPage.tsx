import { useEffect, useRef, useState } from 'react';
import type { Product } from '../types';
import { useProducts } from '../context/ProductsContext';
import { useOrders } from '../context/OrdersContext';
import { categoryLabel, formatPrice } from '../data/products';
import { isSoldOut } from '../lib/stock';
import ProductVisual from '../components/ProductVisual';
import AdminLogin from './AdminLogin';
import ProductForm from './ProductForm';
import OrdersPanel from './OrdersPanel';
import ReviewsPanel from './ReviewsPanel';
import { useReviews } from '../context/ReviewsContext';

const SESSION_KEY = 'arc-admin';

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) === '1';
    } catch {
      return false;
    }
  });

  if (!authed) {
    return (
      <AdminLogin
        onSuccess={() => {
          try {
            sessionStorage.setItem(SESSION_KEY, '1');
          } catch {
            /* ignore */
          }
          setAuthed(true);
        }}
      />
    );
  }

  return (
    <Dashboard
      onLogout={() => {
        try {
          sessionStorage.removeItem(SESSION_KEY);
        } catch {
          /* ignore */
        }
        setAuthed(false);
      }}
    />
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const { products, addProduct, updateProduct, deleteProduct, resetProducts, saveError } = useProducts();
  const { orders } = useOrders();
  const { reviews } = useReviews();
  const [tab, setTab] = useState<'products' | 'orders' | 'reviews'>('products');
  const [editing, setEditing] = useState<Product | 'new' | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [notice, setNotice] = useState('');
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editing) formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [editing]);

  const revenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const save = (p: Product) => {
    if (editing === 'new') {
      addProduct(p);
      setNotice(`Added “${p.name}” to the shop.`);
    } else {
      updateProduct(p);
      setNotice(`Saved changes to “${p.name}”.`);
    }
    setEditing(null);
  };

  return (
    <section className="admin">
      <header className="admin__head">
        <h1>Admin</h1>
        <button type="button" className="btn btn--line btn--small" onClick={onLogout}>
          Sign out
        </button>
      </header>

      <dl className="stats">
        <div><dt>Products</dt><dd>{products.length}</dd></div>
        <div><dt>Orders</dt><dd>{orders.length}</dd></div>
        <div><dt>Revenue</dt><dd>{formatPrice(revenue)}</dd></div>
      </dl>

      <div className="tabs" role="tablist">
        <button role="tab" type="button" aria-selected={tab === 'products'} onClick={() => setTab('products')}>Products</button>
        <button role="tab" type="button" aria-selected={tab === 'orders'} onClick={() => setTab('orders')}>
          Orders{orders.length > 0 ? ` (${orders.length})` : ''}
        </button>
        <button role="tab" type="button" aria-selected={tab === 'reviews'} onClick={() => setTab('reviews')}>
          Reviews{reviews.length > 0 ? ` (${reviews.length})` : ''}
        </button>
      </div>

      <p className="notice" role="status">{notice}</p>
      {saveError && (
        <p className="field__error" role="alert">
          Your browser couldn’t save the latest change (storage is full). Remove some photos or products and try again.
        </p>
      )}

      {tab === 'products' ? (
        <>
          <div ref={formRef}>
            {editing ? (
              <ProductForm
                key={editing === 'new' ? 'new' : editing.id}
                initial={editing === 'new' ? undefined : editing}
                onSave={save}
                onCancel={() => setEditing(null)}
              />
            ) : (
              <div className="toolbar">
                <button type="button" className="btn btn--ink" onClick={() => { setNotice(''); setEditing('new'); }}>
                  Add product
                </button>
                {confirmReset ? (
                  <span className="confirm">
                    Replace everything with the sample products?
                    <button type="button" className="btn btn--danger btn--small" onClick={() => { resetProducts(); setConfirmReset(false); setNotice('Restored the sample products.'); }}>Yes, restore</button>
                    <button type="button" className="btn btn--line btn--small" onClick={() => setConfirmReset(false)}>Keep mine</button>
                  </span>
                ) : (
                  <button type="button" className="link-btn" onClick={() => setConfirmReset(true)}>Restore sample products</button>
                )}
              </div>
            )}
          </div>

          {products.length === 0 ? (
            <div className="empty">
              <h3>No products in the shop</h3>
              <p>Add your first product, or restore the samples.</p>
            </div>
          ) : (
            <ul className="plist">
              {products.map((p) => (
                <li key={p.id} className="prow">
                  <ProductVisual className="prow__art" product={p} />
                  <div className="prow__info">
                    <strong>{p.name}</strong>
                    <span>{categoryLabel(p.category)}{p.sizes ? ` · ${p.sizes.join(', ')}` : ''}{p.stock !== undefined ? (isSoldOut(p) ? ' · Sold out' : ` · ${p.stock} in stock`) : ''}</span>
                  </div>
                  <span className="prow__dots">
                    {p.colors.map((c) => (
                      <span key={c.name} className="dot" style={{ background: c.hex }} title={c.name} />
                    ))}
                  </span>
                  <span className="prow__price">{formatPrice(p.price)}</span>
                  <span className="prow__actions">
                    {confirmId === p.id ? (
                      <>
                        <button type="button" className="btn btn--danger btn--small" onClick={() => { deleteProduct(p.id); setConfirmId(null); setNotice(`Deleted “${p.name}”.`); }}>Delete</button>
                        <button type="button" className="btn btn--line btn--small" onClick={() => setConfirmId(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button type="button" className="btn btn--line btn--small" onClick={() => { setNotice(''); setEditing(p); }}>Edit</button>
                        <button type="button" className="link-btn" onClick={() => setConfirmId(p.id)}>Delete</button>
                      </>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : tab === 'orders' ? (
        <OrdersPanel />
      ) : (
        <ReviewsPanel />
      )}
    </section>
  );
}
