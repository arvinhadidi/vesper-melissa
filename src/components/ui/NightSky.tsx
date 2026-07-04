'use client';

/**
 * Shared dark night-sky background — used on every screen from the trial-enabled
 * animation onward (onboarding trial-enabled/paywall, standalone /paywall,
 * /personalisation, and all (app) pages). Earlier onboarding screens keep the
 * lighter "bluer" gradient set in onboarding/layout.tsx.
 *
 * Fixed, full-viewport, opaque base (covers the global body::before). Render it
 * as a sibling BEHIND content; give the content wrapper position:relative + zIndex >= 1.
 * Keyframes (mn-*) live in globals.css. Motion is disabled under prefers-reduced-motion.
 */

import { useReducedMotion } from 'framer-motion';

const GOLD = '#C9A84C';
const CREAM = '#FAF7F0';

// Deterministic positions (no Math.random — avoids SSR hydration drift).
const STARS = [
  { top: '12%', left: '18%', size: 2, dur: 3.4, delay: 0 },
  { top: '8%', left: '74%', size: 3, dur: 4.2, delay: 0.6 },
  { top: '22%', left: '52%', size: 2, dur: 3.8, delay: 1.1 },
  { top: '17%', left: '88%', size: 2, dur: 4.6, delay: 0.3 },
  { top: '31%', left: '8%', size: 3, dur: 3.2, delay: 1.5 },
  { top: '44%', left: '93%', size: 2, dur: 5.0, delay: 0.9 },
  { top: '38%', left: '30%', size: 2, dur: 4.0, delay: 2.0 },
  { top: '55%', left: '15%', size: 2, dur: 3.6, delay: 1.3 },
  { top: '62%', left: '80%', size: 3, dur: 4.4, delay: 0.2 },
  { top: '70%', left: '46%', size: 2, dur: 3.9, delay: 1.8 },
  { top: '78%', left: '24%', size: 2, dur: 4.8, delay: 0.7 },
  { top: '84%', left: '68%', size: 2, dur: 3.5, delay: 2.4 },
];

const MOTES = [
  { left: '20%', bottom: '6%', dur: 14, delay: 0, size: 3 },
  { left: '46%', bottom: '38%', dur: 18, delay: 4, size: 2 },
  { left: '72%', bottom: '16%', dur: 16, delay: 8, size: 3 },
  { left: '88%', bottom: '52%', dur: 20, delay: 2, size: 2 },
  { left: '34%', bottom: '24%', dur: 17, delay: 11, size: 2 },
  { left: '10%', bottom: '60%', dur: 19, delay: 6, size: 2 },
  { left: '58%', bottom: '8%', dur: 15, delay: 13, size: 3 },
  { left: '80%', bottom: '30%', dur: 21, delay: 9, size: 2 },
  { left: '26%', bottom: '70%', dur: 16, delay: 1, size: 2 },
  { left: '64%', bottom: '46%', dur: 18, delay: 15, size: 3 },
  { left: '4%', bottom: '34%', dur: 14, delay: 7, size: 2 },
  { left: '94%', bottom: '12%', dur: 20, delay: 4, size: 2 },
  { left: '14%', bottom: '44%', dur: 17, delay: 3, size: 2 },
  { left: '40%', bottom: '64%', dur: 19, delay: 10, size: 3 },
  { left: '52%', bottom: '4%', dur: 15, delay: 5, size: 2 },
  { left: '66%', bottom: '58%', dur: 20, delay: 14, size: 2 },
  { left: '78%', bottom: '40%', dur: 16, delay: 0.5, size: 3 },
  { left: '90%', bottom: '66%', dur: 18, delay: 12, size: 2 },
  { left: '8%', bottom: '20%', dur: 14, delay: 9.5, size: 2 },
  { left: '30%', bottom: '50%', dur: 21, delay: 2.5, size: 2 },
  { left: '62%', bottom: '26%', dur: 17, delay: 16, size: 3 },
  { left: '84%', bottom: '4%', dur: 19, delay: 7.5, size: 2 },
  { left: '98%', bottom: '28%', dur: 15, delay: 11.5, size: 2 },
  { left: '44%', bottom: '12%', dur: 20, delay: 5.5, size: 3 },
];

export default function NightSky() {
  const reduced = useReducedMotion();
  const animated = !reduced;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', backgroundColor: '#120B3A' }}>
      <div
        className="mn-anim"
        style={{
          position: 'absolute',
          inset: '-6%',
          backgroundImage: 'url("/landing/starrysky.webp")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: 'scale(1.12)',
          animation: animated ? 'mn-drift 40s ease-in-out infinite alternate' : 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to bottom, rgba(18,11,58,0.62) 0%, rgba(18,11,58,0.28) 32%, rgba(18,11,58,0.30) 62%, rgba(18,11,58,0.66) 100%)',
        }}
      />
      <div
        className="mn-anim"
        style={{
          position: 'absolute',
          top: '-12%',
          left: '50%',
          width: '120%',
          height: '60%',
          transform: 'translateX(-50%)',
          background:
            'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(201,168,76,0.16), rgba(201,168,76,0.05) 45%, transparent 70%)',
          opacity: animated ? undefined : 0.6,
          animation: animated ? 'mn-glow 9s ease-in-out infinite' : 'none',
        }}
      />
      {STARS.map((s, i) => (
        <span
          key={i}
          className="mn-anim"
          style={{
            position: 'absolute',
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            borderRadius: '50%',
            background: CREAM,
            boxShadow: `0 0 ${s.size * 3}px rgba(250,247,240,0.8)`,
            opacity: animated ? undefined : 0.5,
            animation: animated ? `mn-twinkle ${s.dur}s ease-in-out ${s.delay}s infinite` : 'none',
          }}
        />
      ))}
      {animated &&
        MOTES.map((m, i) => (
          <span
            key={`m${i}`}
            className="mn-anim"
            style={{
              position: 'absolute',
              bottom: m.bottom,
              left: m.left,
              width: m.size,
              height: m.size,
              borderRadius: '50%',
              background: GOLD,
              boxShadow: '0 0 6px rgba(201,168,76,0.7)',
              animation: `mn-mote ${m.dur}s linear ${m.delay}s infinite`,
            }}
          />
        ))}
    </div>
  );
}
