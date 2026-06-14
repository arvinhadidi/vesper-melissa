'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { getDailyCardIndex } from '@/lib/cardLogic.js';

// ─── Types ────────────────────────────────────────────────────────────────────

type FocusArea =
  | 'love_relationships'
  | 'family'
  | 'career'
  | 'big_decision'
  | 'healing'
  | 'open';

type OnboardingData = {
  disclaimer_accepted_at: string | null;
  display_name: string;
  star_sign: string | null;
  birth_date: string | null;
  current_mood: string | null;
  notices_signs: string | null;
  focus_area: FocusArea | null;
  relationship_status: string | null;
  life_weight: string | null;
  has_specific_person: string | null;
  micro_pull_card: string | null;
  duration_weight: string | null;
  reading_intent: string[];
  gut_feeling: string | null;
  preferred_checkin_time: string | null;
  email_marketing_consent: boolean;
  email_consent_given_at: string | null;
};

type ScreenId =
  | 'welcome'
  | 'disclaimer'
  | 'name'
  | 'star_sign'
  | 'mood'
  | 'notices_signs'
  | 'focus_area'
  | 'interstitial_focus'
  | 'privacy'
  | 'situation'
  | 'specific_person'
  | 'micro_pull'
  | 'duration'
  | 'reading_intent'
  | 'gut_feeling'
  | 'stat'
  | 'commitment'
  | 'email_checkin'
  | 'synthesis'
  | 'social_proof'
  | 'trial_enabled'
  | 'paywall';

type ScreenProps = {
  data: OnboardingData;
  setData: React.Dispatch<React.SetStateAction<OnboardingData>>;
  goForward: () => void;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const NO_PROGRESS: ScreenId[] = [
  'welcome', 'disclaimer', 'interstitial_focus',
  'micro_pull', 'synthesis', 'social_proof', 'trial_enabled', 'paywall',
];

const NO_BACK: ScreenId[] = ['welcome'];

const VALUE_PROPS = [
  "A daily card reading with Melissa's personal take",
  "Guided spreads for the questions you can't stop thinking about",
  'A private journal to track what the cards have been telling you',
];

const PRICING: Record<string, { symbol: string; monthly: number; yearly: number; savePct: number }> = {
  GBP: { symbol: '£', monthly: 9.99, yearly: 79.99, savePct: 33 },
  USD: { symbol: '$', monthly: 12.99, yearly: 103.99, savePct: 33 },
};
const DEFAULT_CURRENCY = 'GBP';
const TRIAL_DAYS = 3;
const COUNTDOWN_SECONDS = 5 * 60;

const ZODIAC_SIGNS = [
  { value: 'aries', label: 'Aries', glyph: '♈' },
  { value: 'taurus', label: 'Taurus', glyph: '♉' },
  { value: 'gemini', label: 'Gemini', glyph: '♊' },
  { value: 'cancer', label: 'Cancer', glyph: '♋' },
  { value: 'leo', label: 'Leo', glyph: '♌' },
  { value: 'virgo', label: 'Virgo', glyph: '♍' },
  { value: 'libra', label: 'Libra', glyph: '♎' },
  { value: 'scorpio', label: 'Scorpio', glyph: '♏' },
  { value: 'sagittarius', label: 'Sagittarius', glyph: '♐' },
  { value: 'capricorn', label: 'Capricorn', glyph: '♑' },
  { value: 'aquarius', label: 'Aquarius', glyph: '♒' },
  { value: 'pisces', label: 'Pisces', glyph: '♓' },
];

type MicroCard = { name: string; imagePath: string; line: string };

const MICRO_CARDS: MicroCard[] = [
  {
    name: 'The High Priestess',
    imagePath: 'ar02',
    line: "You didn't need the cards for this one. You've known for a while now. The real question is whether you trust yourself enough to act on it.",
  },
  {
    name: 'Two of Wands',
    imagePath: 'wa02',
    line: "You're standing at the edge of this, waiting for permission. Here it is: the choice is yours, and you're already leaning one way.",
  },
  {
    name: 'Wheel of Fortune',
    imagePath: 'ar10',
    line: 'This is already in motion - the answer is being written right now. What you do in the next few weeks matters more than what you asked.',
  },
  {
    name: 'The Star',
    imagePath: 'ar17',
    line: "Whatever you asked: it's going to be okay. Maybe not exactly how you pictured it. But okay.",
  },
  {
    name: 'The Moon',
    imagePath: 'ar18',
    line: "Not everything about this is visible yet - someone or something isn't showing its full face. The answer becomes clear when you watch what's done, not what's said.",
  },
];

const FOCUS_INTERSTITIALS: Record<string, string> = {
  love_relationships: 'Matters of the heart. I had a feeling. Most who find me are carrying someone.',
  family: "The people closest to us pull the strongest threads. Let's look at yours.",
  career: "Purpose questions are never really about work. They're about who you're becoming.",
  big_decision: 'A crossroads. The cards love a crossroads.',
  healing: "You're here to put something down. That takes more courage than holding on.",
  open: 'No agenda. Those are often the most honest readings.',
};

const SYNTHESIS_DURATION: Record<string, string> = {
  recent: "This is fresh - I can feel it.",
  weeks: 'A few weeks of carrying this. I can feel it.',
  months: "It's been months now - I can feel the weight of it.",
  long: "You've carried this longer than you'd like to admit. I can feel the weight of it.",
};

const SYNTHESIS_PERSON: Record<string, string> = {
  yes_someone: "Someone specific. You didn't need to say much.",
  situation: 'A situation with many threads. I see them.',
  about_me: 'This one is about you. Those are the bravest readings.',
};

const SYNTHESIS_GUT: Record<string, string> = {
  optimistic: "Your gut says it works out. Let's see what the cards say.",
  knows: "You said you already know. The cards will confirm it - or challenge it.",
  scared: "You said you're scared to ask. We'll go gently.",
  unsure: "You genuinely don't know. That's why the cards exist.",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getZodiacSign(day: number, month: number): string {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'aquarius';
  return 'pisces';
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ─── Transition variants ──────────────────────────────────────────────────────

function slideVariants(direction: 1 | -1) {
  return {
    initial: { y: direction * 16, opacity: 0 },
    animate: { y: 0, opacity: 1, transition: { duration: 0.3, ease: EASE } },
    exit: { y: direction * -16, opacity: 0, transition: { duration: 0.22, ease: EASE } },
  };
}

// ─── Shared UI components ─────────────────────────────────────────────────────

function ProgressBar({ current, total }: { current: number; total: number }) {
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

function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <>
      {/* Mobile: in-flow */}
      <button
        onClick={onBack}
        aria-label="Go back"
        className="back-btn-mobile"
        style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: '0',
          marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '6px',
          color: 'rgba(250,247,240,0.55)',
          fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '15px',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </button>
      {/* Desktop: fixed top-left */}
      <button
        onClick={onBack}
        aria-label="Go back"
        className="back-btn-desktop"
        style={{
          position: 'fixed', top: '32px', left: '32px', zIndex: 10,
          background: 'none', border: 'none', cursor: 'pointer', padding: '8px 12px',
          display: 'none', alignItems: 'center', gap: '6px',
          color: 'rgba(250,247,240,0.55)',
          fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '15px',
          borderRadius: '8px', transition: 'background 0.15s ease',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </button>
    </>
  );
}

function OptionTile({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
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
        transition: 'border-color 0.15s ease, background 0.15s ease',
      }}
    >
      {label}
    </motion.button>
  );
}

function Heading({ children, sub }: { children: React.ReactNode; sub?: string }) {
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

function PrimaryButton({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
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

function MelissaAvatar({ size = 96, variant = 'default' }: { size?: number; variant?: 'default' | 'thinking' | 'insight' }) {
  const src = variant === 'thinking' ? '/melissa/melissa-thinking.png' : variant === 'insight' ? '/melissa/melissa-insight.png' : '/melissa/melissa-default.png';
  return (
    <div style={{
      display: 'inline-block', flexShrink: 0,
      filter: 'drop-shadow(0 0 18px rgba(201,168,76,0.7)) drop-shadow(0 0 40px rgba(201,168,76,0.35)) drop-shadow(0 0 70px rgba(201,168,76,0.15))',
    }}>
      <Image src={src} alt="Melissa" width={size} height={size}
        style={{
          display: 'block',
          maskImage: 'linear-gradient(to bottom, black 55%, transparent 95%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 55%, transparent 95%)',
        }}
      />
    </div>
  );
}

// ─── Screen components ────────────────────────────────────────────────────────

function ScreenWelcome({ goForward }: Pick<ScreenProps, 'goForward'>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100dvh - 48px)', textAlign: 'center' }}>
      <h1 style={{ fontFamily: 'var(--font-dm-serif-var), serif', fontSize: '42px', fontWeight: 400, color: '#FAF7F0', margin: '0 0 28px', lineHeight: 1.15 }}>
        I&apos;m Melissa.
      </h1>
      <MelissaAvatar size={280} />
      <p style={{ fontFamily: 'var(--font-garamond-var), Georgia, serif', fontSize: '20px', color: 'rgba(250,247,240,0.75)', lineHeight: 1.65, margin: '32px 0 56px', maxWidth: '340px' }}>
        I read the cards so you don&apos;t have to figure them out alone.
      </p>
      <div style={{ width: '100%' }}>
        <PrimaryButton onClick={goForward}>Let&apos;s begin</PrimaryButton>
      </div>
    </div>
  );
}

function ScreenDisclaimer({ setData, goForward }: Pick<ScreenProps, 'setData' | 'goForward'>) {
  const [expanded, setExpanded] = useState(false);

  function handleAccept() {
    setData(d => ({ ...d, disclaimer_accepted_at: new Date().toISOString() }));
    goForward();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100dvh - 120px)', textAlign: 'center' }}>
      <h1 style={{ fontFamily: 'var(--font-dm-serif-var), serif', fontSize: '42px', fontWeight: 400, color: '#FAF7F0', margin: '0 0 20px' }}>
        Before we begin
      </h1>
      <p style={{ fontFamily: 'var(--font-garamond-var), Georgia, serif', fontSize: '18px', color: 'rgba(250,247,240,0.72)', lineHeight: 1.65, margin: '0 0 16px', maxWidth: '360px' }}>
        Vesper is a creative experience for entertainment and self-reflection — not professional advice of any kind.
      </p>
      <button
        onClick={() => setExpanded(e => !e)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '13px', color: '#C9A84C', padding: 0, marginBottom: '24px', textDecoration: 'underline' }}
      >
        {expanded ? 'read less' : 'read more'}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ fontFamily: 'var(--font-garamond-var), Georgia, serif', fontSize: '14px', color: 'rgba(250,247,240,0.5)', lineHeight: 1.65, margin: '0 0 24px', overflow: 'hidden', maxWidth: '360px' }}
          >
            Vesper and Melissa&apos;s readings are for entertainment and self-reflection purposes only. They are not a substitute for professional psychological, medical, financial, or legal advice. If you are in crisis or struggling, please contact a qualified professional or a local crisis line. You must be 18 or older to use Vesper. Readings are generated experiences and no outcome is guaranteed.
          </motion.p>
        )}
      </AnimatePresence>
      <div style={{ width: '100%', maxWidth: '360px' }}>
        <PrimaryButton onClick={handleAccept}>I&apos;m ready</PrimaryButton>
      </div>
    </div>
  );
}

