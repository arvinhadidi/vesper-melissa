// Local-currency pricing. Shared by the client (display) and the server (geo + checkout).
//
// Every amount here must also exist as a `currency_options` entry on the two Stripe
// prices (STRIPE_PRICE_ID_MONTHLY_GBP / _YEARLY_GBP). The geo route only offers a
// currency the live Stripe price can actually charge, so adding a row here is safe:
// it stays dormant (visitor sees GBP) until Stripe has it too.

export type CurrencyCode = 'GBP' | 'USD' | 'EUR' | 'INR';

export type Pricing = {
  symbol: string;
  monthly: number;
  yearly: number;
  savePct: number;
  /** "A single tarot reading can cost …" range, in this currency. */
  readingCost: string;
  /** Whole-unit currencies (INR) are shown without decimals. */
  decimals: 0 | 2;
};

export const LOCAL_PRICING: Record<CurrencyCode, Pricing> = {
  GBP: { symbol: '£', monthly: 9.99, yearly: 79.99, savePct: 33, readingCost: '£25–50', decimals: 2 },
  USD: { symbol: '$', monthly: 12.99, yearly: 103.99, savePct: 33, readingCost: '$30–60', decimals: 2 },
  EUR: { symbol: '€', monthly: 11.99, yearly: 95.99, savePct: 33, readingCost: '€30–55', decimals: 2 },
  // Purchasing-power price for India rather than a straight FX conversion (~₹1,100).
  INR: { symbol: '₹', monthly: 299, yearly: 2499, savePct: 30, readingCost: '₹500–2,000', decimals: 0 },
};

/** Stripe minor-unit amounts for currency_options (pence, cents, paise). */
export function stripeAmount(code: CurrencyCode, plan: 'monthly' | 'yearly'): number {
  return Math.round(LOCAL_PRICING[code][plan] * 100);
}

const EURO_AND_EU = new Set([
  // Eurozone
  'AT', 'BE', 'HR', 'CY', 'EE', 'FI', 'FR', 'DE', 'GR', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PT', 'SK', 'SI', 'ES',
  // Rest of EU + EEA/Balkans that commonly pay in EUR online
  'BG', 'CZ', 'DK', 'HU', 'PL', 'RO', 'SE', 'IS', 'NO', 'AL', 'BA', 'ME', 'MK', 'RS', 'XK', 'MD',
]);

/** Country (ISO-3166 alpha-2) → the currency we would like to show. */
export function currencyForCountry(country: string | null | undefined): CurrencyCode {
  const c = (country ?? '').toUpperCase();
  if (c === 'GB' || c === 'IM' || c === 'JE' || c === 'GG') return 'GBP';
  if (c === 'IN') return 'INR';
  if (EURO_AND_EU.has(c)) return 'EUR';
  if (!c) return 'GBP';
  return 'USD';
}

export function formatPrice(code: CurrencyCode, amount: number): string {
  const p = LOCAL_PRICING[code];
  const n = p.decimals === 0
    ? Math.round(amount).toLocaleString('en-IN')
    : amount.toFixed(2);
  return `${p.symbol}${n}`;
}

export function isCurrencyCode(v: unknown): v is CurrencyCode {
  return typeof v === 'string' && v in LOCAL_PRICING;
}

// Closing offer shown when someone backs out of the paywall: % off the first paid
// month (coupon `STRIPE_COUPON_FIRST_MONTH`, duration "once", applied after the trial).
export const CLOSING_OFFER_PCT = 50;
