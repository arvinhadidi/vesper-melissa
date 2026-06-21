import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';

const AUTH_REQUIRED_PATHS = ['/daily', '/spread', '/journal', '/chat', '/main', '/account'];
const SUBSCRIPTION_REQUIRED_PATHS = ['/daily', '/spread', '/chat', '/main'];

function requiresAuth(pathname: string) {
  return AUTH_REQUIRED_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'));
}

function requiresSubscription(pathname: string) {
  return SUBSCRIPTION_REQUIRED_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'));
}

// Renamed from `middleware` → `proxy`: Next 16 deprecated the middleware.ts file convention
// in favour of proxy.ts (same Edge request-interception API, identical signature + config).
// The Supabase SSR helper at @/lib/supabase/middleware is a separate lib file and keeps its name.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const response = NextResponse.next({ request });

  const supabase = await createClient(request, response);

  // Always refresh session first (required by @supabase/ssr)
  const { data: { user } } = await supabase.auth.getUser();

  // Not logged in — guard auth-required routes
  if (!user) {
    if (requiresAuth(pathname)) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return response;
  }

  // Only run profile/subscription checks on subscription-required routes
  if (!requiresSubscription(pathname)) {
    return response;
  }

  // Fetch profile for subscription + onboarding checks
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('onboarding_completed, subscription_status')
    .eq('id', user.id)
    .single();

  // No profile row yet → send to onboarding
  if (!profile) {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  const { onboarding_completed, subscription_status } = profile;

  // Onboarding not complete → send to onboarding
  if (!onboarding_completed) {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  // Never subscribed → back to the onboarding paywall (trial still on offer)
  if (subscription_status === 'none') {
    return NextResponse.redirect(new URL('/onboarding/paywall', request.url));
  }

  // Subscription expired or cancelled → standalone paywall (no trial, immediate charge)
  if (subscription_status === 'expired' || subscription_status === 'cancelled') {
    return NextResponse.redirect(new URL('/paywall', request.url));
  }

  // subscription_status === 'active' — allow through (covers both trial and paid via Stripe)
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
