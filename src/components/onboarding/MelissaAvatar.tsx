'use client';

import Image from 'next/image';

export function MelissaAvatar({ size = 96, variant = 'default' }: { size?: number; variant?: 'default' | 'thinking' | 'insight' }) {
  const src = variant === 'thinking' ? '/melissa/melissa-thinking.png' : variant === 'insight' ? '/melissa/melissa-insight.png' : '/melissa/melissa-default.png';
  const glowSize = Math.round(size * 1.6);
  return (
    <div style={{
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      width: size,
      height: size,
    }}>
      <div style={{
        position: 'absolute',
        width: glowSize,
        height: glowSize,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -46%)',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,168,76,0.22) 0%, rgba(201,168,76,0.09) 30%, rgba(201,168,76,0.02) 55%, transparent 72%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />
      <Image src={src} alt="Melissa" width={size} height={size}
        /* priority = eager load + <link rel="preload">. Without it next/image lazy-loads
           and the 800KB PNG only starts downloading after hydration, so Melissa used to
           pop in 2-3s after the glow on the welcome screen. */
        priority
        sizes={`${size}px`}
        style={{
          display: 'block',
          position: 'relative',
          zIndex: 1,
          /* Single mask layer only: multi-layer masks with mask-composite
             render as a hard square edge on iOS Safari. */
          maskImage: 'radial-gradient(ellipse 82% 74% at 50% 38%, black 52%, transparent 95%)',
          WebkitMaskImage: 'radial-gradient(ellipse 82% 74% at 50% 38%, black 52%, transparent 95%)',
        }}
      />
    </div>
  );
}
