'use client';

import { useRouter } from 'next/navigation';
import { PrimaryButton } from '@/components/onboarding/PrimaryButton';

export default function SocialProofPage() {
  const router = useRouter();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100dvh - 120px)' }}>
      <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '12px', fontWeight: 500, letterSpacing: '2.5px', textTransform: 'uppercase', color: '#C9A84C', margin: '0 0 20px' }}>
        VESPER
      </p>
      <h1 style={{ fontFamily: 'var(--font-dm-serif-var), serif', fontSize: '50px', fontWeight: 400, color: '#FAF7F0', textAlign: 'center', margin: '0 0 28px', lineHeight: 1.25 }}>
        You&apos;re in good company
      </h1>
      <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '19px', fontWeight: 500, color: '#FAF7F0', textAlign: 'center', margin: '0 0 40px' }}>
        Readers have used Melissa <span style={{ color: '#C9A84C' }}>5000+</span> times to:
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '32px' }}>
        {([
          <>Pull <span style={{ color: '#C9A84C' }}>spreads</span> with readings made for them</>,
          <>Start each morning with a <span style={{ color: '#C9A84C' }}>daily card</span></>,
          <><span style={{ color: '#C9A84C' }}>Journal</span> and discover what the cards keep saying</>,
          <>Get <span style={{ color: '#C9A84C' }}>clarity</span> on that one person or situation</>,
        ] as React.ReactNode[]).map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ color: '#C9A84C', fontSize: '18px', flexShrink: 0 }}>✓</span>
            <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '16px', fontWeight: 500, color: 'rgba(250,247,240,0.9)', margin: 0, lineHeight: 1.5 }}>{item}</p>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
            {(['reader-1.jpg', 'reader-2.jpg', 'reader-3.jpg']).map((file, i) => (
              <div key={i} style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', border: '1.5px solid rgba(201,168,76,0.5)', marginLeft: i === 0 ? 0 : -10, flexShrink: 0, position: 'relative' }}>
                <img src={`/social-proof/${file}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
          <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '12px', fontWeight: 500, color: 'rgba(250,247,240,0.55)', margin: 0 }}>
            Loved by readers everywhere
          </p>
        </div>
        <div style={{ width: '1px', height: '40px', background: 'rgba(201,168,76,0.4)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-dm-serif-var), serif', fontSize: '28px', fontWeight: 400, color: '#FAF7F0' }}>4.9</span>
          <div style={{ display: 'flex', gap: '2px', marginTop: '2px' }}>
            {[0, 1, 2, 3, 4].map(i => <span key={i} style={{ color: '#C9A84C', fontSize: '13px' }}>★</span>)}
          </div>
        </div>
      </div>
      <div style={{ width: '100%' }}>
        <PrimaryButton onClick={() => router.push('/onboarding/trial-enabled')}>Continue</PrimaryButton>
      </div>
    </div>
  );
}
