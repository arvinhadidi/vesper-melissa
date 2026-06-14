import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Middleware will redirect to /onboarding if profile not yet set up.
      // The localStorage migration (vesper_onboarding) is handled client-side
      // in the onboarding page's useEffect, since the server cannot access localStorage.
      return NextResponse.redirect(`${origin}/daily`);
    }
  }

  return NextResponse.redirect(`${origin}/signin?error=auth_failed`);
}
