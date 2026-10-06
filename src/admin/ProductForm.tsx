import { useState, type ChangeEvent, type FormEvent } from 'react';
import type { Category, ColorOption, Product, ProductKind } from '../types';
import { categories, formatPrice } from '../data/products';
import { fileToDataUrl } from '../lib/image';
import { colorPhotos } from '../lib/photos';
import { CAP_PANELS } from '../lib/options';
import ProductVisual from '../components/ProductVisual';

const kindsByCategory: Record<Category, { kind: ProductKind; label: string }[]> = {
  caps: [{ kind: 'cap', label: 'Cap' }],
  shirts: [
    { kind: 'tee', label: 'T-shirt' },
    { kind: 'hoodie', label: 'Hoodie' },
  ],
  bags: [
    { kind: 'tote', label: 'Tote bag' },
    { kind: 'backpack', label: 'Backpack' },
  ],
  extras: [
    { kind: 'bottle', label: 'Bottle' },
    { kind: 'socks', label: 'Socks' },
  ],
};

const MAX_SAMPLES = 8;

const CLOTHING_SIZES = ['S', 'M', 'L', 'XL'];
type SizeMode = 'none' | 'clothing' | 'panels' | 'custom';

function initialSizes(p?: Product): { mode: SizeMode; custom: string } {
  if (!p?.sizes?.length) return { mode: 'none', custom: '' };
  if (p.sizes.join(',') === CLOTHING_SIZES.join(',')) return { mode: 'clothing', custom: '' };
  if (p.sizes.join(',') === CAP_PANELS.join(',')) return { mode: 'panels', custom: '' };
  return { mode: 'custom', custom: p.sizes.join(', ') };
}

const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30) || 'product';

interface Props {
  initial?: Product;
  onSave: (p: Product) => void;
  onCancel: () => void;
}