function ScreenName({ data, setData, goForward }: ScreenProps) {
  const [nameInput, setNameInput] = useState(data.display_name);
  const [nameError, setNameError] = useState('');

  function handleContinue() {
    const trimmed = nameInput.trim();
    if (!trimmed) { setNameError('Please enter your name.'); return; }
    if (trimmed.length > 30) { setNameError('Keep it under 30 characters.'); return; }
    setNameError('');
    setData(d => ({ ...d, display_name: trimmed }));
    goForward();
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100dvh - 200px)' }}>
      <div>
        <Heading>What should Melissa call you?</Heading>
        <input
          type="text" value={nameInput}
          onChange={e => { setNameInput(e.target.value); setNameError(''); }}
          onKeyDown={e => { if (e.key === 'Enter') handleContinue(); }}
          placeholder="your name..." maxLength={35} autoFocus
          style={{ width: '100%', padding: '16px', background: 'rgba(250,247,240,0.07)', border: `1px solid ${nameError ? '#E07070' : 'rgba(201,168,76,0.4)'}`, borderRadius: '12px', fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '16px', color: '#FAF7F0', outline: 'none', marginBottom: nameError ? '8px' : '24px', boxSizing: 'border-box' }}
        />
        {nameError && <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '13px', color: '#E07070', margin: '0 0 16px' }}>{nameError}</p>}
      </div>
      <div style={{ marginTop: 'auto' }}>
        <PrimaryButton onClick={handleContinue} disabled={!nameInput.trim()}>Continue</PrimaryButton>
      </div>
    </div>
  );
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

function ScreenStarSign({ data, setData, goForward }: ScreenProps) {
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

      <PrimaryButton onClick={goForward} disabled={!data.star_sign}>Continue</PrimaryButton>
    </div>
  );
}

