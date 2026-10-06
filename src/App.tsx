import { useMemo, useState } from 'react';
import { ProductsProvider, useProducts } from './context/ProductsContext';
import { OrdersProvider } from './context/OrdersContext';
import { CartProvider } from './context/CartContext';
import { ReviewsProvider } from './context/ReviewsContext';
import { categories, groupInfo } from './data/products';
import type { Category, Product } from './types';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Marquee from './components/Marquee';
import DropFeature from './components/DropFeature';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';
import Checkout from './components/Checkout';
import Footer from './components/Footer';
import TrackOrder from './components/TrackOrder';
import AdminPage from './admin/AdminPage';
import { useReveal, useScrollSpy } from './hooks';

function Shell() {
  const { products } = useProducts();
  const [view, setView] = useState<'shop' | 'admin'>('shop');
  const [selected, setSelected] = useState<Product | null>(null);
  const [track, setTrack] = useState<{ n: number; id?: string; email?: string } | null>(null);
  const openTrack = (id?: string, email?: string) => setTrack({ n: Date.now(), id, email });
  const [sort, setSort] = useState<'featured' | 'low' | 'high' | 'name'>('featured');

  // One named section per category that has products, in the order of the nav.
  const groups = useMemo(
    () =>
      categories
        .filter((c): c is { id: Category; label: string } => c.id !== 'all')
        .map((c) => {
          const list = products.filter((p) => p.category === c.id);
          if (sort === 'low') list.sort((a, b) => a.price - b.price);
          if (sort === 'high') list.sort((a, b) => b.price - a.price);
          if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
          return { id: c.id, items: list };
        })
        .filter((g) => g.items.length > 0),
    [products, sort],
  );

  const spotlight = products.find((p) => p.id === 'arc-tonal-tee' && p.gallery?.length);
  const active = useScrollSpy([...groups.map((g) => g.id), 'drop', 'about', 'contact'], view === 'shop');
  useReveal([view, products.length]);

  const scrollToId = (id: string) => {
    if (id === 'top') window.scrollTo({ top: 0, behavior: 'smooth' });
    else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const goTo = (id: string) => {
    if (view !== 'shop') {
      setView('shop');
      // The page sections aren't mounted yet, so scroll once they are.
      window.setTimeout(() => scrollToId(id), 60);
    } else {
      scrollToId(id);
    }
  };

  const goAdmin = () => {
    setView('admin');
    window.scrollTo({ top: 0 });
  };

  return (
    <>
      <Navbar active={active} view={view} onSelect={goTo} onAdmin={goAdmin} onTrack={() => openTrack()} onOpenProduct={setSelected} />
      <main>
        {view === 'admin' ? (
          <AdminPage />
        ) : (
          <>
            <Hero onOpen={setSelected} />
            <Marquee />
            <section className="shop" id="shop" aria-labelledby="shop-title">
              <div className="shop__head">
                <h2 id="shop-title">Shop all</h2>
                <p>{products.length} {products.length === 1 ? 'product' : 'products'}</p>
              </div>
              <div className="shop__bar">
                <div className="chips" role="group" aria-label="Jump to a collection">
                  {groups.map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      className="chip"
                      aria-pressed={active === g.id}
                      onClick={() => scrollToId(g.id)}
                    >
                      {groupInfo[g.id].title}
                      <span>{g.items.length}</span>
                    </button>
                  ))}
                </div>
                <label className="sort">
                  <span className="sr-only">Sort products within each group</span>
                  <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
                    <option value="featured">Featured</option>
                    <option value="low">Price: low to high</option>
                    <option value="high">Price: high to low</option>
                    <option value="name">Name A–Z</option>
                  </select>
                </label>
              </div>

              {groups.length === 0 && <p className="shop__empty">Nothing here yet. Check back soon.</p>}
              {groups.map((g, gi) => (
                <section className="group" id={g.id} key={g.id} aria-labelledby={`${g.id}-title`} data-reveal>
                  <header className="group__head">
                    <span className="group__no" aria-hidden="true">{String(gi + 1).padStart(2, '0')}</span>
                    <div>
                      <h3 id={`${g.id}-title`}>{groupInfo[g.id].title}</h3>
                      <p>{groupInfo[g.id].blurb}</p>
                    </div>
                    <span className="group__count">{g.items.length} {g.items.length === 1 ? 'piece' : 'pieces'}</span>
                  </header>
                  <ul className="grid" key={sort}>
                    {g.items.map((p, i) => (
                      <ProductCard key={p.id} product={p} index={i} onOpen={setSelected} />
                    ))}
                  </ul>
                </section>
              ))}
            </section>
            {spotlight && <DropFeature product={spotlight} onOpen={setSelected} />}
          </>
        )}
      </main>
      <Footer onSelect={goTo} onTrack={() => openTrack()} />
      <ProductModal product={selected} onClose={() => setSelected(null)} />
      <CartDrawer />
      <Checkout onTrack={openTrack} />
      {track && (
        <TrackOrder
          key={track.n}
          prefill={track.id && track.email ? { id: track.id, email: track.email } : undefined}
          onClose={() => setTrack(null)}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <ProductsProvider>
      <OrdersProvider>
        <CartProvider>
          <ReviewsProvider>
            <Shell />
          </ReviewsProvider>
        </CartProvider>
      </OrdersProvider>
    </ProductsProvider>
  );
}
