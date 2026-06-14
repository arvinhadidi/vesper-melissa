import OnboardingMigration from '@/components/ui/OnboardingMigration';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      justifyContent: 'center',
    }}>
      <OnboardingMigration />
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
    </div>
  );
}
