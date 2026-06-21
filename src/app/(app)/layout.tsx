'use client';

import OnboardingMigration from '@/components/ui/OnboardingMigration';
import AnalyticsIdentify from '@/components/analytics/AnalyticsIdentify';
import SideNav from '@/components/ui/SideNav';
import BottomNav from '@/components/ui/BottomNav';
import NightSky from '@/components/ui/NightSky';
import TourProvider from '@/components/tour/TourProvider';
import TourOverlay from '@/components/tour/TourOverlay';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      justifyContent: 'center',
    }}>
      {/* SideNav (left pill) was rendering unconditionally on every viewport,
          including phones — eating the left edge where Melissa's avatar also
          needs room, and visually unbalancing the centered content column on
          narrow screens. Swap to BottomNav (matching cream pill, bottom-center)
          below this breakpoint via CSS, not JS, so it stays SSR-safe. */}
      <style>{`
        .nav-desktop-only { display: block; }
        .nav-mobile-only { display: none; }
        @media (max-width: 700px) {
          .nav-desktop-only { display: none; }
          .nav-mobile-only { display: block; }
        }
      `}</style>
      <NightSky />
      <OnboardingMigration />
      <AnalyticsIdentify />
      <div className="nav-desktop-only"><SideNav /></div>
      <div className="nav-mobile-only"><BottomNav /></div>
      <TourProvider>
        <div style={{
          width: '100%',
          maxWidth: '520px',
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 1,
        }}>
          <main style={{ flex: 1, overflowY: 'auto' }}>
            {children}
          </main>
        </div>
        <TourOverlay />
      </TourProvider>
    </div>
  );
}
