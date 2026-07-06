import { NextRequest } from 'next/server';

const PRODUCTION_HOSTS = new Set(['vesper.cards', 'www.vesper.cards']);

function isTrustedHost(host: string): boolean {
  // Production domains plus Vercel preview deployments. Anything else
  // (a spoofed header reaching us through a misconfigured proxy) is ignored.
  return PRODUCTION_HOSTS.has(host) || host.endsWith('.vercel.app');
}

/**
 * Public origin of the request, safe behind Vercel's proxy.
 *
 * In production, route handlers can see an internal host in request.url, so
 * redirects built from `new URL(request.url).origin` / `req.nextUrl.origin`
 * can point at localhost. Vercel sets x-forwarded-host to the real public
 * host, so prefer that outside development — but only for hosts we recognise,
 * because this value feeds redirect targets (OAuth callback, Stripe
 * success/cancel/return URLs) and must not become an open redirect.
 */
export function getRequestOrigin(request: NextRequest): string {
  const forwardedHost = request.headers.get('x-forwarded-host');
  if (
    process.env.NODE_ENV !== 'development' &&
    forwardedHost &&
    isTrustedHost(forwardedHost)
  ) {
    return `https://${forwardedHost}`;
  }
  return request.nextUrl.origin;
}
