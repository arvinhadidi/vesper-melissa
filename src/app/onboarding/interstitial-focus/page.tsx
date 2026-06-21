'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useOnboardingData } from '@/lib/onboarding/useOnboardingData';
import { MelissaAvatar } from '@/components/onboarding/MelissaAvatar';
import { FOCUS_INTERSTITIALS } from '@/lib/onboarding/constants';

export default function InterstitialFocusPage() {
  const router = useRouter();
  const { data } = useOnboardingData();
  const line = data.focus_area ? FOCUS_INTERSTITIALS[data.focus_area] : '';

  useEffect(() => {
    const t = setTimeout(() => router.push('/onboarding/privacy'), 3600);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100dvh - 120px)', textAlign: 'center' }}>
      <MelissaAvatar size={240} />
      <motion.p
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        style={{ fontFamily: 'var(--font-garamond-var), Georgia, serif', fontSize: '21px', fontStyle: 'italic', color: 'rgba(250,247,240,0.85)', textAlign: 'center', lineHeight: 1.6, margin: '36px 0 44px', maxWidth: '360px' }}
      >
        &ldquo;{line}&rdquo;
      </motion.p>
    </div>
  );
}
