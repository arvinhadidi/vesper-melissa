import { NextRequest } from 'next/server';
import { geoFromHeaders, resolveCurrency } from '@/lib/geo';

// GET /api/geo → { country, currency }. Replaces the third-party ipapi.co lookup
// (rate-limited and often ad-blocked) with Vercel's own edge geo header.
export async function GET(req: NextRequest) {
  const geo = geoFromHeaders(req.headers);
  const currency = await resolveCurrency(geo.country, req.nextUrl.searchParams.get('currency'));
  // closingOffer: whether the paywall exit offer can be checked out (coupon configured).
  // Always on outside production so the sheet can be previewed locally.
  const closingOffer = Boolean(process.env.STRIPE_COUPON_FIRST_MONTH) || process.env.NODE_ENV !== 'production';
  return Response.json({ country: geo.country, currency, closingOffer }, { headers: { 'Cache-Control': 'private, no-store' } });
}
