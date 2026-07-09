'use client';

import { usePathname } from 'next/navigation';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import NightSky from '@/components/ui/NightSky';
import { STEP_ORDER, NO_PROGRESS } from '@/lib/onboarding/constants';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const slug = pathname.split('/').pop() ?? '';

  const progressSteps = STEP_ORDER.filter(s => !NO_PROGRESS.has(s));
  const progressIndex = progressSteps.indexOf(slug as typeof progressSteps[number]);
  const showProgress = progressIndex >= 0;

  const isPaywall = slug === 'paywall';

  // From the trial-enabled animation onward, switch from the bluer gradient to the dark night sky.
  const darkIdx = STEP_ORDER.indexOf('trial-enabled');
  const slugIdx = STEP_ORDER.indexOf(slug as typeof STEP_ORDER[number]);
  const isDark = slugIdx !== -1 && slugIdx >= darkIdx;

  // Rendered as a position:fixed layer rather than background-attachment:fixed:
  // iOS Safari doesn't support fixed attachment and composites it incorrectly,
  // leaving ghost fragments of gold borders smeared across the page on scroll.
  const lightBg: React.CSSProperties = {
    position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
    backgroundColor: '#1E1256',
    backgroundImage: 'linear-gradient(to bottom, rgba(30,18,86,0.6) 0%, rgba(30,18,86,0.45) 30%, rgba(30,18,86,0.8) 75%, rgba(30,18,86,1) 100%), url("/landing/starrysky.webp")',
    backgroundSize: 'auto, cover',
    backgroundPosition: 'center',
  };

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', justifyContent: 'center',
      backgroundColor: isDark ? '#120B3A' : '#1E1256',
    }}>
      {isDark ? <NightSky /> : <div style={lightBg} />}
      <div style={{
        position: 'relative', zIndex: 1, width: '100%',
        maxWidth: isPaywall ? '900px' : '480px',
        minHeight: '100dvh', padding: '0 28px 80px',
        display: 'flex', flexDirection: 'column', overflowX: 'hidden',
        transition: 'max-width 0.3s ease',
      }}>
        {showProgress && <div style={{ paddingTop: '32px' }}><ProgressBar current={progressIndex + 1} total={progressSteps.length} /></div>}
        {!showProgress && <div style={{ height: '32px' }} />}
        <div style={{ flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
