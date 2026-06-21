'use client';

import { useRouter } from 'next/navigation';
import { PrimaryButton } from '@/components/onboarding/PrimaryButton';

export default function CommitmentPage() {
  const router = useRouter();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 'calc(100dvh - 120px)', textAlign: 'center', paddingTop: '48px' }}>
      <h1 style={{ fontFamily: 'var(--font-dm-serif-var), serif', fontSize: '42px', fontWeight: 400, color: '#FAF7F0', margin: '0 0 48px', lineHeight: 1.25 }}>
        Readings build on each other.
      </h1>
      <div style={{ marginBottom: '48px', filter: 'drop-shadow(0 0 12px rgba(201,168,76,0.6)) drop-shadow(0 0 32px rgba(201,168,76,0.35)) drop-shadow(0 0 56px rgba(201,168,76,0.2))' }}>
        <svg width="260" height="130" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 50c-8-16-24-30-42-30-22 0-40 14-40 30s18 30 40 30c18 0 34-14 42-30zm0 0c8 16 24 30 42 30 22 0 40-14 40-30S164 20 142 20c-18 0-34 14-42 30z" stroke="#C9A84C" strokeWidth="5" strokeLinecap="round" fill="none" />
        </svg>
      </div>
      <p style={{ fontFamily: 'var(--font-garamond-var), Georgia, serif', fontSize: '19px', color: 'rgba(250,247,240,0.72)', lineHeight: 1.65, margin: '0 0 48px' }}>
        Melissa asks one thing - come back tomorrow. The cards remember where you left off.
      </p>
      <PrimaryButton onClick={() => router.push('/onboarding/email-checkin')}>I can do that.</PrimaryButton>
    </div>
  );
}
