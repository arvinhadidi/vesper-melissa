import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/middleware';

const PROTECTED_PATHS = ['/daily', '/spread', '/journal', '/chat'];

function isProtected(pathname: string) {
  return PROTECTED_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let response = NextResponse.next({ request });

  const supabase = await createClient(request, response);

  // Always refresh session first (required by @supabase/ssr)
  const { data: { user } } = await supabase.auth.getUser();

  // Not logged in — guard protected routes
  if (!user) {
    if (isProtected(pathname)) {
      return NextResponse.redirect(new URL('/signin', request.url));
    }
    return response;
  }

  // Logged in — let / (landing page) through for everyone
  if (pathname === '/') {
    return response;
  }

  // Fetch profile for subscription + onboarding checks
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('onboarding_completed, subscription_status, trial_started_at')
    .eq('id', user.id)
    .single();

  // No profile row yet → treat as new user, send to onboarding
  if (!profile) {
    if (pathname !== '/onboarding' && pathname !== '/personalisation') {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
    return response;
  }

  const { onboarding_completed, subscription_status, trial_started_at } = profile;

  // Onboarding not complete
  if (!onboarding_completed) {
    if (pathname !== '/onboarding' && pathname !== '/personalisation') {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
    return response;
  }

  // Subscription: none → onboarding (allow /personalisation through since it sets the trial)
  if (subscription_status === 'none') {
    if (pathname !== '/onboarding' && pathname !== '/personalisation') {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }
    return response;
  }

  // Subscription: expired or cancelled → paywall
  if (subscription_status === 'expired' || subscription_status === 'cancelled') {
    if (pathname !== '/paywall') {
      return NextResponse.redirect(new URL('/paywall', request.url));
    }
    return response;
  }

  // Subscription: trial → check expiry
  if (subscription_status === 'trial') {
    if (trial_started_at) {
      const trialEnd = new Date(trial_started_at).getTime() + 3 * 24 * 60 * 60 * 1000;
      if (Date.now() > trialEnd) {
        // Expire the trial
        await supabase
          .from('user_profiles')
          .update({ subscription_status: 'expired' })
          .eq('id', user.id);
        if (pathname !== '/paywall') {
          return NextResponse.redirect(new URL('/paywall', request.url));
        }
        return response;
      }
    }
    return response;
  }

  // subscription_status === 'active' — allow through
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
