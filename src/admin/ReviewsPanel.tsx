import { useState } from 'react';
import { useReviews } from '../context/ReviewsContext';
import { useProducts } from '../context/ProductsContext';
import Stars from '../components/Stars';

export default function ReviewsPanel() {
  const { reviews, deleteReview } = useReviews();
  const { getProduct } = useProducts();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  if (reviews.length === 0) {
    return (
      <div className="empty">
        <h3>No reviews yet</h3>
        <p>Reviews from buyers appear here. You can delete any you don’t want shown.</p>
      </div>
    );
  }

  return (
    <ul className="orders">
      {reviews.map((r) => (
        <li key={r.id} className="order rvrow">
          <div className="rvrow__main">
            <p className="rvrow__top">
              <Stars value={r.rating} />
              <strong>{getProduct(r.productId)?.name ?? r.productId}</strong>
            </p>
            <p>{r.text}</p>
            <p className="hint">
              {r.name} · order {r.orderId} · {new Date(r.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="rvrow__actions">
            {confirmId === r.id ? (
              <>
                <button type="button" className="btn btn--danger btn--small" onClick={() => { deleteReview(r.id); setConfirmId(null); }}>Delete</button>
                <button type="button" className="btn btn--line btn--small" onClick={() => setConfirmId(null)}>Cancel</button>
              </>
            ) : (
              <button type="button" className="link-btn" onClick={() => setConfirmId(r.id)}>Delete</button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
