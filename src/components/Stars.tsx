/** Read-only star rating, e.g. <Stars value={4.3} /> shows 4 filled stars. */
export default function Stars({ value, className = '' }: { value: number; className?: string }) {
  const filled = Math.round(value);
  return (
    <span className={`stars ${className}`} role="img" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className={i < filled ? 'is-on' : ''} aria-hidden="true">★</span>
      ))}
    </span>
  );
}
