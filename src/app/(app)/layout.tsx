'use client';

import OnboardingMigration from '@/components/ui/OnboardingMigration';
import TourProvider from '@/components/tour/TourProvider';
import TourOverlay from '@/components/tour/TourOverlay';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      justifyContent: 'center',
    }}>
      <OnboardingMigration />
      <TourProvider>
        <div style={{
          width: '100%',
          maxWidth: '520px',
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
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
