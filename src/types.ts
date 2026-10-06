export type Category = 'caps' | 'shirts' | 'bags' | 'extras';
export type CategoryFilter = Category | 'all';

export type ProductKind = 'cap' | 'tee' | 'hoodie' | 'tote' | 'backpack' | 'bottle' | 'socks';

export interface ColorOption {
  name: string;
  hex: string;
  /** @deprecated Old single colour photo. Still read (as the first sample photo) but no longer written. */
  image?: string;
  /** Sample photos for this colour. Separate from the product's main photo, which is never replaced by these. */
  images?: string[];
}

export interface Product {
  id: string;
  name: string;
  kind: ProductKind;
  category: Category;
  price: number;
  blurb: string;
  colors: ColorOption[];
  sizes?: string[];
  /** Optional uploaded photo (data URL). When absent, an SVG illustration is drawn from `kind`. */
  image?: string;
  /** Extra photos shown as thumbnails in the product popup (detail shots, labels, flat lays). */
  gallery?: string[];
  /** Short label on the product card, e.g. "New". */
  badge?: string;
  /** Original price before a discount. When higher than `price`, the card shows it struck through with a SAVE amount. */
  compareAtPrice?: number;
  /** Number of reviews, shown on the card ("72 reviews"). */
  reviews?: number;
  /** How many are left. Empty = stock is not tracked (always available). 0 = Sold out. Goes down when someone orders. */
  stock?: number;
}

export interface CartItem {
  key: string; // productId|color|size
  productId: string;
  color: string;
  size?: string;
  qty: number;
}

export type PaymentMethod = 'card' | 'paypal' | 'gcash' | 'cod';
export type OrderStatus = 'new' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderLine {
  name: string;
  color: string;
  size?: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  createdAt: string;
  customer: {
    name: string;
    email: string;
    address: string;
    city: string;
    postal: string;
    country: string;
  };
  lines: OrderLine[];
  subtotal: number;
  shipping: number;
  total: number;
  payment: { method: PaymentMethod; detail: string; paid: boolean };
  status: OrderStatus;
  /** When each status was set. Shown to the buyer on the Track order page. */
  history?: { status: OrderStatus; at: string }[];
}

export interface Review {
  id: string;
  productId: string;
  /** The order the buyer purchased the product in (reviews are only accepted from buyers). */
  orderId: string;
  name: string;
  rating: number; // 1-5
  text: string;
  createdAt: string;
}
