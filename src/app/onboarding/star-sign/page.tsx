'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnboardingData } from '@/lib/onboarding/useOnboardingData';
import { Heading } from '@/components/onboarding/Heading';
import { PrimaryButton } from '@/components/onboarding/PrimaryButton';
import { ZODIAC_SIGNS, MONTHS } from '@/lib/onboarding/constants';
import { getZodiacSign, capitalize } from '@/lib/onboarding/helpers';

export default function StarSignPage() {
  const { data, setData, navigate, persist } = useOnboardingData();
  const [showPicker, setShowPicker] = useState(false);
  const [pickerDay, setPickerDay] = useState<number | ''>('');
  const [pickerMonth, setPickerMonth] = useState<number | ''>('');
  const [derivedSign, setDerivedSign] = useState<string | null>(null);

  function handlePickerChange(day: number | '', month: number | '') {
    if (day !== '' && month !== '') {
      const sign = getZodiacSign(day, month);
      const dStr = `${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`;
      setDerivedSign(sign);
      setData(d => ({ ...d, star_sign: sign, birth_date: dStr }));
    }
  }

  function handleContinue() {
    persist(data);
    navigate('/onboarding/mood');
  }

  const signForDerived = ZODIAC_SIGNS.find(s => s.value === derivedSign);

  return (
    <div>
      <Heading sub="The stars shape how Melissa reads for you">
        What&apos;s your star sign{data.display_name ? `, ${data.display_name}?` : '?'}
      </Heading>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '12px' }}>
        {ZODIAC_SIGNS.map(sign => {
          const active = data.star_sign === sign.value;
          return (
            <motion.button
              key={sign.value}
              onClick={() => { setShowPicker(false); setData(d => ({ ...d, star_sign: sign.value, birth_date: null })); setDerivedSign(null); }}
              animate={active ? { scale: 1.01 } : { scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '14px 8px', border: `1px solid ${active ? '#C9A84C' : 'rgba(201,168,76,0.3)'}`, borderRadius: '12px', background: active ? 'rgba(201,168,76,0.15)' : 'rgba(250,247,240,0.04)', boxShadow: active ? 'inset 0 0 12px rgba(201,168,76,0.08)' : 'none', cursor: 'pointer', gap: '6px', transition: 'border-color 0.15s ease, background 0.15s ease' }}
            >
              <span style={{ fontSize: '28px', color: '#C9A84C', lineHeight: 1 }}>{sign.glyph}</span>
              <span style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '11px', color: active ? '#FAF7F0' : 'rgba(250,247,240,0.65)' }}>{sign.label}</span>
            </motion.button>
          );
        })}
        <motion.button
          onClick={() => { setShowPicker(p => !p); if (!showPicker) setData(d => ({ ...d, star_sign: null, birth_date: null })); }}
          animate={showPicker ? { scale: 1.01 } : { scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '14px 8px', border: `1px solid ${showPicker ? '#C9A84C' : 'rgba(201,168,76,0.3)'}`, borderRadius: '12px', background: showPicker ? 'rgba(201,168,76,0.15)' : 'rgba(250,247,240,0.04)', cursor: 'pointer', gap: '6px', transition: 'border-color 0.15s ease, background 0.15s ease' }}
        >
          <span style={{ fontSize: '20px', color: 'rgba(250,247,240,0.55)', lineHeight: 1 }}>?</span>
          <span style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '11px', color: 'rgba(250,247,240,0.65)', textAlign: 'center', lineHeight: 1.2 }}>I don&apos;t know</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {showPicker && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            style={{ background: 'rgba(250,247,240,0.06)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}
          >
            <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '13px', color: 'rgba(250,247,240,0.55)', margin: '0 0 12px' }}>Enter your birthday</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <select value={pickerDay} onChange={e => { const v = e.target.value === '' ? '' : parseInt(e.target.value); setPickerDay(v); handlePickerChange(v, pickerMonth); }}
                style={{ flex: 1, padding: '10px 12px', background: 'rgba(250,247,240,0.08)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '8px', color: pickerDay === '' ? 'rgba(250,247,240,0.4)' : '#FAF7F0', fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '15px', cursor: 'pointer' }}
              >
                <option value="">Day</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d} value={d} style={{ background: '#1E1256' }}>{d}</option>)}
              </select>
              <select value={pickerMonth} onChange={e => { const v = e.target.value === '' ? '' : parseInt(e.target.value); setPickerMonth(v); handlePickerChange(pickerDay, v); }}
                style={{ flex: 2, padding: '10px 12px', background: 'rgba(250,247,240,0.08)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '8px', color: pickerMonth === '' ? 'rgba(250,247,240,0.4)' : '#FAF7F0', fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '15px', cursor: 'pointer' }}
              >
                <option value="">Month</option>
                {MONTHS.map((m, i) => <option key={m} value={i + 1} style={{ background: '#1E1256' }}>{m}</option>)}
              </select>
            </div>
            {signForDerived && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ fontFamily: 'var(--font-garamond-var), Georgia, serif', fontSize: '16px', color: '#C9A84C', fontStyle: 'italic', margin: '12px 0 0', textAlign: 'center' }}
              >
                That makes you a {capitalize(signForDerived.label)} ✦
              </motion.p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <PrimaryButton onClick={handleContinue} disabled={!data.star_sign}>Continue</PrimaryButton>
    </div>
  );
}
