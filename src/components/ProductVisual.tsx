import type { Product } from '../types';
import ProductArt from './ProductArt';
import { coverPhoto } from '../lib/photos';

interface Props {
  product: Product;
  colorName?: string;
  className?: string;
}

/**
 * Picks the picture: the product's main photo (the same for every colour), or the colour's
 * first sample photo if there is no main photo, otherwise an illustration drawn in the colour.
 */
export default function ProductVisual({ product, colorName, className }: Props) {
  const color = product.colors.find((c) => c.name === colorName) ?? product.colors[0];
  const photo = coverPhoto(product, color);
  if (photo) {
    return (
      <img
        className={className}
        src={photo}
        alt={product.colors.length > 1 ? `${product.name} in ${color.name}` : product.name}
        loading="lazy"
        style={{ objectFit: 'cover' }}
      />
    );
  }
  return (
    <ProductArt
      className={className}
      kind={product.kind}
      color={color.hex}
      label={`${product.name} in ${color.name}`}
    />
  );
}
