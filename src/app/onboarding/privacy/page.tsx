'use client';

import { useRouter } from 'next/navigation';
import { PrimaryButton } from '@/components/onboarding/PrimaryButton';

export default function PrivacyPage() {
  const router = useRouter();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100dvh - 120px)', textAlign: 'center' }}>
      <p style={{ fontFamily: 'var(--font-dm-serif-var), serif', fontSize: '42px', color: '#FAF7F0', textAlign: 'center', lineHeight: 1.25, margin: '0 0 40px' }}>
        What you tell Melissa stays between you and Melissa.
      </p>
      <svg width="140" height="140" viewBox="0 0 24 24" fill="none" style={{ marginBottom: '40px', filter: 'drop-shadow(0 0 18px rgba(201,168,76,0.7)) drop-shadow(0 0 40px rgba(201,168,76,0.35)) drop-shadow(0 0 70px rgba(201,168,76,0.15))' }}>
        <rect x="5" y="11" width="14" height="10" rx="2" stroke="#C9A84C" strokeWidth="1.5" fill="rgba(201,168,76,0.12)" />
        <path d="M8 11V7a4 4 0 1 1 8 0v4" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="16" r="1.5" fill="#C9A84C" />
      </svg>
      <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '14px', color: 'rgba(250,247,240,0.45)', textAlign: 'center', margin: '0 0 56px' }}>
        Your answers are private and never shared.
      </p>
      <div style={{ width: '100%' }}>
        <PrimaryButton onClick={() => router.push('/onboarding/situation')}>Continue</PrimaryButton>
      </div>
    </div>
  );
}
