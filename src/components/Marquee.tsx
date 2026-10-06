const WORDS = ['It’s ARC', 'It’s ours', 'Caps', 'Tees', 'Bags', 'Est. 2024'];

export default function Marquee() {
  const row = [...WORDS, ...WORDS];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        {[0, 1].map((k) => (
          <ul key={k}>
            {row.map((w, i) => (
              <li key={i}>
                {w}
                <i>a</i>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
