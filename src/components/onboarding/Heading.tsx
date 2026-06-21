'use client';

export function Heading({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <>
      <h1 style={{
        fontFamily: 'var(--font-dm-serif-var), serif', fontSize: '42px', fontWeight: 400,
        color: '#FAF7F0', margin: sub ? '0 0 12px' : '0 0 36px', lineHeight: 1.25,
        textAlign: 'center',
      }}>
        {children}
      </h1>
      {sub && (
        <p style={{
          fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '14px',
          color: 'rgba(250,247,240,0.5)', margin: '0 0 36px', lineHeight: 1.5,
          textAlign: 'center',
        }}>
          {sub}
        </p>
      )}
    </>
  );
}
