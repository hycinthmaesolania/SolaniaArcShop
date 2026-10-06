import type { Category, CategoryFilter, Product } from '../types';
import { productImage } from '../lib/asset';
import { CAP_PANELS } from '../lib/options';

const TEE_SIZES = ['S', 'M', 'L', 'XL'];

const baseProducts: Product[] = [
  {
    id: 'arc-glory',
    name: 'ARC Glory Cap',
    kind: 'cap',
    category: 'caps',
    price: 30,
    badge: 'New',
    blurb: 'Two-tone sun yellow and cream cap with the raised “a” mark on the front and “Glory” script stitched on the side.',
    image: productImage('glory-cap'),
    colors: [
      { name: 'Sun / Cream', hex: '#f2c230' },
      { name: 'Cream / Sun', hex: '#f4f1e8' },
    ],
  },
  {
    id: 'arc-royals',
    name: 'ARC Royals Cap',
    kind: 'cap',
    category: 'caps',
    price: 30,
    badge: 'New',
    blurb: 'Royal blue and cream curved-brim cap with the raised “a” mark and “Royals” script on the side.',
    image: productImage('royals-cap'),
    colors: [
      { name: 'Royal blue', hex: '#2a44c9' },
      { name: 'Cream', hex: '#e9e4d6' },
    ],
  },
  {
    id: 'arc-runner',
    name: 'ARC Runner Cap',
    kind: 'cap',
    category: 'caps',
    price: 32,
    badge: 'New',
    blurb: 'Lightweight five-panel runner in teal with mesh side panels, a perforated white brim and the “It’s ours” side print.',
    image: productImage('runner-cap'),
    colors: [{ name: 'Teal', hex: '#4fb5b0' }],
  },
  {
    id: 'arc-tonal-tee',
    name: 'ARC Tonal Tee',
    kind: 'tee',
    category: 'shirts',
    price: 32,
    badge: 'New',
    blurb: 'Heavyweight black tee with a tone-on-tone embroidered ARC wordmark and an “It’s ours” taped neck label.',
    colors: [{ name: 'Black', hex: '#111111' }],
    sizes: TEE_SIZES,
  },
  {
    id: 'arc-corduroy',
    name: 'ARC Corduroy Cap',
    kind: 'cap',
    category: 'caps',
    price: 32,
    blurb: 'Ribbed corduroy cap with the ARC wordmark embroidered on the front and the “a” mark on the side.',
    colors: [
      { name: 'Forest', hex: '#1f5c4f', images: [productImage('corduroy-green')] },
      { name: 'Black', hex: '#1a1a1a', images: [productImage('corduroy-black')] },
    ],
  },
  {
    id: 'arc-trucker',
    name: 'ARC Trucker Cap',
    kind: 'cap',
    category: 'caps',
    price: 28,
    blurb: 'Five-panel trucker with a mesh back and the “It’s ARC, it’s ours” print, est. 2024.',
    image: productImage('trucker'),
    colors: [
      { name: 'Olive', hex: '#4b5a2f' },
      { name: 'Navy', hex: '#1b2a4a' },
    ],
  },
  {
    id: 'arc-golf',
    name: 'ARC Golf Cap',
    kind: 'cap',
    category: 'caps',
    price: 30,
    blurb: 'Lightweight cap with perforated side panels, a contrast rope trim and the raised ARC logo.',
    colors: [
      { name: 'Black', hex: '#1a1a1a', images: [productImage('golf-black')] },
      { name: 'White', hex: '#f1f1ee', images: [productImage('golf-white')] },
    ],
  },
  {
    id: 'arc-logo',
    name: 'ARC Logo Cap',
    kind: 'cap',
    category: 'caps',
    price: 28,
    blurb: 'Curved-brim cap in royal blue, maroon and cream, with the raised “a” mark on the front.',
    image: productImage('logo-cap'),
    colors: [
      { name: 'Royal blue', hex: '#2a44c9' },
      { name: 'Maroon', hex: '#8e2432' },
      { name: 'Cream', hex: '#efe8da' },
    ],
  },
  {
    id: 'arc-vintage',
    name: 'ARC Vintage Cap',
    kind: 'cap',
    category: 'caps',
    price: 34,
    blurb: 'Pinstripe crown, navy corduroy brim, red rope trim and a woven ARC Vintage patch.',
    image: productImage('vintage'),
    colors: [{ name: 'Navy pinstripe', hex: '#1b2a4a' }],
  },
  {
    id: 'arc-valor',
    name: 'ARC Valor Cap',
    kind: 'cap',
    category: 'caps',
    price: 30,
    blurb: 'Two-tone maroon and white cap with the raised “a” mark and “Valor” script stitched on the side.',
    image: productImage('valor'),
    colors: [{ name: 'Maroon', hex: '#8e2432' }],
  },
  {
    id: 'heavy-tee',
    name: 'Heavy Tee',
    kind: 'tee',
    category: 'shirts',
    price: 30,
    blurb: '220 gsm organic cotton that holds its shape wash after wash.',
    colors: [
      { name: 'Chalk', hex: '#F4F4F0' },
      { name: 'Ink', hex: '#13233F' },
      { name: 'Sky', hex: '#7FB2D9' },
    ],
    sizes: TEE_SIZES,
  },
  {
    id: 'day-pack',
    name: 'Day Pack',
    kind: 'backpack',
    category: 'bags',
    price: 79,
    blurb: '20 litres, water-resistant shell, padded laptop sleeve up to 15".',
    colors: [
      { name: 'Pine', hex: '#2E6B52' },
      { name: 'Coal', hex: '#2B2D31' },
      { name: 'Sun', hex: '#F2B632' },
    ],
  },
  {
    id: 'wool-socks',
    name: 'Trail Socks',
    kind: 'socks',
    category: 'extras',
    price: 16,
    blurb: 'Merino blend with a cushioned heel and a reinforced toe.',
    colors: [
      { name: 'Moss', hex: '#6F7F4A' },
      { name: 'Rust', hex: '#B5532E' },
      { name: 'Ink', hex: '#13233F' },
    ],
    sizes: ['S/M', 'L/XL'],
  },
];

/** Caps always offer the 5 Panel / 6 Panel choice. */
export const defaultProducts: Product[] = baseProducts.map((p) =>
  p.kind === 'cap' && !p.sizes ? { ...p, sizes: CAP_PANELS } : p,
);

export const categories: { id: CategoryFilter; label: string }[] = [
  { id: 'all', label: 'Shop all' },
  { id: 'caps', label: 'Caps' },
  { id: 'shirts', label: 'Shirts' },
  { id: 'bags', label: 'Bags' },
  { id: 'extras', label: 'Extras' },
];

/** Name and one-liner shown on each product group on the shop page. */
export const groupInfo: Record<Category, { title: string; blurb: string }> = {
  caps: { title: 'Caps', blurb: 'The ARC mark in colours you won’t lose in a crowd.' },
  shirts: { title: 'Shirts', blurb: 'Tonal tees and everyday layers.' },
  bags: { title: 'Bags', blurb: 'Everyday carry, made to be ours.' },
  extras: { title: 'Extras', blurb: 'Small things that finish the fit.' },
};

export const categoryLabel = (c: Category): string =>
  categories.find((x) => x.id === c)?.label ?? c;

export const formatPrice = (n: number): string =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(n);