function ScreenMood({ data, setData, goForward }: ScreenProps) {
  const options = [
    { label: '🌧️  Heavy', value: 'heavy' },
    { label: '🌱  Hopeful', value: 'hopeful' },
    { label: '🌀  Restless', value: 'restless' },
    { label: '🌫️  Numb', value: 'numb' },
    { label: '🤍  Honestly, fine', value: 'fine' },
  ];
  return (
    <div>
      <Heading>How&apos;s your heart today{data.display_name ? `, ${data.display_name}?` : '?'}</Heading>
      {options.map(opt => (
        <OptionTile key={opt.value} label={opt.label} selected={data.current_mood === opt.value}
          onClick={() => { setData(d => ({ ...d, current_mood: opt.value })); setTimeout(goForward, 300); }}
        />
      ))}
    </div>
  );
}

function ScreenNoticesSigns({ data, setData, goForward }: ScreenProps) {
  const options = [
    { label: 'Always', value: 'always' },
    { label: 'I try to', value: 'sometimes' },
    { label: 'I want to get better at it', value: 'learning' },
  ];
  return (
    <div>
      <Heading>When the universe sends you a sign, do you notice?</Heading>
      {options.map(opt => (
        <OptionTile key={opt.value} label={opt.label} selected={data.notices_signs === opt.value}
          onClick={() => { setData(d => ({ ...d, notices_signs: opt.value })); setTimeout(goForward, 300); }}
        />
      ))}
    </div>
  );
}

function ScreenFocusArea({ data, setData, goForward }: ScreenProps) {
  const options: { label: string; value: FocusArea }[] = [
    { label: '💗  Love & Relationships', value: 'love_relationships' },
    { label: '🏡  Family & Loved Ones', value: 'family' },
    { label: '🌟  Career & Purpose', value: 'career' },
    { label: '🔀  A Big Decision', value: 'big_decision' },
    { label: '🕊️  Healing & Letting Go', value: 'healing' },
    { label: '✨  Open to Anything', value: 'open' },
  ];
  return (
    <div>
      <Heading>What are you seeking light on?</Heading>
      {options.map(opt => (
        <OptionTile key={opt.value} label={opt.label} selected={data.focus_area === opt.value}
          onClick={() => {
            setData(d => ({
              ...d, focus_area: opt.value,
              relationship_status: opt.value === 'love_relationships' ? d.relationship_status : null,
              life_weight: opt.value === 'love_relationships' ? null : d.life_weight,
            }));
            setTimeout(goForward, 300);
          }}
        />
      ))}
    </div>
  );
}

function ScreenInterstitialFocus({ data, goForward }: Pick<ScreenProps, 'data' | 'goForward'>) {
  const line = data.focus_area ? FOCUS_INTERSTITIALS[data.focus_area] : '';

  useEffect(() => {
    const t = setTimeout(goForward, 3600);
    return () => clearTimeout(t);
  }, [goForward]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100dvh - 120px)', textAlign: 'center' }}>
      <MelissaAvatar size={240} />
      <motion.p
        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        style={{ fontFamily: 'var(--font-garamond-var), Georgia, serif', fontSize: '21px', fontStyle: 'italic', color: 'rgba(250,247,240,0.85)', textAlign: 'center', lineHeight: 1.6, margin: '36px 0 44px', maxWidth: '360px' }}
      >
        &ldquo;{line}&rdquo;
      </motion.p>
    </div>
  );
}

function ScreenPrivacy({ goForward }: Pick<ScreenProps, 'goForward'>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100dvh - 120px)', textAlign: 'center' }}>
      <p style={{ fontFamily: 'var(--font-dm-serif-var), serif', fontSize: '42px', color: '#FAF7F0', textAlign: 'center', lineHeight: 1.25, margin: '0 0 40px' }}>
        What you tell Melissa stays between you and Melissa.
      </p>
      {/* Gold lock icon — centred in viewport */}
      <svg width="140" height="140" viewBox="0 0 24 24" fill="none" style={{ marginBottom: '40px', filter: 'drop-shadow(0 0 18px rgba(201,168,76,0.7)) drop-shadow(0 0 40px rgba(201,168,76,0.35)) drop-shadow(0 0 70px rgba(201,168,76,0.15))' }}>
        <rect x="5" y="11" width="14" height="10" rx="2" stroke="#C9A84C" strokeWidth="1.5" fill="rgba(201,168,76,0.12)" />
        <path d="M8 11V7a4 4 0 1 1 8 0v4" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="16" r="1.5" fill="#C9A84C" />
      </svg>
      <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '14px', color: 'rgba(250,247,240,0.45)', textAlign: 'center', margin: '0 0 56px' }}>
        Your answers are private and never shared.
      </p>
      <div style={{ width: '100%' }}>
        <PrimaryButton onClick={goForward}>Continue</PrimaryButton>
      </div>
    </div>
  );
}

function ScreenSituation({ data, setData, goForward }: ScreenProps) {
  const isLove = data.focus_area === 'love_relationships';
  const loveOptions = [
    { label: '🌸  Single', value: 'single' },
    { label: '💬  Talking to Someone', value: 'talking' },
    { label: '🌀  Situationship', value: 'situationship' },
    { label: '💔  Healing from a Breakup', value: 'healing_breakup' },
    { label: '💑  In a Relationship', value: 'in_relationship' },
    { label: '🤐  Prefer Not to Say', value: 'prefer_not_say' },
  ];
  const otherOptions = [
    { label: '🫂  A Loved One', value: 'loved_one' },
    { label: '🔭  My Own Future', value: 'own_future' },
    { label: '⚖️  An Impossible Choice', value: 'impossible_choice' },
    { label: '🕯️  Grief or Loss', value: 'grief_loss' },
    { label: '🌊  Something I Can\'t Shake', value: 'cant_shake' },
    { label: '🌫️  Hard to Put Into Words', value: 'unnamed' },
  ];
  const options = isLove ? loveOptions : otherOptions;
  const heading = isLove ? 'What does love look like right now?' : "What's weighing on you most?";
  const sub = isLove ? 'Melissa reads differently for each situation' : undefined;
  const currentVal = isLove ? data.relationship_status : data.life_weight;

  return (
    <div>
      <Heading sub={sub}>{heading}</Heading>
      {options.map(opt => (
        <OptionTile key={opt.value} label={opt.label} selected={currentVal === opt.value}
          onClick={() => {
            setData(d => ({ ...d, relationship_status: isLove ? opt.value : null, life_weight: isLove ? null : opt.value }));
            setTimeout(goForward, 300);
          }}
        />
      ))}
    </div>
  );
}

