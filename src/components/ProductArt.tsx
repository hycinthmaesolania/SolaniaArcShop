import type { ProductKind } from '../types';

/** Lighten (amt > 0) or darken (amt < 0) a #rrggbb colour. */
export function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) =>
    Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt);
  return `rgb(${f((n >> 16) & 255)} ${f((n >> 8) & 255)} ${f(n & 255)})`;
}

interface Props {
  kind: ProductKind;
  color: string;
  label: string;
  className?: string;
}

/** Hand-drawn SVG stand-ins for product photos. Swap for <img> when you have real photos. */
export default function ProductArt({ kind, color, label, className }: Props) {
  const dark = shade(color, -0.28);
  const light = shade(color, 0.3);
  const tint = shade(color, 0.82);

  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={label}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="200" height="200" fill={tint} />
      <ellipse cx="100" cy="182" rx="56" ry="6" fill="rgb(0 0 0 / 0.1)" />
      {kind === 'cap' && (
        <g>
          <path d="M42 120C42 68 72 40 100 40s58 28 58 80Z" fill={color} />
          <path d="M100 40v80M72 46c-8 22-10 46-8 74M128 46c8 22 10 46 8 74" stroke={dark} strokeWidth="2" fill="none" opacity=".5" />
          <path d="M30 120q70-24 140 0c6 22-12 28-70 28S24 142 30 120Z" fill={dark} />
          <circle cx="100" cy="41" r="5" fill={light} />
          <rect x="84" y="94" width="32" height="14" rx="3" fill={light} opacity=".85" />
        </g>
      )}
      {kind === 'tee' && (
        <g>
          <path d="M68 38 36 62l16 32 20-10v82h56V84l20 10 16-32-32-24q-32 20-64 0Z" fill={color} />
          <path d="M68 38q32 24 64 0" stroke={dark} strokeWidth="5" fill="none" />
          <rect x="106" y="92" width="22" height="24" rx="2" fill="none" stroke={dark} strokeWidth="2" opacity=".6" />
          <circle cx="86" cy="104" r="8" fill={light} />
        </g>
      )}
      {kind === 'hoodie' && (
        <g>
          <path d="M66 50 30 86l8 70 22-2 6-52v70h68v-70l6 52 22 2 8-70-36-36q-34 18-68 0Z" fill={color} />
          <path d="M66 50q34-38 68 0-34 30-68 0Z" fill={dark} />
          <path d="M82 134h36l8 28H74Z" fill={dark} opacity=".7" />
          <path d="M92 74v22M108 74v22" stroke={light} strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
      {kind === 'tote' && (
        <g>
          <path d="M72 82C72 24 128 24 128 82" stroke={dark} strokeWidth="7" fill="none" strokeLinecap="round" />
          <rect x="46" y="78" width="108" height="98" rx="4" fill={color} />
          <path d="M46 78h108" stroke={dark} strokeWidth="3" />
          <circle cx="100" cy="124" r="22" fill="none" stroke={dark} strokeWidth="3" />
          <path d="M90 128l8-14 12 20" stroke={dark} strokeWidth="3" fill="none" strokeLinejoin="round" />
        </g>
      )}
      {kind === 'backpack' && (
        <g>
          <path d="M82 52c0-22 36-22 36 0" stroke={dark} strokeWidth="6" fill="none" />
          <rect x="54" y="48" width="92" height="128" rx="34" fill={color} />
          <rect x="70" y="112" width="60" height="46" rx="10" fill={dark} />
          <path d="M70 126h60" stroke={light} strokeWidth="3" />
          <rect x="74" y="66" width="52" height="30" rx="8" fill="none" stroke={dark} strokeWidth="3" />
        </g>
      )}
      {kind === 'bottle' && (
        <g>
          <rect x="84" y="24" width="32" height="20" rx="5" fill={dark} />
          <path d="M88 44h24v10q22 8 22 30v70q0 20-20 20H86q-20 0-20-20V84q0-22 22-30Z" fill={color} />
          <rect x="66" y="96" width="68" height="34" fill={dark} opacity=".85" />
          <path d="M80 62v96" stroke={light} strokeWidth="4" strokeLinecap="round" opacity=".6" />
        </g>
      )}
      {kind === 'socks' && (
        <g>
          <path d="M72 28h44v78l30 24c10 10 6 30-14 32-12 2-22-4-30-12L72 118Z" fill={color} />
          <rect x="72" y="28" width="44" height="14" fill={dark} />
          <path d="M72 58h44M72 74h44" stroke={light} strokeWidth="6" />
          <path d="M130 148c8 4 12 12 8 18" stroke={dark} strokeWidth="6" fill="none" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}
