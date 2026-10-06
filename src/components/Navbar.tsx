import { useEffect, useMemo, useRef, useState } from 'react';
import { categories, formatPrice } from '../data/products';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductsContext';
import { useScrollState, useTheme } from '../hooks';
import type { Product } from '../types';
import ProductVisual from './ProductVisual';

interface Props {
  /** Id of the section currently in view (from scroll-spy), or null. */
  active: string | null;
  view: 'shop' | 'admin';
  /** Scroll to a section id ('top', 'shop', 'caps', 'about', ...). */
  onSelect: (id: string) => void;
  onAdmin: () => void;
  onTrack: () => void;
  onOpenProduct: (p: Product) => void;
}

export default function Navbar({ active, view, onSelect, onAdmin, onTrack, onOpenProduct }: Props) {
  const { count, openCart } = useCart();
  const { products } = useProducts();
  const { progress, scrolled } = useScrollState();
  const { theme, toggle: toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [bump, setBump] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const prevCount = useRef(count);

  // Bounce the cart button whenever something is added.
  useEffect(() => {
    if (count > prevCount.current) {
      setBump(true);
      const t = window.setTimeout(() => setBump(false), 500);
      prevCount.current = count;
      return () => window.clearTimeout(t);
    }
    prevCount.current = count;
  }, [count]);

  // "/" or Ctrl/Cmd+K opens search; Escape closes search and menu.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement)?.tagName ?? '');
      if ((e.key === '/' && !typing) || (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === 'Escape') {
        setSearchOpen(false);
        setMenuOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
    else setQuery('');
  }, [searchOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter((p) => `${p.name} ${p.category} ${p.colors.map((c) => c.name).join(' ')}`.toLowerCase().includes(q))
      .slice(0, 5);
  }, [query, products]);

  const choose = (id: string) => {
    onSelect(id);
    setMenuOpen(false);
  };

  // Only link to groups that actually have products.
  const links = categories.filter((c) => c.id === 'all' || products.some((p) => p.category === c.id));
  const targetOf = (id: string) => (id === 'all' ? 'shop' : id);

  return (
    <header className={`nav${scrolled ? ' nav--solid' : ''}`}>
      <div className="nav__inner">
        <a
          className="nav__brand"
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            choose('top');
          }}
          aria-label="ARC home"
        >
          <span className="nav__mark" aria-hidden="true">a</span>
          <span>ARC</span>
        </a>

        <nav className={`nav__links${menuOpen ? ' is-open' : ''}`} id="nav-links" aria-label="Shop categories">
          {links.map((c) => (
            <a
              key={c.id}
              href={`#${targetOf(c.id)}`}
              className="nav__link"
              aria-current={view === 'shop' && c.id !== 'all' && active === c.id ? 'page' : undefined}
              onClick={(e) => {
                e.preventDefault();
                choose(targetOf(c.id));
              }}
            >
              {c.label}
            </a>
          ))}
          <a
            href="#about"
            className="nav__link"
            aria-current={view === 'shop' && active === 'about' ? 'page' : undefined}
            onClick={(e) => {
              e.preventDefault();
              choose('about');
            }}
          >
            About
          </a>
          <a
            href="#contact"
            className="nav__link"
            aria-current={view === 'shop' && active === 'contact' ? 'page' : undefined}
            onClick={(e) => {
              e.preventDefault();
              choose('contact');
            }}
          >
            Contact
          </a>
          <button
            type="button"
            className="nav__link"
            onClick={() => {
              onTrack();
              setMenuOpen(false);
            }}
          >
            Track order
          </button>
          <button
            type="button"
            className="nav__link nav__admin"
            aria-current={view === 'admin' ? 'page' : undefined}
            onClick={() => {
              onAdmin();
              setMenuOpen(false);
            }}
          >
            Admin
          </button>
        </nav>

        <div className="nav__tools">
          <button
            type="button"
            className="nav__icon"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {theme === 'dark' ? (
                <>
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
                </>
              ) : (
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
              )}
            </svg>
          </button>
          <div className={`search${searchOpen ? ' is-open' : ''}`}>
            <button
              type="button"
              className="nav__icon"
              onClick={() => setSearchOpen((o) => !o)}
              aria-label={searchOpen ? 'Close search' : 'Search products'}
              aria-expanded={searchOpen}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                {searchOpen ? <path d="M6 6l12 12M18 6 6 18" /> : <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></>}
              </svg>
            </button>
            <div className="search__panel">
              <input
                ref={searchRef}
                className="search__input"
                type="search"
                placeholder="Search caps, tees…  ( / )"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search products"
                tabIndex={searchOpen ? 0 : -1}
              />
              {searchOpen && query.trim() !== '' && (
                <ul className="search__results">
                  {results.length === 0 && <li className="search__none">No matches for “{query}”</li>}
                  {results.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setSearchOpen(false);
                          onOpenProduct(p);
                        }}
                      >
                        <ProductVisual className="search__thumb" product={p} />
                        <span>{p.name}</span>
                        <span className="search__price">{formatPrice(p.price)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <button
            type="button"
            className={`nav__cart${bump ? ' is-bump' : ''}`}
            onClick={openCart}
            aria-label={`Open cart, ${count} ${count === 1 ? 'item' : 'items'}`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z" />
              <path d="M9 8V6a3 3 0 0 1 6 0v2" />
            </svg>
            <span className="nav__cart-label">Cart</span>
            {count > 0 && <span className="nav__badge">{count}</span>}
          </button>

          <button
            type="button"
            className={`nav__burger${menuOpen ? ' is-open' : ''}`}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="nav-links"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
      <div className="nav__progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
    </header>
  );
}
