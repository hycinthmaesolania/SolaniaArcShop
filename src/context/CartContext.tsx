import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react';
import type { CartItem } from '../types';
import { useProducts } from './ProductsContext';
import { stockLeft } from '../lib/stock';

type Action =
  | { type: 'add'; item: Omit<CartItem, 'qty' | 'key'> }
  | { type: 'setQty'; key: string; qty: number }
  | { type: 'remove'; key: string }
  | { type: 'prune'; ids: string[] }
  | { type: 'clear' };

const STORAGE_KEY = 'arc-cart';
const MAX_QTY = 10;

const makeKey = (productId: string, color: string, size?: string) =>
  [productId, color, size ?? ''].join('|');

function reducer(state: CartItem[], action: Action): CartItem[] {
  switch (action.type) {
    case 'add': {
      const key = makeKey(action.item.productId, action.item.color, action.item.size);
      const existing = state.find((i) => i.key === key);
      if (existing) {
        return state.map((i) =>
          i.key === key ? { ...i, qty: Math.min(MAX_QTY, i.qty + 1) } : i,
        );
      }
      return [...state, { ...action.item, key, qty: 1 }];
    }
    case 'setQty':
      return action.qty <= 0
        ? state.filter((i) => i.key !== action.key)
        : state.map((i) =>
            i.key === action.key ? { ...i, qty: Math.min(MAX_QTY, action.qty) } : i,
          );
    case 'remove':
      return state.filter((i) => i.key !== action.key);
    case 'prune': {
      const next = state.filter((i) => action.ids.includes(i.productId));
      return next.length === state.length ? state : next;
    }
    case 'clear':
      return [];
  }
}

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  isCheckout: boolean;
  openCart: () => void;
  closeCart: () => void;
  startCheckout: () => void;
  closeCheckout: () => void;
  addItem: (item: Omit<CartItem, 'qty' | 'key'>) => void;
  setQty: (key: string, qty: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { products, getProduct } = useProducts();
  const [items, dispatch] = useReducer(reducer, undefined, loadCart);
  const [isOpen, setOpen] = useState(false);
  const [isCheckout, setCheckout] = useState(false);

  // Remove cart lines whose product an admin has deleted.
  useEffect(() => {
    dispatch({ type: 'prune', ids: products.map((p) => p.id) });
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable – cart still works in memory */
    }
  }, [items]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((n, i) => n + i.qty, 0);
    const subtotal = items.reduce(
      (sum, i) => sum + (getProduct(i.productId)?.price ?? 0) * i.qty,
      0,
    );
    return {
      items,
      count,
      subtotal,
      isOpen,
      isCheckout,
      openCart: () => setOpen(true),
      closeCart: () => setOpen(false),
      startCheckout: () => {
        setOpen(false);
        setCheckout(true);
      },
      closeCheckout: () => setCheckout(false),
      addItem: (item) => {
        // Don't let the cart hold more of a product than the admin has in stock.
        const left = stockLeft(getProduct(item.productId) ?? {});
        const inCart = items.filter((i) => i.productId === item.productId).reduce((n, i) => n + i.qty, 0);
        if (left !== undefined && inCart >= left) return;
        dispatch({ type: 'add', item });
      },
      setQty: (key, qty) => {
        const line = items.find((i) => i.key === key);
        const left = line ? stockLeft(getProduct(line.productId) ?? {}) : undefined;
        if (line && left !== undefined) {
          const others = items.filter((i) => i.productId === line.productId && i.key !== key).reduce((n, i) => n + i.qty, 0);
          qty = Math.min(qty, left - others);
        }
        dispatch({ type: 'setQty', key, qty });
      },
      removeItem: (key) => dispatch({ type: 'remove', key }),
      clear: () => dispatch({ type: 'clear' }),
    };
  }, [items, isOpen, isCheckout, getProduct]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
