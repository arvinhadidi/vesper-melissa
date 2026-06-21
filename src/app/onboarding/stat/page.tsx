'use client';

import { useRouter } from 'next/navigation';
import { MelissaAvatar } from '@/components/onboarding/MelissaAvatar';
import { PrimaryButton } from '@/components/onboarding/PrimaryButton';

export default function StatPage() {
  const router = useRouter();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100dvh - 120px)', textAlign: 'center' }}>
      <MelissaAvatar size={240} variant="thinking" />
      <p style={{ fontFamily: 'var(--font-dm-serif-var), serif', fontSize: '28px', fontWeight: 400, color: '#FAF7F0', textAlign: 'center', lineHeight: 1.4, margin: '36px 0 48px' }}>
        Most members say their first reading named something they hadn&apos;t said out loud yet.
      </p>
      <div style={{ width: '100%' }}>
        <PrimaryButton onClick={() => router.push('/onboarding/commitment')}>Continue</PrimaryButton>
      </div>
    </div>
  );
}
