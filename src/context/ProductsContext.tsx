import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Product } from '../types';
import { defaultProducts } from '../data/products';
import { CAP_PANELS } from '../lib/options';

const KEY = 'arc-products';
const NEW_IDS = ['arc-glory', 'arc-royals', 'arc-runner', 'arc-tonal-tee'];

function isProduct(v: unknown): v is Product {
  if (typeof v !== 'object' || v === null) return false;
  const p = v as Record<string, unknown>;
  return (
    typeof p.id === 'string' &&
    typeof p.name === 'string' &&
    typeof p.price === 'number' &&
    typeof p.kind === 'string' &&
    typeof p.category === 'string' &&
    Array.isArray(p.colors) &&
    p.colors.length > 0
  );
}

const SEEN_KEY = 'arc-seen-defaults';

/**
 * Visitors who already have a saved catalogue still get newly shipped starter products once.
 * Products an admin deleted are remembered in SEEN_KEY, so they never come back.
 */
function load(): Product[] {
  return withCapPanels(loadRaw());
}

/** One-time: caps saved before the 5 / 6 panel choice existed get it, so every cap offers both. */
function withCapPanels(list: Product[]): Product[] {
  try {
    if (localStorage.getItem('arc-cap-panels') === '1') return list;
    localStorage.setItem('arc-cap-panels', '1');
  } catch {
    /* ignore */
  }
  return list.map((p) => (p.kind === 'cap' && !p.sizes?.length ? { ...p, sizes: CAP_PANELS } : p));
}

function loadRaw(): Product[] {
  const allIds = defaultProducts.map((p) => p.id);
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === null) {
      localStorage.setItem(SEEN_KEY, JSON.stringify(allIds));
      return defaultProducts;
    }
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const saved = parsed.filter(isProduct);
      const seenRaw = localStorage.getItem(SEEN_KEY);
      // First run after this feature shipped: treat the old six caps and basics as already seen.
      const seen: string[] = seenRaw
        ? (JSON.parse(seenRaw) as string[])
        : allIds.filter((id) => !NEW_IDS.includes(id));
      const fresh = defaultProducts.filter((p) => !seen.includes(p.id) && !saved.some((s) => s.id === p.id));
      localStorage.setItem(SEEN_KEY, JSON.stringify(allIds));
      return [...fresh, ...saved];
    }
  } catch {
    /* fall through to defaults */
  }
  return defaultProducts;
}

interface ProductsContextValue {
  products: Product[];
  getProduct: (id: string) => Product | undefined;
  addProduct: (p: Product) => void;
  updateProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  resetProducts: () => void;
  /** Lower the stock of tracked products after an order. */
  reduceStock: (lines: { productId: string; qty: number }[]) => void;
  /** True when the browser refused to save (usually storage full because of large photos). */
  saveError: boolean;
}

const ProductsContext = createContext<ProductsContextValue | null>(null);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(load);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(products));
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
  }, [products]);

  const getProduct = useCallback((id: string) => products.find((p) => p.id === id), [products]);

  const value = useMemo<ProductsContextValue>(
    () => ({
      products,
      getProduct,
      saveError,
      addProduct: (p) => setProducts((prev) => [p, ...prev]),
      updateProduct: (p) => setProducts((prev) => prev.map((x) => (x.id === p.id ? p : x))),
      deleteProduct: (id) => setProducts((prev) => prev.filter((x) => x.id !== id)),
      resetProducts: () => setProducts(defaultProducts),
      reduceStock: (lines) =>
        setProducts((prev) =>
          prev.map((p) => {
            if (p.stock === undefined) return p;
            const sold = lines.filter((l) => l.productId === p.id).reduce((n, l) => n + l.qty, 0);
            return sold ? { ...p, stock: Math.max(0, p.stock - sold) } : p;
          }),
        ),
    }),
    [products, getProduct, saveError],
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts(): ProductsContextValue {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used inside <ProductsProvider>');
  return ctx;
}
