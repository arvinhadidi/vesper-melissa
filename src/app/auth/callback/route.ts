import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getRequestOrigin } from '@/lib/requestOrigin';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const origin = getRequestOrigin(request);
  const code = searchParams.get('code');
  // Supabase's redirect allowlist can drop ?next=, so fall back to the cookie set by
  // startGoogleSignIn (src/lib/onboarding/googleSignIn.ts).
  const cookieNext = request.cookies.get('vesper_post_auth_next')?.value;
  let decodedCookieNext: string | null = null;
  try {
    decodedCookieNext = cookieNext ? decodeURIComponent(cookieNext) : null;
  } catch {
    decodedCookieNext = null; // malformed cookie: ignore it rather than 500 mid-OAuth
  }
  const next = searchParams.get('next') ?? decodedCookieNext;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // If the user has already completed onboarding, skip back into the onboarding
      // flow entirely. The middleware will handle paywall redirects if the
      // subscription has since lapsed.
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single();

        if (profile?.onboarding_completed) {
          const home = NextResponse.redirect(`${origin}/main`);
          home.cookies.delete('vesper_post_auth_next');
          return home;
        }
      }

      const destination = next && next.startsWith('/') && !next.startsWith('//') ? next : '/main';
      const res = NextResponse.redirect(`${origin}${destination}`);
      res.cookies.delete('vesper_post_auth_next');
      return res;
    }
  }

  return NextResponse.redirect(`${origin}/?error=auth_failed`);
}