export default function ProductForm({ initial, onSave, onCancel }: Props) {
  const startSizes = initialSizes(initial);
  const [name, setName] = useState(initial?.name ?? '');
  const [category, setCategory] = useState<Category>(initial?.category ?? 'caps');
  const [kind, setKind] = useState<ProductKind>(initial?.kind ?? 'cap');
  const [price, setPrice] = useState(initial ? String(initial.price) : '');
  const [compareAt, setCompareAt] = useState(initial?.compareAtPrice ? String(initial.compareAtPrice) : '');
  const [reviews, setReviews] = useState(initial?.reviews !== undefined ? String(initial.reviews) : '');
  const [stock, setStock] = useState(initial?.stock !== undefined ? String(initial.stock) : '');
  const [blurb, setBlurb] = useState(initial?.blurb ?? '');
  // Old single colour photos are folded into the sample list so there is only one place to manage them.
  const [colors, setColors] = useState<ColorOption[]>(
    initial?.colors.map((c) => ({ name: c.name, hex: c.hex, images: colorPhotos(c) })) ?? [{ name: 'Ink', hex: '#13233f' }],
  );
  const [sizeMode, setSizeMode] = useState<SizeMode>(initial ? startSizes.mode : 'panels');
  const [customSizes, setCustomSizes] = useState(startSizes.custom);
  const [image, setImage] = useState<string | undefined>(initial?.image);
  const [imageError, setImageError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewColor, setPreviewColor] = useState(0);

  const changeCategory = (c: Category) => {
    setCategory(c);
    if (!kindsByCategory[c].some((k) => k.kind === kind)) setKind(kindsByCategory[c][0].kind);
    if (!initial) setSizeMode(c === 'shirts' ? 'clothing' : c === 'caps' ? 'panels' : 'none');
  };

  const sizes =
    sizeMode === 'clothing'
      ? CLOTHING_SIZES
      : sizeMode === 'panels'
        ? CAP_PANELS
        : sizeMode === 'custom'
        ? customSizes.split(',').map((s) => s.trim()).filter(Boolean)
        : undefined;

  const setColor = (i: number, patch: Partial<ColorOption>) =>
    setColors((cs) => cs.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImageError('Choose an image file (JPG, PNG or WebP).');
      return;
    }
    try {
      setImage(await fileToDataUrl(file));
      setImageError('');
    } catch {
      setImageError('That image couldn’t be read. Try another file.');
    }
  };

  /** Adds one or more sample photos to a colour (several files can be picked at once). */
  const onColorSamples = async (i: number, e: ChangeEvent<HTMLInputElement>) => {
    const files: File[] = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (!files.length) return;
    const images = files.filter((f) => f.type.startsWith('image/'));
    if (images.length < files.length) setImageError('Some files were skipped: choose image files (JPG, PNG or WebP).');
    else setImageError('');
    const room = MAX_SAMPLES - (colors[i]?.images?.length ?? 0);
    if (images.length > room) setImageError(`Only ${MAX_SAMPLES} sample photos per colour. Extra files were skipped.`);
    try {
      const urls = await Promise.all(images.slice(0, Math.max(room, 0)).map((f) => fileToDataUrl(f)));
      if (!urls.length) return;
      setColors((cs) => cs.map((c, idx) => (idx === i ? { ...c, images: [...(c.images ?? []), ...urls] } : c)));
      setPreviewColor(i);
    } catch {
      setImageError('One of those images couldn’t be read. Try another file.');
    }
  };

  const removeSample = (i: number, n: number) =>
    setColors((cs) =>
      cs.map((c, idx) => {
        if (idx !== i) return c;
        const next = (c.images ?? []).filter((_, k) => k !== n);
        return { ...c, images: next.length ? next : undefined };
      }),
    );

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    const priceNum = Number(price);
    if (!name.trim()) err.name = 'Enter a product name';
    if (!price || !Number.isFinite(priceNum) || priceNum <= 0) err.price = 'Enter a price above 0';
    else if (priceNum > 1000000) err.price = 'Price must be 1,000,000 or less';
    const compareNum = compareAt.trim() === '' ? undefined : Number(compareAt);
    if (compareNum !== undefined && (!Number.isFinite(compareNum) || compareNum <= priceNum)) err.compareAt = 'Original price must be higher than the price';
    const reviewsNum = reviews.trim() === '' ? undefined : Number(reviews);
    if (reviewsNum !== undefined && (!Number.isInteger(reviewsNum) || reviewsNum < 0)) err.reviews = 'Enter a whole number, 0 or more';
    const stockNum = stock.trim() === '' ? undefined : Number(stock);
    if (stockNum !== undefined && (!Number.isInteger(stockNum) || stockNum < 0 || stockNum > 100000)) err.stock = 'Enter a whole number, 0 or more';
    if (!blurb.trim()) err.blurb = 'Add a short description';
    const names = colors.map((c) => c.name.trim().toLowerCase());
    if (names.some((n) => !n)) err.colors = 'Give every colour a name';
    else if (new Set(names).size !== names.length) err.colors = 'Colour names must be different';
    if (sizeMode === 'custom' && (!sizes || sizes.length === 0)) err.sizes = 'Enter at least one size, separated by commas';
    setErrors(err);
    if (Object.keys(err).length) return;

    onSave({
      id: initial?.id ?? `${slug(name)}-${Date.now().toString(36)}`,
      name: name.trim(),
      kind,
      category,
      price: Math.round(priceNum * 100) / 100,
      blurb: blurb.trim(),
      colors: colors.map((c) => ({
        name: c.name.trim(),
        hex: c.hex,
        images: c.images?.length ? c.images : undefined,
      })),
      sizes: sizes && sizes.length ? sizes : undefined,
      image,
      gallery: initial?.gallery,
      badge: initial?.badge,
      compareAtPrice: compareNum,
      reviews: reviewsNum,
      stock: stockNum,
    });
  };

  const draft: Product = {
    id: 'preview',
    name: name.trim() || 'Product name',
    kind,
    category,
    price: Number(price) || 0,
    blurb,
    colors: colors.length ? colors : [{ name: 'Ink', hex: '#13233f' }],
    image,
  };
  const activeColor = draft.colors[Math.min(previewColor, draft.colors.length - 1)];

  return (
    <form className="pform" onSubmit={submit} noValidate>
      <div className="pform__fields">
        <h2>{initial ? `Edit ${initial.name}` : 'Add a product'}</h2>

        <div className="field">
          <label htmlFor="pf-name">Name</label>
          <input id="pf-name" className="input" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} />
          {errors.name && <p className="field__error" role="alert">{errors.name}</p>}
        </div>

        <div className="grid2">
          <div className="field">
            <label htmlFor="pf-cat">Category</label>
            <select id="pf-cat" className="input" value={category} onChange={(e) => changeCategory(e.target.value as Category)}>
              {categories.filter((c) => c.id !== 'all').map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="pf-price">Price (₱)</label>
            <input id="pf-price" className="input" inputMode="decimal" placeholder="1250" value={price} onChange={(e) => setPrice(e.target.value)} aria-invalid={!!errors.price} />
            {errors.price && <p className="field__error" role="alert">{errors.price}</p>}
          </div>
        </div>

        <div className="grid2">
          <div className="field">
            <label htmlFor="pf-was">Original price (₱), optional</label>
            <input id="pf-was" className="input" inputMode="decimal" placeholder="1500" value={compareAt} onChange={(e) => setCompareAt(e.target.value)} aria-invalid={!!errors.compareAt} />
            <p className="hint">Shows struck through, with a “Save” amount.</p>
            {errors.compareAt && <p className="field__error" role="alert">{errors.compareAt}</p>}
          </div>
          <div className="field">
            <label htmlFor="pf-reviews">Reviews, optional</label>
            <input id="pf-reviews" className="input" inputMode="numeric" placeholder="34" value={reviews} onChange={(e) => setReviews(e.target.value)} aria-invalid={!!errors.reviews} />
            {errors.reviews && <p className="field__error" role="alert">{errors.reviews}</p>}
          </div>
        </div>

        <div className="field">
          <label htmlFor="pf-stock">Stock, optional</label>
          <input id="pf-stock" className="input" inputMode="numeric" placeholder="20" value={stock} onChange={(e) => setStock(e.target.value)} aria-invalid={!!errors.stock} />
          <p className="hint">How many you have. Set 0 to show “Sold out”. It goes down by itself when someone orders. Leave empty to not track stock.</p>
          {errors.stock && <p className="field__error" role="alert">{errors.stock}</p>}
        </div>

        <div className="field">
          <label htmlFor="pf-blurb">Description</label>
          <textarea id="pf-blurb" className="input" rows={3} value={blurb} onChange={(e) => setBlurb(e.target.value)} aria-invalid={!!errors.blurb} />
          {errors.blurb && <p className="field__error" role="alert">{errors.blurb}</p>}
        </div>

        <fieldset className="opt">
          <legend>Main photo</legend>
          <div className="upload">
            <label className="btn btn--line" htmlFor="pf-file">{image ? 'Replace photo' : 'Upload photo'}</label>
            <input id="pf-file" type="file" accept="image/*" className="sr-only" onChange={onFile} />
            {image && (
              <button type="button" className="link-btn" onClick={() => setImage(undefined)}>
                Remove photo
              </button>
            )}
          </div>
          <p className="hint">Optional. This is the cover photo on the shop page only. Buyers don’t see it again after clicking the product; they see the sample photos you add under Colours. With no photos at all, the shop draws an illustration.</p>
          {imageError && <p className="field__error" role="alert">{imageError}</p>}
          {!image && (
            <div className="field">
              <label htmlFor="pf-kind">Illustration</label>
              <select id="pf-kind" className="input" value={kind} onChange={(e) => setKind(e.target.value as ProductKind)}>
                {kindsByCategory[category].map((k) => (
                  <option key={k.kind} value={k.kind}>{k.label}</option>
                ))}
              </select>
            </div>
          )}
        </fieldset>

        <fieldset className="opt">
          <legend>Colours</legend>
          {colors.map((c, i) => (
            <div className="colorrow" key={i}>
              <input type="color" aria-label={`Colour ${i + 1} swatch`} value={c.hex} onChange={(e) => { setColor(i, { hex: e.target.value }); setPreviewColor(i); }} />
              <input className="input" aria-label={`Colour ${i + 1} name`} placeholder="Colour name" value={c.name} onChange={(e) => setColor(i, { name: e.target.value })} />
              <button type="button" className="link-btn" disabled={colors.length === 1} onClick={() => { setColors((cs) => cs.filter((_, idx) => idx !== i)); setPreviewColor(0); }}>
                Remove
              </button>
              <div className="colorrow__samples">
                <span className="colorrow__samples-label">
                  Sample photos{c.images?.length ? ` (${c.images.length}/${MAX_SAMPLES})` : ''}
                </span>
                <ul className="samples">
                  {(c.images ?? []).map((src, n) => (
                    <li key={`${n}-${src.length}`} className="sample">
                      <img src={src} alt={`${c.name || `Colour ${i + 1}`} sample ${n + 1}`} />
                      <button type="button" className="sample__x" aria-label={`Remove sample photo ${n + 1} for ${c.name || `colour ${i + 1}`}`} onClick={() => removeSample(i, n)}>
                        ✕
                      </button>
                    </li>
                  ))}
                  {(c.images?.length ?? 0) < MAX_SAMPLES && (
                    <li>
                      <label className="sample sample--add" htmlFor={`pf-sfile-${i}`}>
                        <span aria-hidden="true">+</span>
                        <span className="sr-only">Add sample photos for {c.name || `colour ${i + 1}`}</span>
                      </label>
                      <input id={`pf-sfile-${i}`} type="file" accept="image/*" multiple className="sr-only" onChange={(e) => onColorSamples(i, e)} />
                    </li>
                  )}
                </ul>
              </div>
            </div>
          ))}
          {errors.colors && <p className="field__error" role="alert">{errors.colors}</p>}
          <button type="button" className="btn btn--line btn--small" disabled={colors.length >= 8} onClick={() => { setColors((cs) => [...cs, { name: '', hex: '#7fb2d9' }]); setPreviewColor(colors.length); }}>
            Add colour
          </button>
        </fieldset>

        <fieldset className="opt">
          <legend>Sizes / panel options</legend>
          <div className="opt__row">
            {([['none', 'One size'], ['panels', '5 Panel / 6 Panel'], ['clothing', 'S, M, L, XL'], ['custom', 'Custom']] as [SizeMode, string][]).map(([m, label]) => (
              <button key={m} type="button" className="size" aria-pressed={sizeMode === m} onClick={() => setSizeMode(m)}>
                {label}
              </button>
            ))}
          </div>
          {sizeMode === 'custom' && (
            <div className="field">
              <label htmlFor="pf-sizes">Sizes, separated by commas</label>
              <input id="pf-sizes" className="input" placeholder="e.g. 38, 40, 42" value={customSizes} onChange={(e) => setCustomSizes(e.target.value)} aria-invalid={!!errors.sizes} />
              {errors.sizes && <p className="field__error" role="alert">{errors.sizes}</p>}
            </div>
          )}
        </fieldset>

        <div className="pform__actions">
          <button type="submit" className="btn btn--ink">{initial ? 'Save changes' : 'Add product'}</button>
          <button type="button" className="btn btn--line" onClick={onCancel}>Cancel</button>
        </div>
      </div>

      <aside className="pform__preview" aria-label="Live preview">
        <p className="hint">Live preview</p>
        <div className="preview">
          <ProductVisual className="card__art" product={draft} colorName={activeColor.name} />
          <div className="card__meta">
            <span className="card__name">{draft.name}</span>
            <span className="card__price">{formatPrice(draft.price)}</span>
          </div>
          <div className="card__swatches">
            {draft.colors.map((c, i) => (
              <button key={i} type="button" className="swatch swatch--sm" style={{ background: c.hex }} aria-label={c.name || `Colour ${i + 1}`} aria-pressed={i === previewColor} onClick={() => setPreviewColor(i)} />
            ))}
          </div>
        </div>
      </aside>
    </form>
  );
}