function ScreenSpecificPerson({ data, setData, goForward }: ScreenProps) {
  const options = [
    { label: "Yes, there's someone", value: 'yes_someone' },
    { label: 'More of a situation', value: 'situation' },
    { label: "It's about me", value: 'about_me' },
  ];
  return (
    <div>
      <Heading>Is there someone specific on your mind?</Heading>
      {options.map(opt => (
        <OptionTile key={opt.value} label={opt.label} selected={data.has_specific_person === opt.value}
          onClick={() => { setData(d => ({ ...d, has_specific_person: opt.value })); setTimeout(goForward, 300); }}
        />
      ))}
    </div>
  );
}


const MICRO_CARD_INDICES: Record<string, number> = { ar02: 2, wa02: 23, ar10: 10, ar17: 17, ar18: 18 };

function ScreenMicroPull({ setData, goForward }: Pick<ScreenProps, 'setData' | 'goForward'>) {
  const [flipped, setFlipped] = useState(false);
  const [selectedCard, setSelectedCard] = useState<MicroCard | null>(null);
  const [displayedText, setDisplayedText] = useState('');
  const [typingDone, setTypingDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [excludedIndex, setExcludedIndex] = useState<number | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const now = new Date();
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      setExcludedIndex(getDailyCardIndex(user.id, dateStr));
    });
  }, []);

  const CARD_W = 150;
  const CARD_H = Math.round(CARD_W * 1.75);

  function handleDeckTap() {
    if (flipped) return;
    const pool = excludedIndex !== null
      ? MICRO_CARDS.filter(c => MICRO_CARD_INDICES[c.imagePath] !== excludedIndex)
      : MICRO_CARDS;
    const card = pool[Math.floor(Math.random() * pool.length)];
    setSelectedCard(card);
    setFlipped(true);
    setData(d => ({ ...d, micro_pull_card: card.name }));
  }

  useEffect(() => {
    if (!flipped || !selectedCard) return;
    const full = selectedCard.line;
    let i = 0;
    intervalRef.current = setInterval(() => {
      i++;
      setDisplayedText(full.slice(0, i));
      if (i >= full.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setTypingDone(true);
      }
    }, 22);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [flipped, selectedCard]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <h1 style={{ fontFamily: 'var(--font-dm-serif-var), serif', fontSize: '42px', fontWeight: 400, color: '#FAF7F0', margin: '0 0 10px', lineHeight: 1.25 }}>
        Think of a yes or no question.
      </h1>
      <p style={{ fontFamily: 'var(--font-garamond-var), Georgia, serif', fontSize: '17px', color: 'rgba(250,247,240,0.6)', lineHeight: 1.6, margin: '0 0 40px' }}>
        Don&apos;t tell me. Just hold it. Then tap the deck.
      </p>

      <div style={{ marginBottom: '36px', perspective: '900px' }}>
        <motion.div
          onClick={handleDeckTap}
          style={{ width: CARD_W, height: CARD_H, position: 'relative', cursor: flipped ? 'default' : 'pointer', transformStyle: 'preserve-3d' }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Card back */}
          <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', borderRadius: '12px', overflow: 'hidden' }}>
            <motion.div
              animate={!flipped ? { boxShadow: ['0 0 16px rgba(201,168,76,0.2)', '0 0 40px rgba(201,168,76,0.5)', '0 0 16px rgba(201,168,76,0.2)'] } : { boxShadow: '0 0 8px rgba(201,168,76,0.15)' }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden' }}
            >
              <Image src="/card-back.png" alt="Card deck" width={CARD_W} height={CARD_H} style={{ objectFit: 'cover', width: '100%', height: '100%', display: 'block' }} />
            </motion.div>
          </div>
          {/* Card front — actual image */}
          <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}>
            {selectedCard && (
              <Image
                src={`/cards-cropped/${selectedCard.imagePath}.png`}
                alt={selectedCard.name}
                width={CARD_W} height={CARD_H}
                style={{ objectFit: 'cover', width: '100%', height: '100%', display: 'block' }}
              />
            )}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {flipped && selectedCard && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', marginBottom: '24px' }}>
            <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '12px', letterSpacing: '2.5px', textTransform: 'uppercase', color: '#C9A84C', margin: '0 0 10px', textAlign: 'center' }}>
              {selectedCard.name}
            </p>
            <p style={{ fontFamily: 'var(--font-garamond-var), Georgia, serif', fontSize: '18px', fontStyle: 'italic', color: 'rgba(250,247,240,0.85)', lineHeight: 1.65, textAlign: 'center', margin: 0 }}>
              {displayedText}
              {!typingDone && (
                <motion.span
                  animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                  style={{ display: 'inline-block', width: '2px', height: '17px', background: '#C9A84C', marginLeft: '2px', verticalAlign: 'middle' }}
                />
              )}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {typingDone && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ width: '100%' }}>
            <PrimaryButton onClick={goForward}>Continue</PrimaryButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ScreenDuration({ data, setData, goForward }: ScreenProps) {
  const options = [
    { label: '🌱  Just recently', value: 'recent' },
    { label: '📅  A few weeks', value: 'weeks' },
    { label: '🌒  Months now', value: 'months' },
    { label: '🪨  Longer than I\'d like to admit', value: 'long' },
  ];
  return (
    <div>
      <Heading>How long has this been with you?</Heading>
      {options.map(opt => (
        <OptionTile key={opt.value} label={opt.label} selected={data.duration_weight === opt.value}
          onClick={() => { setData(d => ({ ...d, duration_weight: opt.value })); setTimeout(goForward, 300); }}
        />
      ))}
    </div>
  );
}

function ScreenReadingIntent({ data, setData, goForward }: ScreenProps) {
  const options = [
    { label: '🔦  Clarity', value: 'clarity' },
    { label: '🪶  A Sign', value: 'sign' },
    { label: '🤝  Whether to Hold On', value: 'hold_on' },
    { label: '🗺️  What I Need to Do', value: 'what_to_do' },
    { label: '🌤️  That Things Will Be Okay', value: 'things_okay' },
    { label: '🕊️  Permission to Let Go', value: 'let_go' },
  ];
  function toggle(value: string) {
    setData(d => {
      const has = d.reading_intent.includes(value);
      if (has) return { ...d, reading_intent: d.reading_intent.filter(v => v !== value) };
      if (d.reading_intent.length >= 2) return d;
      return { ...d, reading_intent: [...d.reading_intent, value] };
    });
  }
  return (
    <div>
      <Heading sub="Pick up to 2">What are you hoping Melissa will show you?</Heading>
      {options.map(opt => (
        <OptionTile key={opt.value} label={opt.label} selected={data.reading_intent.includes(opt.value)} onClick={() => toggle(opt.value)} />
      ))}
      <div style={{ marginTop: '8px' }}>
        <PrimaryButton onClick={goForward} disabled={data.reading_intent.length === 0}>Continue</PrimaryButton>
      </div>
    </div>
  );
}

