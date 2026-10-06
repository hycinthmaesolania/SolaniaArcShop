import { useEffect, useRef, useState } from 'react';
import type { Product } from '../types';
import { categoryLabel, formatPrice } from '../data/products';
import { useCart } from '../context/CartContext';
import { useOverlay } from '../hooks';
import ProductVisual from './ProductVisual';
import Reviews from './Reviews';
import { isSoldOut } from '../lib/stock';
import { popupPhotos } from '../lib/photos';
import { sizeLabel } from '../lib/options';

interface Props {
  product: Product | null;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: Props) {
  const { addItem, openCart } = useCart();
  const [colorName, setColorName] = useState('');
  const [size, setSize] = useState<string | undefined>();
  const [needSize, setNeedSize] = useState(false);
  const [shot, setShot] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);

  useOverlay(product !== null, onClose);

  useEffect(() => {
    if (product) {
      setColorName(product.colors[0].name);
      setSize(undefined);
      setNeedSize(false);
      setShot(0);
      closeRef.current?.focus();
    }
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const total = popupPhotos(product, product.colors.find((x) => x.name === colorName)).length;
    const onKey = (e: KeyboardEvent) => {
      if (total < 2) return;
      // Arrow keys move the cursor when typing (e.g. in the review form), so don't flip photos then.
      if (/^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement)?.tagName ?? '')) return;
      if (e.key === 'ArrowRight') setShot((n) => (n + 1) % total);
      if (e.key === 'ArrowLeft') setShot((n) => (n - 1 + total) % total);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [product, colorName]);

  if (!product) return null;

  const color = product.colors.find((c) => c.name === colorName) ?? product.colors[0];

  const photos = popupPhotos(product, color);
  const current = Math.min(shot, Math.max(photos.length - 1, 0));
  const photo = photos[current];
  const go = (dir: 1 | -1) => setShot((current + dir + photos.length) % photos.length);

  // Swipe left/right on touch screens.
  let touchX = 0;
  const onTouchStart = (e: React.TouchEvent) => {
    touchX = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchX;
    if (photos.length > 1 && Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
  };

  const soldOut = isSoldOut(product);

  const add = () => {
    if (soldOut) return;
    if (product.sizes && !size) {
      setNeedSize(true);
      return;
    }
    addItem({ productId: product.id, color: color.name, size });
    onClose();
    openCart();
  };

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button ref={closeRef} type="button" className="icon-btn modal__close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <div className="modal__gallery" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <div className="stage">
            {photo ? (
              <img key={photo} className="modal__art" src={photo} alt={`${product.name} in ${color.name}`} />
            ) : (
              <ProductVisual className="modal__art" product={product} colorName={color.name} />
            )}
            {photos.length > 1 && (
              <>
                <button type="button" className="stage__arrow stage__arrow--prev" onClick={() => go(-1)} aria-label="Previous photo">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 5-7 7 7 7" /></svg>
                </button>
                <button type="button" className="stage__arrow stage__arrow--next" onClick={() => go(1)} aria-label="Next photo">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>
                </button>
              </>
            )}
          </div>
          {photos.length > 1 && (
            <>
              <div className="dots" aria-hidden="true">
                {photos.map((src, i) => (
                  <span key={`${i}-${src.length}`} className={i === current ? 'is-on' : ''} />
                ))}
              </div>
              <div className="thumbs" role="group" aria-label="Product photos">
                {photos.map((src, i) => (
                  <button
                    key={`${i}-${src.length}`}
                    type="button"
                    className="thumb"
                    aria-label={`Photo ${i + 1} of ${photos.length}`}
                    aria-pressed={i === current}
                    onClick={() => setShot(i)}
                  >
                    <img src={src} alt="" />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="modal__body">
          <p className="modal__cat">{categoryLabel(product.category)}</p>
          <h2 id="modal-title">{product.name}</h2>
          <p className="modal__price">
            {formatPrice(product.price)}
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <s className="modal__was">{formatPrice(product.compareAtPrice)}</s>
            )}
          </p>
          <p className="modal__blurb">{product.blurb}</p>

          <fieldset className="opt">
            <legend>Colour: {color.name}</legend>
            <div className="opt__row">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  className="swatch"
                  style={{ background: c.hex }}
                  aria-label={c.name}
                  aria-pressed={c.name === color.name}
                  onClick={() => {
                    setColorName(c.name);
                    setShot(0);
                  }}
                />
              ))}
            </div>
          </fieldset>

          {product.sizes && (
            <fieldset className="opt">
              <legend>{sizeLabel(product)}</legend>
              <div className="opt__row">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="size"
                    aria-pressed={s === size}
                    onClick={() => {
                      setSize(s);
                      setNeedSize(false);
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {needSize && (
                <p className="opt__error" role="alert">
                  Choose a {sizeLabel(product).toLowerCase()} to add this to your cart.
                </p>
              )}
            </fieldset>
          )}

          <button type="button" className="btn btn--ink btn--block" onClick={add} disabled={soldOut}>
            {soldOut ? 'Sold out' : `Add to cart · ${formatPrice(product.price)}`}
          </button>
        </div>
        <Reviews key={product.id} product={product} />
      </div>
    </div>
  );
}
