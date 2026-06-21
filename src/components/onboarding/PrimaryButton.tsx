'use client';

export function PrimaryButton({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%', padding: '18px',
        background: disabled ? 'rgba(201,168,76,0.25)' : '#C9A84C',
        border: 'none', borderRadius: '16px',
        fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '17px', fontWeight: 500,
        color: disabled ? 'rgba(30,18,86,0.5)' : '#1E1256',
        cursor: disabled ? 'default' : 'pointer',
        transition: 'background 0.15s ease',
      }}
    >
      {children}
    </button>
  );
}