function ScreenGutFeeling({ data, setData, goForward }: ScreenProps) {
  const options = [
    { label: "🌅  That it's going to work out", value: 'optimistic' },
    { label: '🔮  That I already know the answer', value: 'knows' },
    { label: "😶‍🌫️  Honestly, I'm scared to ask", value: 'scared' },
    { label: "🌫️  I genuinely don't know", value: 'unsure' },
  ];
  return (
    <div>
      <Heading>What does your gut already say?</Heading>
      {options.map(opt => (
        <OptionTile key={opt.value} label={opt.label} selected={data.gut_feeling === opt.value}
          onClick={() => { setData(d => ({ ...d, gut_feeling: opt.value })); setTimeout(goForward, 300); }}
        />
      ))}
    </div>
  );
}

function ScreenStat({ goForward }: Pick<ScreenProps, 'goForward'>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100dvh - 120px)', textAlign: 'center' }}>
      <MelissaAvatar size={240} variant="thinking" />
      <p style={{ fontFamily: 'var(--font-dm-serif-var), serif', fontSize: '28px', fontWeight: 400, color: '#FAF7F0', textAlign: 'center', lineHeight: 1.4, margin: '36px 0 48px' }}>
        Most members say their first reading named something they hadn&apos;t said out loud yet.
      </p>
      <div style={{ width: '100%' }}>
        <PrimaryButton onClick={goForward}>Continue</PrimaryButton>
      </div>
    </div>
  );
}

function ScreenCommitment({ goForward }: Pick<ScreenProps, 'goForward'>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: 'calc(100dvh - 120px)', textAlign: 'center', paddingTop: '48px' }}>
      <h1 style={{ fontFamily: 'var(--font-dm-serif-var), serif', fontSize: '42px', fontWeight: 400, color: '#FAF7F0', margin: '0 0 48px', lineHeight: 1.25 }}>
        Readings build on each other.
      </h1>
      <div style={{ marginBottom: '48px', filter: 'drop-shadow(0 0 12px rgba(201,168,76,0.6)) drop-shadow(0 0 32px rgba(201,168,76,0.35)) drop-shadow(0 0 56px rgba(201,168,76,0.2))' }}>
        <svg width="260" height="130" viewBox="0 0 200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 50c-8-16-24-30-42-30-22 0-40 14-40 30s18 30 40 30c18 0 34-14 42-30zm0 0c8 16 24 30 42 30 22 0 40-14 40-30S164 20 142 20c-18 0-34 14-42 30z" stroke="#C9A84C" strokeWidth="5" strokeLinecap="round" fill="none" />
        </svg>
      </div>
      <p style={{ fontFamily: 'var(--font-garamond-var), Georgia, serif', fontSize: '19px', color: 'rgba(250,247,240,0.72)', lineHeight: 1.65, margin: '0 0 48px' }}>
        Melissa asks one thing - come back tomorrow. The cards remember where you left off.
      </p>
      <PrimaryButton onClick={goForward}>I can do that.</PrimaryButton>
    </div>
  );
}

function ScreenEmailCheckin({ data, setData, goForward }: ScreenProps) {
  const [consentChecked, setConsentChecked] = useState<boolean>(true);
  const [selectedTime, setSelectedTime] = useState<string | null>(data.preferred_checkin_time ?? 'morning');

  const timeOptions = [
    { label: 'Morning (7-9am)', value: 'morning' },
    { label: 'Lunchtime (12-2pm)', value: 'lunchtime' },
    { label: 'Evening (6-8pm)', value: 'evening' },
    { label: 'Night (9-11pm)', value: 'night' },
    { label: 'No thanks', value: null as string | null },
  ];

  function handleTimeSelect(value: string | null) {
    setSelectedTime(value);
    if (value !== null) { setConsentChecked(true); } else { setConsentChecked(false); }
  }

  function handleContinue() {
    setData(d => ({
      ...d, preferred_checkin_time: selectedTime, email_marketing_consent: consentChecked,
      email_consent_given_at: consentChecked ? new Date().toISOString() : null,
    }));
    goForward();
  }

  return (
    <div>
      <Heading sub="She'll send daily reminders by email - unsubscribe any time">
        When would you like Melissa to check in?
      </Heading>
      {timeOptions.map(opt => {
        const active = selectedTime === opt.value;
        return (
          <motion.button key={opt.value ?? 'none'} onClick={() => handleTimeSelect(opt.value)}
            animate={active ? { scale: 1.01 } : { scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            style={{ width: '100%', padding: '18px 20px', border: `1px solid ${active ? '#C9A84C' : 'rgba(201,168,76,0.3)'}`, borderRadius: '14px', marginBottom: '12px', background: active ? 'rgba(201,168,76,0.15)' : 'rgba(250,247,240,0.04)', boxShadow: active ? 'inset 0 0 12px rgba(201,168,76,0.08)' : 'none', fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '16px', color: active ? '#FAF7F0' : 'rgba(250,247,240,0.8)', cursor: 'pointer', textAlign: 'center', transition: 'border-color 0.15s ease, background 0.15s ease' }}
          >
            {opt.label}
          </motion.button>
        );
      })}
      <div style={{ marginTop: '4px', marginBottom: '24px' }}>
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
          <div
            onClick={() => { if (selectedTime !== null) setConsentChecked(c => !c); }}
            style={{ width: '22px', height: '22px', minWidth: '22px', border: `2px solid ${consentChecked ? '#C9A84C' : 'rgba(201,168,76,0.4)'}`, borderRadius: '6px', background: consentChecked ? '#C9A84C' : 'transparent', opacity: selectedTime === null ? 0.35 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '2px', transition: 'background 0.15s ease, border-color 0.15s ease', cursor: selectedTime === null ? 'default' : 'pointer' }}
          >
            {consentChecked && (
              <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
                <path d="M1 5l4 4 7-8" stroke="#1E1256" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <div>
            <span style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '14px', color: 'rgba(250,247,240,0.8)', lineHeight: 1.4, display: 'block' }}>
              Send me my daily reading and updates from Vesper
            </span>
            <span style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '12px', color: 'rgba(250,247,240,0.4)', lineHeight: 1.4, display: 'block', marginTop: '2px' }}>
              You can unsubscribe any time. We&apos;ll never share your email.
            </span>
          </div>
        </label>
      </div>
      <PrimaryButton onClick={handleContinue}>Continue</PrimaryButton>
    </div>
  );
}

