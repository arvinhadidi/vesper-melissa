'use client';

import Link from 'next/link';

const sections = [
  {
    href: '/daily',
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    ),
    title: 'Daily Reading',
    subtitle: 'See what piece of the universe is drawn to you every morning.',
    accent: '#C9A84C',
  },
  {
    href: '/spread',
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="2" y="6" width="8" height="12" rx="1.5" transform="rotate(-10 2 6)" />
        <rect x="8" y="5" width="8" height="14" rx="1.5" />
        <rect x="14" y="6" width="8" height="12" rx="1.5" transform="rotate(10 14 6)" />
      </svg>
    ),
    title: 'Spread',
    subtitle: 'Ask a question. Draw three cards. Receive clarity.',
    accent: '#C9A84C',
  },
  {
    href: '/journal',
    icon: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M2 6s1.5-2 5-2 5 2 5 2v14s-1.5-1.5-5-1.5S2 20 2 20V6z" />
        <path d="M12 6s1.5-2 5-2 5 2 5 2v14s-1.5-1.5-5-1.5-5 1.5-5 1.5V6z" />
      </svg>
    ),
    title: 'Journal',
    subtitle: 'Revisit your readings. Track patterns over time.',
    accent: '#C9A84C',
  },
];

export default function MainPage() {
  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      gap: '0',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: 'var(--font-dm-serif-var), serif',
          fontSize: '52px',
          fontWeight: 400,
          color: '#FAF7F0',
          margin: 0,
          letterSpacing: '0.01em',
        }}>
          Good morning, Arvin.
        </h1>
        <p style={{
          fontFamily: 'var(--font-garamond-var), Georgia, serif',
          fontSize: '15px',
          color: 'rgba(250, 247, 240, 0.6)',
          margin: '6px 0 0',
          fontWeight: 400,
        }}>
          What would you like to explore today?
        </p>
      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        width: '100%',
        maxWidth: '340px',
      }}>
        {sections.map((s) => (
          <Link key={s.href} href={s.href} style={{ textDecoration: 'none' }}>
            <div
              style={{
                background: '#FAF7F0',
                border: '1px solid rgba(201, 168, 76, 0.35)',
                borderRadius: '16px',
                padding: '28px 20px 24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '10px',
                boxShadow: '0 6px 24px rgba(0, 0, 0, 0.25)',
                cursor: 'pointer',
                transition: 'box-shadow 0.15s ease, transform 0.15s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.35), 0 0 16px rgba(201, 168, 76, 0.25)';
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 24px rgba(0, 0, 0, 0.25)';
                (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                fontFamily: 'var(--font-dm-serif-var), serif',
                fontSize: '34px',
                fontWeight: 400,
                color: '#1E1256',
                letterSpacing: '0.01em',
              }}>
                {s.title}
              </div>
              <div style={{ color: s.accent }}>
                {s.icon}
              </div>
              <div style={{
                fontFamily: 'var(--font-garamond-var), Georgia, serif',
                fontSize: '13.5px',
                color: 'rgba(30, 18, 86, 0.62)',
                lineHeight: '1.55',
                fontWeight: 400,
              }}>
                {s.subtitle}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
