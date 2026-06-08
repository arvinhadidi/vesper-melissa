import BottomNav from '@/components/ui/BottomNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100dvh',
      background: '#1E1256',
      display: 'flex',
      flexDirection: 'column',
      maxWidth: '480px',
      margin: '0 auto',
      position: 'relative',
    }}>
      <main style={{ flex: 1, overflowY: 'auto', paddingBottom: '72px' }}>
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
