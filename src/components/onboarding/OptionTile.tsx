'use client';

import { motion } from 'framer-motion';

export function OptionTile({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.985 }}
      animate={selected ? { scale: 1.01 } : { scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      style={{
        width: '100%', padding: '18px 20px',
        border: `1px solid ${selected ? '#C9A84C' : 'rgba(201,168,76,0.3)'}`,
        borderRadius: '14px', marginBottom: '12px',
        background: selected ? 'rgba(201,168,76,0.15)' : 'rgba(250,247,240,0.04)',
        boxShadow: selected ? 'inset 0 0 12px rgba(201,168,76,0.08)' : 'none',
        fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '16px',
        color: selected ? '#FAF7F0' : 'rgba(250,247,240,0.8)',
        cursor: 'pointer', textAlign: 'center',
        WebkitTapHighlightColor: 'transparent',
        transition: 'border-color 0.15s ease, background 0.15s ease',
      }}
    >
      {label}
    </motion.button>
  );
}
