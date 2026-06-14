'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { saveJournalEntry } from '@/lib/journal';
import { setTourActive } from '@/lib/tour';
import type { UserProfile } from '@/lib/types';

const PHASES = [
  { label: 'Writing your notes to Melissa', duration: 1800 },
  { label: 'Reading your energy', duration: 1600 },
  { label: 'Spiritually connecting to you', duration: 1800 },
  { label: 'Drawing your first cards', duration: 1400 },
  { label: 'Channelling your reading', duration: 2000 },
  { label: 'Almost there...', duration: 1000 },
];

const TOTAL_PHASE_MS = PHASES.reduce((sum, p) => sum + p.duration, 0);

type Payload = { userProfile: UserProfile; spreadTimestamp: number; microPullCard: string | null };

const MICRO_CARDS = [
  { name: 'The High Priestess', imagePath: 'ar02', line: "You didn't need the cards for this one. You've known for a while now. The real question is whether you trust yourself enough to act on it." },
  { name: 'Two of Wands', imagePath: 'wa02', line: "You're standing at the edge of this, waiting for permission. Here it is: the choice is yours, and you're already leaning one way." },
  { name: 'Wheel of Fortune', imagePath: 'ar10', line: 'This is already in motion - the answer is being written right now. What you do in the next few weeks matters more than what you asked.' },
  { name: 'The Star', imagePath: 'ar17', line: "Whatever you asked: it's going to be okay. Maybe not exactly how you pictured it. But okay." },
  { name: 'The Moon', imagePath: 'ar18', line: "Not everything about this is visible yet - someone or something isn't showing its full face. The answer becomes clear when you watch what's done, not what's said." },
] as const;
const MICRO_CARD_INDICES: Record<string, number> = { ar02: 2, wa02: 23, ar10: 10, ar17: 17, ar18: 18 };

export default function PersonalisationPage() {
  const router = useRouter();
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const apiResultRef = useRef<Record<string, unknown> | null>(null);
  const apiDoneRef = useRef(false);
  const animDoneRef = useRef(false);
  const hasNavigatedRef = useRef(false);
  const payloadRef = useRef<Payload | null>(null);

  // Kick off DB write + API call immediately — both run in parallel with animation
  useEffect(() => {
    async function init() {
      const raw = localStorage.getItem('vesper_personalisation_payload');
      if (!raw) { router.replace('/main'); return; }

      let payload: Payload;
      try { payload = JSON.parse(raw); } catch { router.replace('/main'); return; }

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        payload.userProfile = { ...payload.userProfile, id: user.id };
        // Await the upsert so middleware sees the updated profile when we navigate
        await supabase.from('user_profiles').upsert({
          id: user.id,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
          subscription_status: 'trial',
          trial_started_at: new Date().toISOString(),
        }, { onConflict: 'id' });
      }

      payloadRef.current = payload;

      // Fire tour-setup API (non-blocking)
      fetch('/api/tour-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProfile: payload.userProfile,
          spreadTimestamp: payload.spreadTimestamp,
        }),
      })
        .then(r => r.json())
        .then((tourData: Record<string, unknown>) => {
          apiResultRef.current = tourData;
          apiDoneRef.current = true;
          maybeFinish();
        })
        .catch(() => {
          apiDoneRef.current = true;
          maybeFinish();
        });
    }

    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function maybeFinish() {
    if (!apiDoneRef.current || !animDoneRef.current || hasNavigatedRef.current) return;
    if (!payloadRef.current) return;
    hasNavigatedRef.current = true;
    finalize(payloadRef.current);
  }

  function finalize(payload: Payload) {
    const tourData = apiResultRef.current;
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    if (payload.microPullCard) {
      const microCard = MICRO_CARDS.find(c => c.name === payload.microPullCard);
      const microCardIndex = microCard ? MICRO_CARD_INDICES[microCard.imagePath] : -1;
      if (microCardIndex >= 0 && microCard) {
        saveJournalEntry({
          id: `daily-${dateStr}`,
          type: 'daily',
          savedAt: now.toISOString(),
          questionText: null,
          cards: [{ cardIndex: microCardIndex, isReversed: false }],
          positionLabels: null,
          melissaText: microCard.line,
          impression: null,
          resonanceRating: null,
          emojiReaction: null,
        });
      }
    }

    if (tourData && Array.isArray(tourData.spreadCards)) {
      saveJournalEntry({
        id: `spread-tour-${dateStr}`,
        type: 'spread',
        savedAt: new Date(now.getTime() + 1000).toISOString(),
        questionText: tourData.questionText as string,
        cards: tourData.spreadCards as Array<{ cardIndex: number; isReversed: boolean }>,
        positionLabels: tourData.positionLabels as string[],
        melissaText: (tourData.melissaText as string) ?? '',
        impression: null,
        resonanceRating: null,
        emojiReaction: null,
      });
      localStorage.setItem('vesper_tour_spread', JSON.stringify(tourData));
    }

    localStorage.removeItem('vesper_personalisation_payload');
    setTourActive();
    setDone(true);
    setTimeout(() => router.replace('/main'), 500);
  }

  // Progress bar + phase label animation
  useEffect(() => {
    let currentPhase = 0;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const rawProgress = Math.min(elapsed / TOTAL_PHASE_MS, 1);
      // Slow near 95% while waiting for API
      const easedProgress = rawProgress < 0.9
        ? rawProgress
        : 0.9 + (rawProgress - 0.9) * 0.5;

      setProgress(Math.min(easedProgress * 100, 95));

      let acc = 0;
      for (let i = 0; i < PHASES.length; i++) {
        acc += PHASES[i].duration;
        if (elapsed < acc) {
          if (i !== currentPhase) {
            currentPhase = i;
            setPhaseIndex(i);
          }
          break;
        }
      }

      if (elapsed < TOTAL_PHASE_MS) {
        rafId = requestAnimationFrame(tick);
      } else {
        setPhaseIndex(PHASES.length - 1);
        animDoneRef.current = true;
        maybeFinish();
      }
    }

    let rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 32px',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: '360px', textAlign: 'center' }}
      >
        <div style={{ marginBottom: '32px', color: '#C9A84C', fontSize: '28px' }}>✦</div>

        <h1 style={{
          fontFamily: 'var(--font-dm-serif-var), serif',
          fontSize: '32px',
          fontWeight: 400,
          color: '#FAF7F0',
          margin: '0 0 40px',
          lineHeight: 1.25,
        }}>
          Personalising your experience
        </h1>

        {/* Progress bar */}
        <div style={{
          width: '100%',
          height: '4px',
          background: 'rgba(201,168,76,0.18)',
          borderRadius: '2px',
          overflow: 'hidden',
          marginBottom: '20px',
        }}>
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: done ? '100%' : `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
              height: '100%',
              background: '#C9A84C',
              borderRadius: '2px',
              boxShadow: '0 0 8px rgba(201,168,76,0.6)',
            }}
          />
        </div>

        {/* Phase label */}
        <div style={{ height: '24px', overflow: 'hidden' }}>
          <AnimatePresence mode="wait">
            <motion.p
              key={phaseIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              style={{
                fontFamily: 'var(--font-dm-sans-var), sans-serif',
                fontSize: '13px',
                color: 'rgba(250,247,240,0.55)',
                margin: 0,
                letterSpacing: '0.3px',
              }}
            >
              {PHASES[phaseIndex].label}
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
