'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { MelissaAvatar } from './MelissaAvatar';
import { PrimaryButton } from './PrimaryButton';
import { CLOSING_OFFER_PCT, formatPrice, LOCAL_PRICING, type CurrencyCode } from '@/lib/onboarding/pricing';
import { TRIAL_DAYS } from '@/lib/onboarding/constants';

type Props = {
  open: boolean;
  name?: string;
  currency: CurrencyCode;
  busy: boolean;
  error: string | null;
  onAccept: () => void;
  onDecline: () => void;
};

// Second-chance offer shown once when someone backs out of the trial paywall:
// same free trial, then the first paid month at CLOSING_OFFER_PCT% off (monthly plan).
export function ClosingOfferSheet({ open, name, currency, busy, error, onAccept, onDecline }: Props) {
  const p = LOCAL_PRICING[currency];
  const discounted = p.monthly * (1 - CLOSING_OFFER_PCT / 100);
  const fmt = (n: number) => formatPrice(currency, n);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="closing-offer"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(8,5,28,0.72)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
          onClick={onDecline}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            onClick={e => e.stopPropagation()}
            role="dialog" aria-modal="true" aria-label="A one-time offer"
            style={{
              width: '100%', maxWidth: '520px', background: '#FAF7F0', borderRadius: '28px 28px 0 0',
              padding: '28px 24px calc(24px + env(safe-area-inset-bottom))', textAlign: 'center', color: '#1E1256',
              boxShadow: '0 -12px 48px rgba(0,0,0,0.35)',
            }}
          >
            <div style={{ marginTop: '-84px', marginBottom: '6px' }}>
              <MelissaAvatar size={120} />
            </div>
            <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#A8893A', margin: '0 0 10px' }}>
              One-time offer
            </p>
            <h2 style={{ fontFamily: 'var(--font-dm-serif-var), serif', fontSize: '30px', fontWeight: 400, margin: '0 0 10px', lineHeight: 1.2, color: '#1E1256' }}>
              {name ? `Wait, ${name}.` : 'Wait.'} Your first month is {CLOSING_OFFER_PCT}% off
            </h2>
            <p style={{ fontFamily: 'var(--font-garamond-var), Georgia, serif', fontSize: '17px', color: 'rgba(30,18,86,0.72)', margin: '0 0 18px', lineHeight: 1.5 }}>
              Your cards are already drawn. Keep your {TRIAL_DAYS} free days, then pay less while you decide.
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '10px', margin: '0 0 6px' }}>
              <span style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '18px', color: 'rgba(30,18,86,0.45)', textDecoration: 'line-through' }}>{fmt(p.monthly)}</span>
              <span style={{ fontFamily: 'var(--font-dm-serif-var), serif', fontSize: '40px', color: '#1E1256' }}>{fmt(discounted)}</span>
            </div>
            <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '12.5px', color: 'rgba(30,18,86,0.6)', margin: '0 0 20px' }}>
              {TRIAL_DAYS} days free, then {fmt(discounted)} for month one, then {fmt(p.monthly)}/month. Cancel anytime.
            </p>
            <PrimaryButton onClick={onAccept} disabled={busy}>{busy ? 'Opening…' : `Claim ${CLOSING_OFFER_PCT}% off`}</PrimaryButton>
            {error && (
              <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '13px', color: '#9B2C2C', margin: '10px 0 0' }}>{error}</p>
            )}
            <button
              onClick={onDecline}
              style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: '14px', fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '14px', color: 'rgba(30,18,86,0.55)', textDecoration: 'underline' }}
            >
              No thanks
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
