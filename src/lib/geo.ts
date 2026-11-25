import { currencyForCountry, isCurrencyCode, type CurrencyCode } from '@/lib/onboarding/pricing';
import { getChargeableCurrencies } from '@/lib/stripeCurrencies';

export type Geo = { country: string | null; region: string | null; city: string | null };

/** Geo headers: Vercel's x-vercel-ip-*, or Cloudflare's cf-ipcountry (country only). Absent in local dev. */
export function geoFromHeaders(h: Headers): Geo {
  const dec = (v: string | null) => {
    if (!v) return null;
    try { return decodeURIComponent(v); } catch { return v; }
  };
  return {
    country: h.get('x-vercel-ip-country') ?? (h.get('cf-ipcountry') && h.get('cf-ipcountry') !== 'XX' ? h.get('cf-ipcountry') : null),
    region: dec(h.get('x-vercel-ip-country-region')),
    city: dec(h.get('x-vercel-ip-city')),
  };
}

/**
 * The currency to show (and charge) this visitor: their local one if Stripe can
 * charge it, otherwise GBP. `previewCurrency` (?currency=EUR) is honoured only
 * outside production so the local paywall can be checked in every currency.
 */
export async function resolveCurrency(country: string | null, previewCurrency?: string | null): Promise<CurrencyCode> {
  if (process.env.NODE_ENV !== 'production' && isCurrencyCode(previewCurrency)) return previewCurrency;
  const wanted = currencyForCountry(country);
  if (wanted === 'GBP') return 'GBP';
  const chargeable = await getChargeableCurrencies();
  return chargeable.has(wanted) ? wanted : 'GBP';
}
