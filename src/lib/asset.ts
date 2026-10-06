/** URL of a photo in public/products/ (kept outside the bundle so the path never changes). */
export const productImage = (name: string): string =>
  `${import.meta.env.BASE_URL}products/${name}.webp`;
