'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { saveJournalEntry } from '@/lib/journal';
import { setTourActive } from '@/lib/tour';
import NightSky from '@/components/ui/NightSky';
import { MICRO_CARDS, MICRO_CARD_INDICES } from '@/lib/onboarding/constants';
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

// MICRO_CARDS + MICRO_CARD_INDICES are the single source of truth in @/lib/onboarding/constants
// (the micro-pull onboarding step uses the same data) — imported here, never re-declared.

export default function PersonalisationPage() {
  return (
    <Suspense>
      <PersonalisationContent />
    </Suspense>
  );
}

function PersonalisationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const apiResultRef = useRef<Record<string, unknown> | null>(null);
  const apiDoneRef = useRef(false);
  const animDoneRef = useRef(false);
  const syncDoneRef = useRef(false);
  const hasNavigatedRef = useRef(false);
  const payloadRef = useRef<Payload | null>(null);

  // Kick off DB write + API call immediately — both run in parallel with animation
  useEffect(() => {
    async function init() {
      const raw = localStorage.getItem('vesper_personalisation_payload');
      if (!raw) { window.location.href = '/main'; return; }

      let payload: Payload;
      try { payload = JSON.parse(raw); } catch { window.location.href = '/main'; return; }

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        payload.userProfile = { ...payload.userProfile, id: user.id };
      }

      payloadRef.current = payload;

      // Reconcile entitlement directly from Stripe — don't wait on the webhook,
      // which can lag or, in local dev, never reach this server at all. Crucially we
      // GATE navigation on this completing (syncDoneRef): the checkout route only writes
      // stripe_customer_id, so subscription_status is still 'none' until this sync (or the
      // lagging webhook) writes 'active'. Navigating to /main before that lands makes the
      // middleware bounce the brand-new subscriber back to /onboarding/paywall.
      const sessionId = searchParams.get('session_id');
      if (sessionId) {
        // Safety valve: never hang forever on a stuck request — fall back to the webhook.
        const syncTimeout = setTimeout(() => { syncDoneRef.current = true; maybeFinish(); }, 8000);
        const settleSync = () => { clearTimeout(syncTimeout); syncDoneRef.current = true; maybeFinish(); };
        fetch('/api/sync-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        }).then(settleSync).catch(settleSync);
      } else {
        // No checkout session in the URL (e.g. re-entering personalisation) — nothing to sync.
        syncDoneRef.current = true;
      }

      // Resolve micro-pull card index to exclude from spread
      const microCard = payload.microPullCard
        ? MICRO_CARDS.find(c => c.name === payload.microPullCard) ?? null
        : null;
      const microPullCardIndex = microCard ? MICRO_CARD_INDICES[microCard.imagePath] : null;

      // Fire tour-setup API (non-blocking)
      fetch('/api/tour-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProfile: payload.userProfile,
          spreadTimestamp: payload.spreadTimestamp,
          microPullCardIndex,
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
    if (!apiDoneRef.current || !animDoneRef.current || !syncDoneRef.current || hasNavigatedRef.current) return;
    if (!payloadRef.current) return;
    hasNavigatedRef.current = true;
    finalize(payloadRef.current);
  }

  function finalize(payload: Payload) {
    const tourData = apiResultRef.current;
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // NOTE: the daily card is intentionally NOT saved to the journal. The tour shows it
    // as a demo (see /daily/tour); the user's real daily card stays unpulled so they can
    // discover it themselves later. Only the unique spread is saved.

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

    // Cache the pre-generated daily reading for the tour's /daily/tour step to play back.
    if (tourData && typeof tourData.dailyCardIndex === 'number') {
      localStorage.setItem('vesper_tour_daily', JSON.stringify({
        cardIndex: tourData.dailyCardIndex,
        isReversed: Boolean(tourData.dailyIsReversed),
        readingText: (tourData.dailyReadingText as string) ?? '',
        userName: payload.userProfile.displayName || 'there',
      }));
    }

    localStorage.removeItem('vesper_personalisation_payload');
    setTourActive();
    setDone(true);
    // Full navigation so middleware reads fresh Supabase profile (not cached RSC)
    setTimeout(() => { window.location.href = '/main'; }, 500);
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
    <>
    <NightSky />
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 32px',
      position: 'relative',
      zIndex: 1,
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
    </>
  );
}
