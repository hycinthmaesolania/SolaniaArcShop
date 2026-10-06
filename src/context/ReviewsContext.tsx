import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Review } from '../types';

const KEY = 'arc-reviews';

function isReview(v: unknown): v is Review {
  if (typeof v !== 'object' || v === null) return false;
  const r = v as Record<string, unknown>;
  return (
    typeof r.id === 'string' &&
    typeof r.productId === 'string' &&
    typeof r.orderId === 'string' &&
    typeof r.name === 'string' &&
    typeof r.rating === 'number' &&
    typeof r.text === 'string' &&
    typeof r.createdAt === 'string'
  );
}

function load(): Review[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter(isReview) : [];
  } catch {
    return [];
  }
}

interface ReviewsContextValue {
  reviews: Review[];
  forProduct: (productId: string) => Review[];
  addReview: (r: Omit<Review, 'id' | 'createdAt'>) => void;
  deleteReview: (id: string) => void;
}

const ReviewsContext = createContext<ReviewsContextValue | null>(null);

export function ReviewsProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(reviews));
    } catch {
      /* ignore */
    }
  }, [reviews]);

  const value = useMemo<ReviewsContextValue>(
    () => ({
      reviews,
      forProduct: (productId) => reviews.filter((r) => r.productId === productId),
      addReview: (r) =>
        setReviews((prev) => [
          { ...r, id: `rv-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`, createdAt: new Date().toISOString() },
          ...prev,
        ]),
      deleteReview: (id) => setReviews((prev) => prev.filter((r) => r.id !== id)),
    }),
    [reviews],
  );

  return <ReviewsContext.Provider value={value}>{children}</ReviewsContext.Provider>;
}

export function useReviews(): ReviewsContextValue {
  const ctx = useContext(ReviewsContext);
  if (!ctx) throw new Error('useReviews must be used inside <ReviewsProvider>');
  return ctx;
}
