'use client';

import { useRouter } from 'next/navigation';
import { MelissaAvatar } from '@/components/onboarding/MelissaAvatar';
import { PrimaryButton } from '@/components/onboarding/PrimaryButton';

export default function WelcomePage() {
  const router = useRouter();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100dvh - 48px)', textAlign: 'center' }}>
      <h1 style={{ fontFamily: 'var(--font-dm-serif-var), serif', fontSize: '42px', fontWeight: 400, color: '#FAF7F0', margin: '0 0 28px', lineHeight: 1.15 }}>
        I&apos;m Melissa.
      </h1>
      <MelissaAvatar size={280} />
      <p style={{ fontFamily: 'var(--font-garamond-var), Georgia, serif', fontSize: '20px', color: 'rgba(250,247,240,0.75)', lineHeight: 1.65, margin: '32px 0 56px', maxWidth: '340px' }}>
        I read the cards so you don&apos;t have to figure them out alone.
      </p>
      <div style={{ width: '100%' }}>
        <PrimaryButton onClick={() => router.push('/onboarding/disclaimer')}>Let&apos;s begin</PrimaryButton>
      </div>
    </div>
  );
}
