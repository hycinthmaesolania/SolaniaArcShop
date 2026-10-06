import { useState } from 'react';
import type { Product } from '../types';
import { formatPrice } from '../data/products';
import { useCart } from '../context/CartContext';
import { useReviews } from '../context/ReviewsContext';
import ProductVisual from './ProductVisual';
import Stars from './Stars';
import { isSoldOut } from '../lib/stock';
import { colorPhotos } from '../lib/photos';

interface Props {
  product: Product;
  index: number;
  onOpen: (p: Product) => void;
}

export default function ProductCard({ product, index, onOpen }: Props) {
  const { addItem } = useCart();
  const { forProduct } = useReviews();
  const real = forProduct(product.id);
  const average = real.length ? real.reduce((n, r) => n + r.rating, 0) / real.length : 0;
  const reviewCount = (product.reviews ?? 0) + real.length;
  const [added, setAdded] = useState(false);
  // Anything that needs a choice (a size or a colour) opens the popup instead of adding blindly.
  const soldOut = isSoldOut(product);
  const needsChoice = Boolean(product.sizes?.length) || product.colors.length > 1;

  // Hover picture: the next photo after the cover (the cover is the main photo, or the first colour's first sample).
  const samples = colorPhotos(product.colors[0]);
  const second = (product.image ? samples[0] : samples[1]) ?? product.gallery?.[0];

  const saving = product.compareAtPrice && product.compareAtPrice > product.price ? product.compareAtPrice - product.price : 0;

  const quickAdd = () => {
    if (soldOut) return;
    if (needsChoice) {
      onOpen(product);
      return;
    }
    addItem({ productId: product.id, color: product.colors[0].name });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  return (
    <li className={`card${soldOut ? ' card--out' : ''}`} style={{ ['--i' as string]: Math.min(index, 8) }}>
      <div className="card__media">
        <button type="button" className="card__hit" onClick={() => onOpen(product)} aria-label={`View ${product.name}`}>
          <ProductVisual className="card__art" product={product} />
          {second && <img className="card__alt" src={second} alt="" loading="lazy" />}
        </button>
        <span className={`card__stock${soldOut ? ' card__stock--out' : ''}`}><i aria-hidden="true" />{soldOut ? 'Sold out' : 'In stock'}</span>
        {product.badge && <span className="card__badge">{product.badge}</span>}
        <button type="button" className={`card__add${added ? ' is-added' : ''}`} onClick={quickAdd} disabled={soldOut}>
          {soldOut ? 'Sold out' : added ? 'Added ✓' : '+ Add'}
        </button>
      </div>
      <button type="button" className="card__info" onClick={() => onOpen(product)}>
        <span className="card__name">{product.name}</span>
        {(product.reviews !== undefined || real.length > 0) && (
          <span className="card__reviews">
            {real.length > 0 && <Stars value={average} />} {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
          </span>
        )}
        <span className="card__prices">
          <strong>{formatPrice(product.price)}</strong>
          {saving > 0 && (
            <>
              <s>{formatPrice(product.compareAtPrice as number)}</s>
              <em>Save {formatPrice(saving)}</em>
            </>
          )}
        </span>
      </button>
    </li>
  );
}
