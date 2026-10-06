import type { Product } from '../types';

/** Every cap comes in two constructions. */
export const CAP_PANELS = ['5 Panel', '6 Panel'];

/** Heading for the choice shown next to a product's sizes: caps pick a panel style, everything else a size. */
export const sizeLabel = (p: Pick<Product, 'kind'>): string => (p.kind === 'cap' ? 'Panel' : 'Size');
