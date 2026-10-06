import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Order, OrderStatus } from '../types';

const KEY = 'arc-orders';

function load(): Order[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as Order[]) : [];
  } catch {
    return [];
  }
}

interface OrdersContextValue {
  orders: Order[];
  addOrder: (o: Order) => void;
  setStatus: (id: string, status: OrderStatus) => void;
  deleteOrder: (id: string) => void;
}

const OrdersContext = createContext<OrdersContextValue | null>(null);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(orders));
    } catch {
      /* ignore */
    }
  }, [orders]);

  const value = useMemo<OrdersContextValue>(
    () => ({
      orders,
      addOrder: (o) =>
        setOrders((prev) => [{ ...o, history: o.history ?? [{ status: o.status, at: o.createdAt }] }, ...prev]),
      setStatus: (id, status) =>
        setOrders((prev) =>
          prev.map((o) =>
            o.id === id
              ? {
                  ...o,
                  status,
                  history:
                    status === o.status
                      ? o.history
                      : [...(o.history ?? [{ status: o.status, at: o.createdAt }]), { status, at: new Date().toISOString() }],
                  payment: {
                    ...o.payment,
                    paid: o.payment.method === 'cod' ? status === 'delivered' : o.payment.paid,
                  },
                }
              : o,
          ),
        ),
      deleteOrder: (id) => setOrders((prev) => prev.filter((o) => o.id !== id)),
    }),
    [orders],
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders(): OrdersContextValue {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error('useOrders must be used inside <OrdersProvider>');
  return ctx;
}
