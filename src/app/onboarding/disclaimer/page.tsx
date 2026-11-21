'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingData } from '@/lib/onboarding/useOnboardingData';
import { PrimaryButton } from '@/components/onboarding/PrimaryButton';

export default function DisclaimerPage() {
  const router = useRouter();
  const { data, persist } = useOnboardingData();
  const [expanded, setExpanded] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  function handleAccept() {
    // Sign-in no longer happens here: it moved to the save-reading step right before
    // the paywall, after the visitor has invested in their answers (it lost ~1 in 3
    // visitors at this step). Answers are saved anonymously as they go.
    if (signingIn) return;
    setSigningIn(true);
    const updated = { ...data, disclaimer_accepted_at: new Date().toISOString() };
    persist(updated);
    router.push('/onboarding/name');
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
        <PrimaryButton onClick={handleAccept} disabled={signingIn}>I&apos;m ready</PrimaryButton>
      </div>
    </div>
  );
}
