'use client';

import { PRICING } from '@/lib/onboarding/constants';

type Plan = 'yearly' | 'monthly';
type PriceInfo = (typeof PRICING)[string];

interface PlanSelectorProps {
  selectedPlan: Plan;
  onSelect: (plan: Plan) => void;
  pricing: PriceInfo;
}

// Yearly/monthly pricing toggle shared by the onboarding trial paywall and the standalone
// re-subscribe paywall. Both rendered an identical ~50-line inline block; this is the single copy.
export function PlanSelector({ selectedPlan, onSelect, pricing }: PlanSelectorProps) {
  return (
    <div style={{ width: '100%', marginBottom: '24px', display: 'flex', gap: '10px' }}>
      <button
        onClick={() => onSelect('yearly')}
        style={{
          position: 'relative',
          flex: 1,
          padding: '16px 12px',
          border: `1.5px solid ${selectedPlan === 'yearly' ? '#C9A84C' : 'rgba(201,168,76,0.3)'}`,
          borderRadius: '14px',
          background: selectedPlan === 'yearly' ? 'rgba(201,168,76,0.12)' : 'rgba(250,247,240,0.04)',
          cursor: 'pointer',
          textAlign: 'center',
          transition: 'border-color 0.15s ease, background 0.15s ease',
        }}
      >
        <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: '#C9A84C', color: '#1E1256', fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', letterSpacing: '0.3px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Save {pricing.savePct}%</span>
        <span style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '16px', fontWeight: 600, color: '#FAF7F0', display: 'block' }}>Yearly</span>
        <span style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '20px', fontWeight: 700, color: '#FAF7F0', display: 'block', marginTop: '4px' }}>{pricing.symbol}{pricing.yearly}</span>
      </button>
      <button
        onClick={() => onSelect('monthly')}
        style={{
          flex: 1,
          padding: '16px 12px',
          border: `1.5px solid ${selectedPlan === 'monthly' ? '#C9A84C' : 'rgba(201,168,76,0.3)'}`,
          borderRadius: '14px',
          background: selectedPlan === 'monthly' ? 'rgba(201,168,76,0.12)' : 'rgba(250,247,240,0.04)',
          cursor: 'pointer',
          textAlign: 'center',
          transition: 'border-color 0.15s ease, background 0.15s ease',
        }}
      >
        <span style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '16px', fontWeight: 600, color: '#FAF7F0', display: 'block' }}>Monthly</span>
        <span style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '20px', fontWeight: 700, color: '#FAF7F0', display: 'block', marginTop: '4px' }}>{pricing.symbol}{pricing.monthly}</span>
      </button>
    </div>
  );
}
