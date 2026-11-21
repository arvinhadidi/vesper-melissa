'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useOnboardingData } from '@/lib/onboarding/useOnboardingData';
import { MelissaAvatar } from '@/components/onboarding/MelissaAvatar';
import { startGoogleSignIn } from '@/lib/onboarding/googleSignIn';
import { track } from '@/lib/analytics';
import { EASE } from '@/lib/onboarding/constants';

const NEXT = '/onboarding/trial-enabled';

function GoogleG() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

// Google sign-in, placed right before the trial offer (it used to fire at step 2).
// Framed around keeping the reading they just built. Already signed in → skip ahead.
export default function SaveReadingPage() {
  const router = useRouter();
  const { data } = useOnboardingData();
  const [checking, setChecking] = useState(true);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      if (user) router.replace(NEXT);
      else setChecking(false);
    });
  }, [router]);

  async function handleGoogle() {
    if (opening) return;
    setOpening(true);
    track('signin_google_clicked', { location: 'save_reading' });
    try {
      await startGoogleSignIn(NEXT);
    } catch {
      setOpening(false);
    }
  }

  const name = data.display_name;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100dvh - 120px)', textAlign: 'center', opacity: checking ? 0 : 1, transition: 'opacity 0.2s ease' }}>
      <MelissaAvatar size={190} variant="insight" />
      <motion.h1
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.4, ease: EASE }}
        style={{ fontFamily: 'var(--font-dm-serif-var), serif', fontSize: '36px', fontWeight: 400, color: '#FAF7F0', margin: '24px 0 14px', lineHeight: 1.2 }}
      >
        {name ? <>{name}, your reading<br />is ready</> : <>Your reading<br />is ready</>}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35, duration: 0.4 }}
        style={{ fontFamily: 'var(--font-garamond-var), Georgia, serif', fontSize: '19px', color: 'rgba(250,247,240,0.75)', lineHeight: 1.6, margin: '0 0 36px', maxWidth: '340px' }}
      >
        Save it so Melissa remembers your answers, and your cards are waiting each time you come back.
      </motion.p>
      <div style={{ width: '100%', maxWidth: '360px' }}>
        <button
          onClick={handleGoogle}
          disabled={opening}
          style={{
            width: '100%', padding: '17px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
            background: '#FAF7F0', border: 'none', borderRadius: '16px', cursor: opening ? 'default' : 'pointer',
            fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '17px', fontWeight: 500, color: '#1E1256',
            opacity: opening ? 0.7 : 1, boxShadow: '0 6px 24px rgba(201,168,76,0.18)',
          }}
        >
          <GoogleG />
          {opening ? 'Opening Google…' : 'Save with Google'}
        </button>
        <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '12.5px', color: 'rgba(250,247,240,0.5)', margin: '14px 0 0', lineHeight: 1.5 }}>
          Takes 5 seconds. We never post anything or share your email.
        </p>
      </div>
    </div>
  );
}
