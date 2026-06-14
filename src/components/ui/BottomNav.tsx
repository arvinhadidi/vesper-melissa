'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  {
    href: '/daily',
    label: 'Daily',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    ),
  },
  {
    href: '/spread',
    label: 'Spread',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="6" width="8" height="12" rx="1" transform="rotate(-8 2 6)"/>
        <rect x="8" y="5" width="8" height="14" rx="1"/>
        <rect x="14" y="6" width="8" height="12" rx="1" transform="rotate(8 14 6)"/>
      </svg>
    ),
  },
  {
    href: '/journal',
    label: 'Journal',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 6s1.5-2 5-2 5 2 5 2v14s-1.5-1.5-5-1.5S2 20 2 20V6z"/>
        <path d="M12 6s1.5-2 5-2 5 2 5 2v14s-1.5-1.5-5-1.5-5 1.5-5 1.5V6z"/>
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '480px',
        background: '#FAF7F0',
        borderTop: '2px solid #C9A84C',
        height: '64px',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingBottom: 'env(safe-area-inset-bottom)',
        boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.3)',
      }}
    >
      {tabs.map((tab) => {
        const isActive = pathname.startsWith(tab.href);
        const color = isActive ? '#C9A84C' : 'rgba(30, 18, 86, 0.5)';

        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '8px 20px',
              color,
              textDecoration: 'none',
            }}
          >
            {tab.icon}
            <span
              style={{
                fontFamily: 'var(--font-dm-sans-var), sans-serif',
                fontSize: '10px',
                fontWeight: 500,
                letterSpacing: '0.04em',
                color,
              }}
            >
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
