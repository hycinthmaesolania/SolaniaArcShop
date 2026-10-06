import { useRef, useState } from 'react';
import type { Product } from '../types';
import { productImage } from '../lib/asset';
import { formatPrice } from '../data/products';
import { useProducts } from '../context/ProductsContext';

const CAPS = [
  { id: 'arc-glory', img: 'glory-cap', accent: '#f2c230', label: 'Sun' },
  { id: 'arc-royals', img: 'royals-cap', accent: '#4f6bff', label: 'Royal' },
  { id: 'arc-runner', img: 'runner-cap', accent: '#4fb5b0', label: 'Teal' },
];

export default function Hero({ onOpen }: { onOpen: (p: Product) => void }) {
  const { products, getProduct } = useProducts();
  // New products are added to the front of the list, so the first one is the newest.
  const newest = products[0];
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const cap = CAPS[active];
  const product = getProduct(cap.id);

  // Discs drift gently with the pointer.
  const onMove = (e: React.PointerEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = e.currentTarget.getBoundingClientRect();
    el.style.setProperty('--mx', String(((e.clientX - r.left) / r.width - 0.5).toFixed(3)));
    el.style.setProperty('--my', String(((e.clientY - r.top) / r.height - 0.5).toFixed(3)));
  };
  const onLeave = () => {
    ref.current?.style.setProperty('--mx', '0');
    ref.current?.style.setProperty('--my', '0');
  };

  // The two caps that are not selected sit behind as small discs; clicking one brings it forward.
  const roleOf = (i: number) => (i === active ? 'main' : (i - active + CAPS.length) % CAPS.length === 1 ? 'side1' : 'side2');

  return (
    <section
      className="hero"
      id="top"
      style={{
        ['--accent' as string]: cap.accent,
        ['--hero-img' as string]: `url(${import.meta.env.BASE_URL}hero-bg.webp)`,
      }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      <div className="hero__copy">
        <p className="eyebrow">New drop · Glory, Royals &amp; Runner</p>
        <h1>
          It’s ARC.
          <br />
          <span>It’s ours.</span>
        </h1>
        <p className="hero__lede">
          Caps with the ARC mark in colours you won’t lose in a crowd, plus tonal tees and bags for everyday carry.
        </p>
        <div className="hero__cta">
          <a className="btn btn--sun" href="#shop">
            Shop the collection
          </a>
          {newest && (
            <button type="button" className="btn btn--ghost" onClick={() => onOpen(newest)}>
              See the new product
            </button>
          )}
        </div>
        <div className="hero__pick" role="group" aria-label="Pick a cap colour">
          <span className="hero__pick-label">Try a colour</span>
          {CAPS.map((c, i) => (
            <button
              key={c.id}
              type="button"
              className="hero__dot"
              style={{ background: c.accent }}
              aria-label={`Show the ${c.label} cap`}
              aria-pressed={i === active}
              onClick={() => setActive(i)}
            />
          ))}
        </div>
      </div>

      <div className="hero__art" ref={ref}>
        {CAPS.map((c, i) => (
          <button
            key={c.id}
            type="button"
            className={`hero__disc hero__disc--${roleOf(i)}`}
            aria-label={i === active ? `${c.label} cap (selected)` : `Show the ${c.label} cap`}
            onClick={() => setActive(i)}
          >
            <img src={productImage(c.img)} alt="" />
          </button>
        ))}
        {product && (
          <button type="button" className="hero__tag" onClick={() => onOpen(product)} key={cap.id}>
            <small>Tap to shop</small>
            <strong>{product.name}</strong>
            <span>{formatPrice(product.price)} →</span>
          </button>
        )}
      </div>
    </section>
  );
}
