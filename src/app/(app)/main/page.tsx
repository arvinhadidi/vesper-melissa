'use client';

import Link from 'next/link';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { useUserProfile } from '@/lib/hooks/useUserProfile';

const GOLD = '#C9A84C';
const CREAM = '#FAF7F0';
const INK = '#1E1256';

// Subtle paper grain over the cream (SVG fractal noise as a data URI).
const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const sections = [
  {
    href: '/daily',
    title: 'Daily Reading',
    subtitle: 'See what piece of the universe is drawn to you every morning.',
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    ),
  },
  {
    href: '/spread',
    title: 'Spread',
    subtitle: 'Ask a question. Draw three cards. Receive clarity.',
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="2" y="6" width="8" height="12" rx="1.5" transform="rotate(-10 2 6)" />
        <rect x="8" y="5" width="8" height="14" rx="1.5" />
        <rect x="14" y="6" width="8" height="12" rx="1.5" transform="rotate(10 14 6)" />
      </svg>
    ),
  },
  {
    href: '/journal',
    title: 'Journal',
    subtitle: 'Revisit your readings. Track patterns over time.',
    icon: (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M2 6s1.5-2 5-2 5 2 5 2v14s-1.5-1.5-5-1.5S2 20 2 20V6z" />
        <path d="M12 6s1.5-2 5-2 5 2 5 2v14s-1.5-1.5-5-1.5-5 1.5-5 1.5V6z" />
      </svg>
    ),
  },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13, delayChildren: 0.15 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

/* ── Composed card: parchment + gold frame + glowing icon ring + gold lines ── */
function PathCard({ title, subtitle, icon }: { title: string; subtitle: string; icon: React.ReactNode }) {
  const base = '0 1px 0 rgba(255,255,255,0.7) inset, 0 12px 30px rgba(0,0,0,0.32), 0 2px 6px rgba(0,0,0,0.18)';
  const glow = base + ', 0 0 36px rgba(201,168,76,0.55), 0 0 70px rgba(201,168,76,0.3)';
  return (
    <motion.div variants={item}>
      <div
        className="mn-card"
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '18px',
          padding: '28px 22px 24px',
          background: 'linear-gradient(160deg, #FFFDF9 0%, #FAF7F0 52%, #F0E8D7 100%)',
          border: '1px solid rgba(201,168,76,0.4)',
          boxShadow: base,
          cursor: 'pointer',
          textAlign: 'center',
          transition: 'box-shadow 0.4s ease, transform 0.35s cubic-bezier(0.22,1,0.36,1)',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          el.style.boxShadow = glow;
          el.style.transform = 'translateY(-3px)';
          el.querySelectorAll<HTMLElement>('[data-ring]').forEach((r) => {
            r.style.boxShadow = '0 0 32px rgba(201,168,76,0.8), 0 0 14px rgba(201,168,76,0.65), inset 0 1px 2px rgba(255,255,255,0.6)';
          });
          el.querySelectorAll<HTMLElement>('[data-line]').forEach((l) => {
            l.style.opacity = '1';
          });
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.boxShadow = base;
          el.style.transform = 'translateY(0)';
          el.querySelectorAll<HTMLElement>('[data-ring]').forEach((r) => {
            r.style.boxShadow = 'inset 0 1px 2px rgba(255,255,255,0.6)';
          });
          el.querySelectorAll<HTMLElement>('[data-line]').forEach((l) => {
            l.style.opacity = '0.72';
          });
        }}
      >
        <span style={{ position: 'absolute', inset: 0, backgroundImage: NOISE, backgroundSize: '180px', opacity: 0.05, mixBlendMode: 'multiply', pointerEvents: 'none' }} />
        <span style={{ position: 'absolute', inset: '7px', border: '1px solid rgba(201,168,76,0.45)', borderRadius: '12px', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontFamily: 'var(--font-dm-serif-var), serif', fontSize: '26px', color: INK, letterSpacing: '0.01em' }}>
            {title}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span data-line style={{ width: '42px', height: '1px', opacity: 0.72, background: 'linear-gradient(to right, transparent, #C9A84C)', transition: 'opacity 0.35s ease' }} />
            <div
              data-ring
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: GOLD,
                flexShrink: 0,
                background: 'radial-gradient(circle at 50% 35%, rgba(201,168,76,0.16), rgba(201,168,76,0.02) 70%)',
                border: '1px solid rgba(201,168,76,0.55)',
                boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.6)',
                transition: 'box-shadow 0.4s ease',
              }}
            >
              {icon}
            </div>
            <span data-line style={{ width: '42px', height: '1px', opacity: 0.72, background: 'linear-gradient(to left, transparent, #C9A84C)', transition: 'opacity 0.35s ease' }} />
          </div>

          <div style={{ fontFamily: 'var(--font-garamond-var), Georgia, serif', fontSize: '13.5px', color: 'rgba(30,18,86,0.62)', lineHeight: 1.55 }}>
            {subtitle}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function MainPage() {
  const reduced = useReducedMotion();
  const { profile } = useUserProfile();
  const name = profile?.displayName || '';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <>
      <Link
        href="/account"
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'rgba(250,247,240,0.08)',
          border: '1px solid rgba(201,168,76,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: GOLD,
          textDecoration: 'none',
          zIndex: 50,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M20 21a8 8 0 0 0-16 0" />
        </svg>
      </Link>

      <motion.div
        variants={reduced ? undefined : container}
        initial={reduced ? undefined : 'hidden'}
        animate={reduced ? undefined : 'show'}
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
        }}
      >
        <motion.div variants={item} style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1
            suppressHydrationWarning
            style={{
              fontFamily: 'var(--font-dm-serif-var), serif',
              fontSize: 'clamp(40px, 11vw, 52px)',
              fontWeight: 400,
              color: CREAM,
              margin: 0,
              lineHeight: 1.1,
              letterSpacing: '0.01em',
            }}
          >
            {/* nowrap on each part: fits one line on laptop, name drops to line 2 on phone */}
            <span style={{ whiteSpace: 'nowrap' }}>{greeting}{name ? ',' : '.'}</span>
            {name && (
              <>
                {' '}
                <span style={{ whiteSpace: 'nowrap', fontStyle: 'italic', color: GOLD }}>{name}.</span>
              </>
            )}
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-garamond-var), Georgia, serif',
              fontSize: '17px',
              fontStyle: 'italic',
              color: 'rgba(250,247,240,0.78)',
              letterSpacing: '0.2px',
              margin: '14px 0 0',
            }}
          >
            What would you like to explore today?
          </p>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '340px' }}>
          {sections.map((s) => (
            <Link key={s.href} href={s.href} style={{ textDecoration: 'none', display: 'block' }}>
              <PathCard title={s.title} subtitle={s.subtitle} icon={s.icon} />
            </Link>
          ))}
        </div>
      </motion.div>
    </>
  );
}
