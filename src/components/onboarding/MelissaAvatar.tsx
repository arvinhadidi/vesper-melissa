'use client';

import Image from 'next/image';

export function MelissaAvatar({ size = 96, variant = 'default' }: { size?: number; variant?: 'default' | 'thinking' | 'insight' }) {
  const src = variant === 'thinking' ? '/melissa/melissa-thinking.png' : variant === 'insight' ? '/melissa/melissa-insight.png' : '/melissa/melissa-default.png';
  return (
    <div style={{
      display: 'inline-block', flexShrink: 0,
      filter: 'drop-shadow(0 0 18px rgba(201,168,76,0.7)) drop-shadow(0 0 40px rgba(201,168,76,0.35)) drop-shadow(0 0 70px rgba(201,168,76,0.15))',
    }}>
      <Image src={src} alt="Melissa" width={size} height={size}
        style={{
          display: 'block',
          maskImage: 'linear-gradient(to bottom, black 55%, transparent 95%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 55%, transparent 95%)',
        }}
      />
    </div>
  );
}
