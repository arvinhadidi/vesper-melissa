'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const VISIBLE_PREFIXES = ['/daily', '/spread', '/journal', '/account'];

const navItems = [
  {
    href: '/main',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: '/daily',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
      </svg>
    ),
  },
  {
    href: '/spread',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="6" width="8" height="12" rx="1.5" transform="rotate(-10 2 6)" />
        <rect x="8" y="5" width="8" height="14" rx="1.5" />
        <rect x="14" y="6" width="8" height="12" rx="1.5" transform="rotate(10 14 6)" />
      </svg>
    ),
  },
  {
    href: '/journal',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 6s1.5-2 5-2 5 2 5 2v14s-1.5-1.5-5-1.5S2 20 2 20V6z" />
        <path d="M12 6s1.5-2 5-2 5 2 5 2v14s-1.5-1.5-5-1.5-5 1.5-5 1.5V6z" />
      </svg>
    ),
  },
  {
    href: '/account',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M20 21a8 8 0 0 0-16 0" />
      </svg>
    ),
  },
];

export default function SideNav() {
  const pathname = usePathname();

  if (!VISIBLE_PREFIXES.some(prefix => pathname.startsWith(prefix))) return null;

  return (
    <nav style={{
      position: 'fixed',
      left: '16px',
      top: '50%',
      transform: 'translateY(-50%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 8px',
      backgroundColor: '#FAF7F0',
      borderRadius: '999px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      zIndex: 100,
    }}>
      {navItems.map((item) => {
        const isActive = item.href === '/main' ? false : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              color: isActive ? '#1E1256' : '#C9A84C',
              backgroundColor: isActive ? 'rgba(30, 18, 86, 0.08)' : 'transparent',
              transition: 'color 0.2s, background-color 0.2s',
            }}
          >
            {item.icon}
          </Link>
        );
      })}
    </nav>
  );
}
