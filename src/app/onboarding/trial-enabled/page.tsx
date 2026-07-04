'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { TRIAL_DAYS } from '@/lib/onboarding/constants';

export default function TrialEnabledPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.push('/onboarding/paywall'), 2500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div onClick={() => router.push('/onboarding/paywall')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100dvh - 48px)', cursor: 'pointer' }}>
      <motion.div
        style={{ width: '72px', height: '36px', borderRadius: '18px', background: 'rgba(30,18,86,0.6)', position: 'relative', marginBottom: '32px' }}
        animate={{ background: '#C9A84C' }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
        <motion.div
          style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#FAF7F0', position: 'absolute', top: '4px', left: '4px' }}
          animate={{ left: '40px' }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 400, damping: 20 }}
        />
        <motion.div
          style={{ position: 'absolute', inset: '-20px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.3) 0%, transparent 70%)', opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.4 }}
        style={{ textAlign: 'center' }}
      >
        <p style={{ fontFamily: 'var(--font-dm-serif-var), serif', fontSize: '24px', color: '#FAF7F0', margin: '0 0 10px', lineHeight: 1.3 }}>
          Your {TRIAL_DAYS}-day free trial is enabled ✦
        </p>
        <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '14px', color: 'rgba(250,247,240,0.6)', margin: 0 }}>
          No payment yet — you&apos;ll choose your plan next.
        </p>
      </motion.div>
    </div>
  );
}
