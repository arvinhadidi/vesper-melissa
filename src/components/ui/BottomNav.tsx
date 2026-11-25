'use client';

import Link from '@/components/Link';
import { usePathname } from 'next/navigation';

// Mirrors SideNav's item set and icon-only pill aesthetic — this is the mobile
// counterpart, swapped in by a CSS breakpoint in (app)/layout.tsx so it never
// fights SideNav for the same screen real estate (that was the original overlap
// bug: SideNav rendered unconditionally on every viewport, eating into the left
// edge on phones where Melissa's avatar also needs that space).
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

export default function BottomNav() {
  const pathname = usePathname();

  if (!VISIBLE_PREFIXES.some(prefix => pathname.startsWith(prefix))) return null;

  return (
    <nav style={{
      position: 'fixed',
      bottom: 'max(16px, env(safe-area-inset-bottom))',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px',
      backgroundColor: '#FAF7F0',
      borderRadius: '999px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
      // Higher than any in-page fixed element (e.g. tour hints at z-index 90) so
      // nothing can ever sit on top of the nav itself.
      zIndex: 110,
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
              width: '44px',
              height: '44px',
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
