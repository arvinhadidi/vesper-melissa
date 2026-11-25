import Stripe from 'stripe';

// fetch HTTP client: Cloudflare Workers have no Node http module. Same behaviour on Vercel.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
  httpClient: Stripe.createFetchHttpClient(),
});