function ScreenSynthesis({ data, goForward }: Pick<ScreenProps, 'data' | 'goForward'>) {
  const [lineIndex, setLineIndex] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);
  const advancedRef = useRef(false);

  const signLabel = ZODIAC_SIGNS.find(s => s.value === data.star_sign)?.label ?? data.star_sign ?? '';
  const durationFrag = data.duration_weight ? SYNTHESIS_DURATION[data.duration_weight] ?? '' : '';
  const personLine = data.has_specific_person ? SYNTHESIS_PERSON[data.has_specific_person] ?? '' : '';
  const gutLine = data.gut_feeling ? SYNTHESIS_GUT[data.gut_feeling] ?? '' : '';

  const lines = [
    `Reading your energy, ${data.display_name || 'you'}...`,
    `A ${signLabel}. ${durationFrag}`,
    personLine,
    gutLine,
    'Choosing your spread... three cards.',
    "Here's your first one.",
  ].filter(Boolean);

  const CARD_W = 110;
  const CARD_H = Math.round(CARD_W * 1.75);

  useEffect(() => {
    if (lineIndex >= lines.length) {
      // All lines shown — flip the card, then advance
      const flipTimer = setTimeout(() => setCardFlipped(true), 400);
      const advTimer = setTimeout(() => {
        if (!advancedRef.current) {
          advancedRef.current = true;
          goForward();
        }
      }, 3380);
      return () => { clearTimeout(flipTimer); clearTimeout(advTimer); };
    }
    const t = setTimeout(() => setLineIndex(i => i + 1), 1820);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineIndex, goForward]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '32px' }}>
      {/* Card deck / first card reveal */}
      <div style={{ marginBottom: '40px', perspective: '800px' }}>
        <motion.div
          style={{ width: CARD_W, height: CARD_H, position: 'relative', transformStyle: 'preserve-3d' }}
          animate={{ rotateY: cardFlipped ? 180 : 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Stack of three cards behind (only visible pre-flip) */}
          {!cardFlipped && [2, 1].map(i => (
            <motion.div key={i}
              style={{ position: 'absolute', width: CARD_W, height: CARD_H, left: i * 5, top: i * 4, borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.35)' }}
              animate={{ rotate: [0, i === 1 ? 1.5 : -1.5, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
            >
              <Image src="/card-back.png" alt="" width={CARD_W} height={CARD_H} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
            </motion.div>
          ))}
          {/* Front card */}
          <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
            <Image src="/card-back.png" alt="" width={CARD_W} height={CARD_H} style={{ objectFit: 'cover', width: '100%', height: '100%', display: 'block' }} />
          </div>
          {/* Card face — micro-pull card or generic first card image */}
          <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 0 32px rgba(201,168,76,0.4), 0 4px 16px rgba(0,0,0,0.5)' }}>
            {data.micro_pull_card && MICRO_CARDS.find(c => c.name === data.micro_pull_card) ? (
              <Image
                src={`/cards-cropped/${MICRO_CARDS.find(c => c.name === data.micro_pull_card)!.imagePath}.png`}
                alt={data.micro_pull_card}
                width={CARD_W} height={CARD_H}
                style={{ objectFit: 'cover', width: '100%', height: '100%', display: 'block' }}
              />
            ) : (
              <Image src="/card-back.png" alt="" width={CARD_W} height={CARD_H} style={{ objectFit: 'cover', width: '100%', height: '100%', display: 'block' }} />
            )}
          </div>
        </motion.div>
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {lines.slice(0, lineIndex).map((line, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}
          >
            <span style={{ color: '#C9A84C', fontSize: '14px', flexShrink: 0, marginTop: '3px' }}>✦</span>
            <p style={{ fontFamily: 'var(--font-garamond-var), Georgia, serif', fontSize: '17px', fontStyle: 'italic', color: 'rgba(250,247,240,0.85)', lineHeight: 1.55, margin: 0 }}>
              {line}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ScreenSocialProof({ goForward }: Pick<ScreenProps, 'goForward'>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100dvh - 120px)' }}>
      <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '12px', fontWeight: 500, letterSpacing: '2.5px', textTransform: 'uppercase', color: '#C9A84C', margin: '0 0 20px' }}>
        VESPER
      </p>
      <h1 style={{ fontFamily: 'var(--font-dm-serif-var), serif', fontSize: '50px', fontWeight: 400, color: '#FAF7F0', textAlign: 'center', margin: '0 0 28px', lineHeight: 1.25 }}>
        You&apos;re in good company
      </h1>
      <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '19px', fontWeight: 500, color: '#FAF7F0', textAlign: 'center', margin: '0 0 40px' }}>
        Readers have used Melissa <span style={{ color: '#C9A84C' }}>5000+</span> times to:
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '32px' }}>
        {([
          <>Pull <span style={{ color: '#C9A84C' }}>spreads</span> with readings made for them</>,
          <>Start each morning with a <span style={{ color: '#C9A84C' }}>daily card</span></>,
          <><span style={{ color: '#C9A84C' }}>Journal</span> and discover what the cards keep saying</>,
          <>Get <span style={{ color: '#C9A84C' }}>clarity</span> on that one person or situation</>,
        ] as React.ReactNode[]).map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ color: '#C9A84C', fontSize: '18px', flexShrink: 0 }}>✓</span>
            <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '16px', fontWeight: 500, color: 'rgba(250,247,240,0.9)', margin: 0, lineHeight: 1.5 }}>{item}</p>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '24px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '6px' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(201,168,76,0.2)', border: '1.5px solid rgba(201,168,76,0.5)', marginLeft: i === 0 ? 0 : -10, flexShrink: 0 }} />
            ))}
          </div>
          <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '12px', fontWeight: 500, color: 'rgba(250,247,240,0.55)', margin: 0 }}>
            Loved by women everywhere
          </p>
        </div>
        <div style={{ width: '1px', height: '40px', background: 'rgba(201,168,76,0.4)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-dm-serif-var), serif', fontSize: '28px', fontWeight: 400, color: '#FAF7F0' }}>4.9</span>
          <div style={{ display: 'flex', gap: '2px', marginTop: '2px' }}>
            {[0, 1, 2, 3, 4].map(i => <span key={i} style={{ color: '#C9A84C', fontSize: '13px' }}>★</span>)}
          </div>
        </div>
      </div>
      <div style={{ width: '100%' }}>
        <PrimaryButton onClick={goForward}>Continue</PrimaryButton>
      </div>
    </div>
  );
}

