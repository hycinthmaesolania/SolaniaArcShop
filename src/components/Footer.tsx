import { categories } from '../data/products';
import { useProducts } from '../context/ProductsContext';
import Contact from './Contact';

export default function Footer({ onSelect, onTrack }: { onSelect: (id: string) => void; onTrack: () => void }) {
  const { products } = useProducts();
  return (
    <footer className="footer">
      <section id="about" className="about" data-reveal>
        <p className="eyebrow">About</p>
        <h2>Caps and everyday goods, made to be ours.</h2>
        <p>It’s ARC. It’s ours. Established 2024.</p>
      </section>
      <Contact />
      <div className="footer__row">
        <div className="footer__brand">
          <span className="nav__mark" aria-hidden="true">a</span>
          <span>ARC</span>
        </div>
        <nav aria-label="Footer" className="footer__links">
          {categories
            .filter((c) => c.id === 'all' || products.some((p) => p.category === c.id))
            .map((c) => (
            <a
              key={c.id}
              href={`#${c.id === 'all' ? 'shop' : c.id}`}
              onClick={(e) => {
                e.preventDefault();
                onSelect(c.id === 'all' ? 'shop' : c.id);
              }}
            >
              {c.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={(e) => {
              e.preventDefault();
              onSelect('contact');
            }}
          >
            Contact
          </a>
          <a
            href="#track"
            onClick={(e) => {
              e.preventDefault();
              onTrack();
            }}
          >
            Track order
          </a>
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              onSelect('top');
            }}
          >
            Back to top ↑
          </a>
        </nav>
      </div>
      <p className="footer__legal">© {new Date().getFullYear()} ARC. Demo store, no real orders.</p>
    </footer>
  );
}
