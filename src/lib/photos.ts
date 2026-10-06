import type { ColorOption, Product } from '../types';

/**
 * A colour's own sample photos. `image` is the old single-photo field; it is still read
 * so products saved before sample photos existed keep their pictures.
 */
export const colorPhotos = (c: ColorOption | undefined): string[] =>
  [c?.image, ...(c?.images ?? [])].filter((x): x is string => Boolean(x));

/**
 * What the popup shows: only the picked colour's sample photos, then the product's shared detail shots.
 * The main photo is just the cover on the shop page – buyers don't see it again in the popup.
 * (If a product has no sample or detail photos at all, the main photo is shown so the popup isn't empty.)
 */
export const popupPhotos = (p: Product, c: ColorOption | undefined): string[] => {
  const list = [...colorPhotos(c), ...(p.gallery ?? [])].filter((x): x is string => Boolean(x));
  return list.length || !p.image ? list : [p.image];
};

/** Cover picture for cards and thumbnails: the main photo, or the colour's first sample if there is no main photo. */
export const coverPhoto = (p: Product, c: ColorOption | undefined): string | undefined =>
  p.image ?? colorPhotos(c)[0];
