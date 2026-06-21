'use client';

import { motion } from 'framer-motion';

export function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div style={{ width: '100%', marginBottom: '36px' }}>
      <div style={{ height: '3px', background: 'rgba(250,247,240,0.12)', borderRadius: '2px', overflow: 'hidden' }}>
        <motion.div
          style={{ height: '100%', background: '#C9A84C', borderRadius: '2px', boxShadow: '0 0 6px rgba(201,168,76,0.5)' }}
          initial={{ width: `${pct}%` }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
