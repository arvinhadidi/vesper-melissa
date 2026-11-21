import { stripe } from '@/lib/stripe';
import { LOCAL_PRICING, type CurrencyCode } from '@/lib/onboarding/pricing';

// Which local currencies the live Stripe prices can actually charge. A currency is
// only offered on the paywall once BOTH the monthly and yearly price carry a
// matching `currency_options` entry, so the price a visitor sees is always the
// price Stripe Checkout charges. Cached per server instance for 10 minutes.
let cache: { at: number; codes: Set<CurrencyCode> } | null = null;
const TTL_MS = 10 * 60 * 1000;

export async function getChargeableCurrencies(): Promise<Set<CurrencyCode>> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.codes;
  const codes = new Set<CurrencyCode>(['GBP']);
  const ids = [process.env.STRIPE_PRICE_ID_MONTHLY_GBP, process.env.STRIPE_PRICE_ID_YEARLY_GBP];
  try {
    const prices = await Promise.all(ids.map(id => (id ? stripe.prices.retrieve(id, { expand: ['currency_options'] }) : null)));
    for (const code of Object.keys(LOCAL_PRICING) as CurrencyCode[]) {
      if (code === 'GBP') continue;
      const key = code.toLowerCase();
      if (prices.every(p => p?.currency_options && key in p.currency_options)) codes.add(code);
    }
  } catch (err) {
    console.error('[stripeCurrencies] price lookup failed, falling back to GBP only', err);
  }
  cache = { at: Date.now(), codes };
  return codes;
}
