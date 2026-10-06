import type { Product } from '../types';

/** True when the admin has set the stock to 0 (or less). */
export const isSoldOut = (p: Pick<Product, 'stock'>) => p.stock !== undefined && p.stock <= 0;

/** How many more of this product can be bought, or undefined when stock isn't tracked. */
export const stockLeft = (p: Pick<Product, 'stock'>) => (p.stock === undefined ? undefined : Math.max(0, p.stock));
