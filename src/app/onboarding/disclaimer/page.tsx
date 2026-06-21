'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingData } from '@/lib/onboarding/useOnboardingData';
import { createClient } from '@/lib/supabase/client';
import { PrimaryButton } from '@/components/onboarding/PrimaryButton';

export default function DisclaimerPage() {
  const router = useRouter();
  const { data, persist } = useOnboardingData();
  const [expanded, setExpanded] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  async function handleAccept() {
    // Without this guard, a double-click (easy to do during the brief delay before
    // the browser actually navigates to Google) fires signInWithOAuth twice, which
    // can restart the flow and re-show the account picker right after the user
    // already chose one. Mirrors the same guard in LandingNav's handleSignIn.
    if (signingIn) return;
    setSigningIn(true);
    const updated = { ...data, disclaimer_accepted_at: new Date().toISOString() };
    persist(updated);

    // Supabase's redirect-URL allowlist drops the custom ?next= query param even
    // with a wildcard match (it only preserves its own code/error/state params), so
    // a user who lands back here already authenticated (e.g. bounced through
    // /main -> middleware -> /onboarding because `next` got lost) would otherwise
    // re-trigger Google sign-in needlessly. Check auth state first and skip
    // straight to the next step if already signed in.
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      router.push('/onboarding/name');
      return;
    }

    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/onboarding/name`,
        // Always show the Google account chooser — otherwise, if one Google account is
        // already signed in with prior consent, Google silently reuses it and skips the picker.
        queryParams: { prompt: 'select_account' },
      },
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100dvh - 120px)', textAlign: 'center' }}>
      <h1 style={{ fontFamily: 'var(--font-dm-serif-var), serif', fontSize: '42px', fontWeight: 400, color: '#FAF7F0', margin: '0 0 20px' }}>
        Before we begin
      </h1>
      <p style={{ fontFamily: 'var(--font-garamond-var), Georgia, serif', fontSize: '18px', color: 'rgba(250,247,240,0.72)', lineHeight: 1.65, margin: '0 0 16px', maxWidth: '360px' }}>
        Vesper is a creative experience for entertainment and self-reflection — not professional advice of any kind.
      </p>
      <button
        onClick={() => setExpanded(e => !e)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '13px', color: '#C9A84C', padding: 0, marginBottom: '24px', textDecoration: 'underline' }}
      >
        {expanded ? 'read less' : 'read more'}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ fontFamily: 'var(--font-garamond-var), Georgia, serif', fontSize: '14px', color: 'rgba(250,247,240,0.5)', lineHeight: 1.65, margin: '0 0 24px', overflow: 'hidden', maxWidth: '360px' }}
          >
            Vesper and Melissa&apos;s readings are for entertainment and self-reflection purposes only. They are not a substitute for professional psychological, medical, financial, or legal advice. If you are in crisis or struggling, please contact a qualified professional or a local crisis line. You must be 18 or older to use Vesper. Readings are generated experiences and no outcome is guaranteed.
          </motion.p>
        )}
      </AnimatePresence>
      <div style={{ width: '100%', maxWidth: '360px' }}>
        <PrimaryButton onClick={handleAccept} disabled={signingIn}>{signingIn ? 'Opening…' : "I'm ready"}</PrimaryButton>
      </div>
    </div>
  );
}