function ScreenTrialEnabled({ goForward }: Pick<ScreenProps, 'goForward'>) {
  useEffect(() => {
    const timer = setTimeout(goForward, 2500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div onClick={goForward} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100dvh - 48px)', cursor: 'pointer' }}>
      <motion.div
        style={{ width: '72px', height: '36px', borderRadius: '18px', background: 'rgba(30,18,86,0.6)', position: 'relative', marginBottom: '32px' }}
        animate={{ background: '#C9A84C' }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
        <motion.div
          style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#FAF7F0', position: 'absolute', top: '4px', left: '4px' }}
          animate={{ left: '40px' }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 400, damping: 20 }}
        />
        <motion.div
          style={{ position: 'absolute', inset: '-20px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.3) 0%, transparent 70%)', opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.4 }}
        style={{ textAlign: 'center' }}
      >
        <p style={{ fontFamily: 'var(--font-dm-serif-var), serif', fontSize: '24px', color: '#FAF7F0', margin: '0 0 10px', lineHeight: 1.3 }}>
          Your 3-day free trial is enabled ✦
        </p>
        <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '14px', color: 'rgba(250,247,240,0.6)', margin: 0 }}>
          No payment yet — you&apos;ll choose your plan next.
        </p>
      </motion.div>
    </div>
  );
}

type PaywallProps = { data: OnboardingData; onStartTrial: () => void };

