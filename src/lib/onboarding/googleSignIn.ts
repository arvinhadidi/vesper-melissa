'use client';

import { createClient } from '@/lib/supabase/client';
import { saveProgress } from './saveProgress';

export const POST_AUTH_COOKIE = 'vesper_post_auth_next';

/**
 * Google sign-in that reliably returns to `nextPath`. Supabase's redirect allowlist
 * drops our ?next= param, so the destination also rides in a short-lived cookie that
 * /auth/callback reads as a fallback.
 */
export async function startGoogleSignIn(nextPath: string): Promise<void> {
  document.cookie = `${POST_AUTH_COOKIE}=${encodeURIComponent(nextPath)}; Path=/; Max-Age=900; SameSite=Lax`;
  saveProgress({ event: 'signin_started' });
  const supabase = createClient();
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      // Always show the account chooser instead of silently reusing a signed-in account.
      queryParams: { prompt: 'select_account' },
    },
  });
}
