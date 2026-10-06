import type { Product } from '../types';
import { formatPrice } from '../data/products';

interface Props {
  product: Product;
  onOpen: (p: Product) => void;
}

/** Editorial band that spotlights one product with its detail photos. */
export default function DropFeature({ product, onOpen }: Props) {
  const [detail, label] = product.gallery ?? [];
  return (
    <section className="drop" id="drop" aria-labelledby="drop-title" data-reveal>
      <div className="drop__copy">
        <p className="eyebrow">The tonal tee</p>
        <h2 id="drop-title">Black on black. Loud where it counts.</h2>
        <p>{product.blurb}</p>
        <div className="drop__cta">
          <button type="button" className="btn btn--sun" onClick={() => onOpen(product)}>
            Shop · {formatPrice(product.price)}
          </button>
        </div>
      </div>
      <div className="drop__photos">
        {detail && <img className="drop__img drop__img--a" src={detail} alt="Close-up of the embroidered ARC wordmark" loading="lazy" />}
        {label && <img className="drop__img drop__img--b" src={label} alt="Stack of tees showing the “It’s ours” neck label" loading="lazy" />}
      </div>
    </section>
  );
}
