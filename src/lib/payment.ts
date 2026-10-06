export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'unknown';

export const FREE_SHIPPING_OVER = 2500; // pesos, change to suit your shop
export const FLAT_SHIPPING = 150; // pesos

export const shippingFor = (subtotal: number): number =>
  subtotal === 0 || subtotal >= FREE_SHIPPING_OVER ? 0 : FLAT_SHIPPING;

export function detectBrand(digits: string): CardBrand {
  if (/^4/.test(digits)) return 'visa';
  if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(digits)) return 'mastercard';
  if (/^3[47]/.test(digits)) return 'amex';
  return 'unknown';
}

export const brandLabel: Record<CardBrand, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  amex: 'Amex',
  unknown: 'Card',
};

export function formatCardNumber(raw: string): string {
  const all = raw.replace(/\D/g, '');
  const brand = detectBrand(all);
  const digits = all.slice(0, brand === 'amex' ? 15 : 16);
  const groups = brand === 'amex' ? [4, 6, 5] : [4, 4, 4, 4];
  const out: string[] = [];
  let i = 0;
  for (const g of groups) {
    if (i >= digits.length) break;
    out.push(digits.slice(i, i + g));
    i += g;
  }
  return out.join(' ');
}

/** Luhn checksum – catches mistyped card numbers before they reach a payment provider. */
export function luhnValid(digits: string): boolean {
  if (digits.length < 12) return false;
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);
    if (double) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    double = !double;
  }
  return sum % 10 === 0;
}

export function formatExpiry(raw: string): string {
  let d = raw.replace(/\D/g, '').slice(0, 4);
  if (d.length === 1 && d > '1') d = '0' + d;
  return d.length < 3 ? d : `${d.slice(0, 2)}/${d.slice(2)}`;
}

export function expiryError(value: string): string | null {
  const m = /^(\d{2})\/(\d{2})$/.exec(value);
  if (!m) return 'Enter the expiry date as MM/YY';
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return 'Month must be between 01 and 12';
  if (new Date(year, month, 0, 23, 59, 59) < new Date()) return 'This card has expired';
  return null;
}

/** Keeps only digits, with an optional leading + (for +63 numbers). */
const gcashDigits = (raw: string) => raw.replace(/[^\d]/g, '');

/** Accepts 09XXXXXXXXX, 9XXXXXXXXX, 639XXXXXXXXX or +639XXXXXXXXX and returns the 11-digit 09… form. */
export function normalizeGcashNumber(raw: string): string | null {
  const d = gcashDigits(raw);
  if (/^09\d{9}$/.test(d)) return d;
  if (/^639\d{9}$/.test(d)) return `0${d.slice(2)}`;
  if (/^9\d{9}$/.test(d)) return `0${d}`;
  return null;
}

/** Live formatting while typing: 0917 123 4567 */
export function formatGcashNumber(raw: string): string {
  const keepPlus = raw.trim().startsWith('+');
  const d = gcashDigits(raw).slice(0, keepPlus ? 12 : 11);
  if (keepPlus) return `+${d.slice(0, 2)}${d.length > 2 ? ' ' : ''}${d.slice(2, 5)}${d.length > 5 ? ' ' : ''}${d.slice(5, 8)}${d.length > 8 ? ' ' : ''}${d.slice(8)}`.trim();
  const parts = [d.slice(0, 4), d.slice(4, 7), d.slice(7, 11)].filter(Boolean);
  return parts.join(' ');
}