function ScreenPaywall({ data, onStartTrial }: PaywallProps) {
  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly'>('yearly');
  const [secondsLeft, setSecondsLeft] = useState(COUNTDOWN_SECONDS);
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);

  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(d => { if (d.currency === 'USD') setCurrency('USD'); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const t = setInterval(() => setSecondsLeft(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const p = PRICING[currency] ?? PRICING[DEFAULT_CURRENCY];
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timerStr = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  return (
    <div className="paywall-grid">
      {/* Left column: main paywall content */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        {/* Countdown banner */}
        <div style={{ width: '100%', marginBottom: '24px', padding: '10px 16px', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>✦</span>
          <span style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '14px', color: 'rgba(250,247,240,0.8)' }}>
            Your free trial is reserved for: <span style={{ color: '#C9A84C', fontWeight: 600 }}>{timerStr}</span>
          </span>
        </div>

        <h1 style={{ fontFamily: 'var(--font-dm-serif-var), serif', fontSize: '38px', fontWeight: 400, color: '#FAF7F0', margin: '0 0 20px', textAlign: 'center', lineHeight: 1.25 }}>
          Try Vesper <span style={{ color: '#C9A84C' }}>free for {TRIAL_DAYS} days</span>
        </h1>

        {/* Melissa avatar */}
        <div style={{ marginBottom: '24px' }}>
          <MelissaAvatar size={132} variant="insight" />
        </div>

        {/* Value props */}
        <div style={{ width: '100%', marginBottom: '28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {VALUE_PROPS.map((prop, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', textAlign: 'left' }}>
              <span style={{ color: '#C9A84C', fontSize: '16px', marginTop: '1px', flexShrink: 0 }}>✓</span>
              <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '15px', color: 'rgba(250,247,240,0.85)', margin: 0, lineHeight: 1.5 }}>{prop}</p>
            </div>
          ))}
        </div>

        {/* Plan picker */}
        <div style={{ width: '100%', marginBottom: '24px', display: 'flex', gap: '10px' }}>
          <button onClick={() => setSelectedPlan('yearly')} style={{ position: 'relative', flex: 1, padding: '16px 12px', border: `1.5px solid ${selectedPlan === 'yearly' ? '#C9A84C' : 'rgba(201,168,76,0.3)'}`, borderRadius: '14px', background: selectedPlan === 'yearly' ? 'rgba(201,168,76,0.12)' : 'rgba(250,247,240,0.04)', cursor: 'pointer', textAlign: 'center', transition: 'border-color 0.15s ease, background 0.15s ease' }}>
            <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: '#C9A84C', color: '#1E1256', fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', letterSpacing: '0.3px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Save {p.savePct}%</span>
            <span style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '16px', fontWeight: 600, color: '#FAF7F0', display: 'block' }}>Yearly</span>
            <span style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '20px', fontWeight: 700, color: '#FAF7F0', display: 'block', marginTop: '4px' }}>{p.symbol}{p.yearly}</span>
          </button>
          <button onClick={() => setSelectedPlan('monthly')} style={{ flex: 1, padding: '16px 12px', border: `1.5px solid ${selectedPlan === 'monthly' ? '#C9A84C' : 'rgba(201,168,76,0.3)'}`, borderRadius: '14px', background: selectedPlan === 'monthly' ? 'rgba(201,168,76,0.12)' : 'rgba(250,247,240,0.04)', cursor: 'pointer', textAlign: 'center', transition: 'border-color 0.15s ease, background 0.15s ease' }}>
            <span style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '16px', fontWeight: 600, color: '#FAF7F0', display: 'block' }}>Monthly</span>
            <span style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '20px', fontWeight: 700, color: '#FAF7F0', display: 'block', marginTop: '4px' }}>{p.symbol}{p.monthly}</span>
          </button>
        </div>

        {/* CTA */}
        <div style={{ width: '100%' }}>
          <PrimaryButton onClick={onStartTrial}>Try Vesper for {p.symbol}0</PrimaryButton>
        </div>
        <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '13px', color: 'rgba(250,247,240,0.45)', textAlign: 'center', margin: '12px 0 0' }}>
          Cancel anytime during your trial.
        </p>
      </div>

      {/* Right column: trial timeline (desktop only) */}
      <div className="paywall-timeline" style={{ alignSelf: 'stretch', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <MelissaAvatar size={150} />
          <p style={{ fontFamily: 'var(--font-dm-serif-var), serif', fontSize: '28px', fontStyle: 'italic', color: 'rgba(250,247,240,0.75)', margin: '16px 0 0' }}>
            Here&apos;s how it works...
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <span style={{ fontSize: '20px', flexShrink: 0 }}>🔓</span>
            <div>
              <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '15px', fontWeight: 600, color: '#FAF7F0', margin: '0 0 4px' }}>Today</p>
              <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '13px', color: 'rgba(250,247,240,0.6)', margin: 0, lineHeight: 1.4 }}>Full access unlocked, instantly.</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <span style={{ fontSize: '20px', flexShrink: 0 }}>✨</span>
            <div>
              <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '15px', fontWeight: 600, color: '#FAF7F0', margin: '0 0 4px' }}>Enjoy your free trial</p>
              <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '13px', color: 'rgba(250,247,240,0.6)', margin: 0, lineHeight: 1.4 }}>Daily readings, spreads, journal. All yours.</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <span style={{ fontSize: '20px', flexShrink: 0 }}>📅</span>
            <div>
              <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '15px', fontWeight: 600, color: '#FAF7F0', margin: '0 0 4px' }}>Day {TRIAL_DAYS}</p>
              <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '13px', color: 'rgba(250,247,240,0.6)', margin: 0, lineHeight: 1.4 }}>
                Trial ends and your {selectedPlan === 'yearly' ? `${p.symbol}${p.yearly}/year` : `${p.symbol}${p.monthly}/month`} subscription begins. Cancel anytime before.
              </p>
            </div>
          </div>
        </div>
      </div>

      <span style={{ display: 'none' }}>{data.display_name}</span>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();

  const [data, setData] = useState<OnboardingData>({
    disclaimer_accepted_at: null,
    display_name: '',
    star_sign: null,
    birth_date: null,
    current_mood: null,
    notices_signs: null,
    focus_area: null,
    relationship_status: null,
    life_weight: null,
    has_specific_person: null,
    micro_pull_card: null,
    duration_weight: null,
    reading_intent: [],
    gut_feeling: null,
    preferred_checkin_time: null,
    email_marketing_consent: false,
    email_consent_given_at: null,
  });

  const [currentScreenId, setCurrentScreenId] = useState<ScreenId>('welcome');
  const [direction, setDirection] = useState<1 | -1>(1);
  const supabaseWriteFired = useRef(false);

  function buildScreens(): ScreenId[] {
    const base: ScreenId[] = [
      'welcome', 'disclaimer', 'name', 'star_sign', 'mood',
      'notices_signs', 'focus_area', 'interstitial_focus', 'privacy', 'situation',
      'specific_person',
    ];
    base.push('micro_pull', 'duration', 'reading_intent', 'gut_feeling', 'stat', 'commitment', 'email_checkin', 'synthesis', 'social_proof', 'trial_enabled', 'paywall');
    return base;
  }

  const screens = buildScreens();
  const currentIndex = screens.indexOf(currentScreenId);
  const progressScreens = screens.filter(s => !NO_PROGRESS.includes(s));
  const progressIndex = progressScreens.indexOf(currentScreenId);
  const showProgress = progressIndex >= 0;
  const showBack = !NO_BACK.includes(currentScreenId);

  function goForward() {
    setDirection(1);
    const next = screens[currentIndex + 1];
    if (next) setCurrentScreenId(next);
  }

  function goBack() {
    setDirection(-1);
    const prev = screens[currentIndex - 1];
    if (prev) setCurrentScreenId(prev);
  }

  // Analytics
  useEffect(() => {
    console.log('[onboarding]', 'onboarding_step_viewed', { step: currentScreenId });
  }, [currentScreenId]);

  // Supabase write on reaching paywall — fires once, before any payment action
  useEffect(() => {
    if (currentScreenId !== 'paywall' || supabaseWriteFired.current) return;
    supabaseWriteFired.current = true;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.from('user_profiles').upsert({
        id: user.id,
        display_name: data.display_name || null,
        star_sign: data.star_sign || null,
        birth_date: data.birth_date || null,
        focus_area: data.focus_area || null,
        relationship_status: data.relationship_status || null,
        life_weight: data.life_weight || null,
        has_specific_person: data.has_specific_person || null,
        reading_intent: data.reading_intent,
        current_mood: data.current_mood || null,
        notices_signs: data.notices_signs || null,
        duration_weight: data.duration_weight || null,
        gut_feeling: data.gut_feeling || null,
        micro_pull_card: data.micro_pull_card || null,
        disclaimer_accepted_at: data.disclaimer_accepted_at || null,
        preferred_checkin_time: data.preferred_checkin_time || null,
        email_marketing_consent: data.email_marketing_consent,
        email_consent_given_at: data.email_consent_given_at || null,
      }, { onConflict: 'id' });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentScreenId]);

  function handleStartTrial() {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('user_profiles').upsert({
          id: user.id,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
          subscription_status: 'trial',
          trial_started_at: new Date().toISOString(),
        }, { onConflict: 'id' });
      }
    });
    localStorage.setItem('vesper_onboarding', JSON.stringify(data));
    localStorage.setItem('vesper_trial_started', 'true');
    localStorage.setItem('vesper_trial_start_date', new Date().toISOString());
    router.push('/daily');
  }

  const sp: ScreenProps = { data, setData, goForward };

  const screenNode: React.ReactNode = (() => {
    switch (currentScreenId) {
      case 'welcome':           return <ScreenWelcome goForward={goForward} />;
      case 'disclaimer':        return <ScreenDisclaimer setData={setData} goForward={goForward} />;
      case 'name':              return <ScreenName {...sp} />;
      case 'star_sign':         return <ScreenStarSign {...sp} />;
      case 'mood':              return <ScreenMood {...sp} />;
      case 'notices_signs':     return <ScreenNoticesSigns {...sp} />;
      case 'focus_area':        return <ScreenFocusArea {...sp} />;
      case 'interstitial_focus': return <ScreenInterstitialFocus data={data} goForward={goForward} />;
      case 'privacy':           return <ScreenPrivacy goForward={goForward} />;
      case 'situation':         return <ScreenSituation {...sp} />;
      case 'specific_person':   return <ScreenSpecificPerson {...sp} />;
      case 'micro_pull':        return <ScreenMicroPull setData={setData} goForward={goForward} />;
      case 'duration':          return <ScreenDuration {...sp} />;
      case 'reading_intent':    return <ScreenReadingIntent {...sp} />;
      case 'gut_feeling':       return <ScreenGutFeeling {...sp} />;
      case 'stat':              return <ScreenStat goForward={goForward} />;
      case 'commitment':        return <ScreenCommitment goForward={goForward} />;
      case 'email_checkin':     return <ScreenEmailCheckin {...sp} />;
      case 'synthesis':         return <ScreenSynthesis data={data} goForward={goForward} />;
      case 'social_proof':      return <ScreenSocialProof goForward={goForward} />;
      case 'trial_enabled':    return <ScreenTrialEnabled goForward={goForward} />;
      case 'paywall':           return <ScreenPaywall data={data} onStartTrial={handleStartTrial} />;
    }
  })();

  const variants = slideVariants(direction);

  const isPaywall = currentScreenId === 'paywall';

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', justifyContent: 'center' }}>
      {/* Radial depth gradient over the starfield */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(40,24,120,0.45) 0%, transparent 70%)' }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: isPaywall ? '900px' : '480px', minHeight: '100dvh', padding: '0 28px 80px', display: 'flex', flexDirection: 'column', overflowX: 'hidden', transition: 'max-width 0.3s ease' }}>
        {showProgress && <div style={{ paddingTop: '32px' }}><ProgressBar current={progressIndex + 1} total={progressScreens.length} /></div>}
        {!showProgress && <div style={{ height: '32px' }} />}
        {showBack && <BackButton onBack={goBack} />}

        <div style={{ flex: 1 }}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={currentScreenId} variants={variants} initial="initial" animate="animate" exit="exit">
              {screenNode}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
