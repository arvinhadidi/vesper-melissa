'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { EmojiReaction } from '@/lib/types';
import { track } from '@/lib/analytics';

type Phase = 'intro' | 'intro_out' | 'thinking' | 'eureka' | 'eureka_out' | 'revealing' | 'complete';

interface MelissaReadingFlowProps {
  apiEndpoint: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  apiPayload: Record<string, any>;
  userName: string;
  conversationPath: string;
  completeActions?: React.ReactNode;
  onReadingComplete?: (readingText: string) => void;
  initialEmojiReaction?: EmojiReaction | null;
  onEmojiReaction?: (reaction: EmojiReaction) => void;
  existingReadingText?: string;
  // When provided, play the full animated flow (intro → thinking → eureka → reveal)
  // using this text instead of fetching from the API. Used by the post-signin tour
  // to replay a reading that was pre-generated during the personalisation screen.
  precomputedReadingText?: string;
}

const EMOJI_OPTIONS: { value: EmojiReaction; emoji: string; label: string }[] = [
  { value: 'spot_on', emoji: '🎯', label: 'Spot on' },
  { value: 'got_me_thinking', emoji: '💭', label: 'Got me thinking' },
  { value: 'surprisingly_accurate', emoji: '✨', label: 'Surprisingly accurate' },
  { value: 'not_quite', emoji: '😐', label: 'Not quite' },
];

function EmojiReactionRow({
  initial,
  onSelect,
}: {
  initial?: EmojiReaction | null;
  onSelect?: (reaction: EmojiReaction) => void;
}) {
  const [selected, setSelected] = useState<EmojiReaction | null>(initial ?? null);
  // Capture whether a reaction already existed when this row first mounted.
  // If so, this is a revisit and the row stays hidden. Tapping during the
  // current visit must NOT hide it — the selection should stay on screen.
  const [reactedBeforeMount] = useState(() => initial != null);

  if (reactedBeforeMount) return null;

  function handleTap(value: EmojiReaction) {
    setSelected(value);
    onSelect?.(value);
  }

  return (
    <div style={{ marginTop: '16px' }}>
      <p style={{
        fontFamily: 'var(--font-dm-sans-var), sans-serif',
        fontSize: '10.5px',
        letterSpacing: '1.2px',
        textTransform: 'uppercase',
        color: 'rgba(250,247,240,0.5)',
        margin: '0 0 10px',
        textAlign: 'center',
      }}>
        How did that land?
      </p>
      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
        {EMOJI_OPTIONS.map(opt => {
          const isActive = selected === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => handleTap(opt.value)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '5px',
                padding: '10px 4px',
                borderRadius: '12px',
                cursor: selected ? 'default' : 'pointer',
                background: isActive ? 'rgba(201,168,76,0.3)' : 'rgba(250,247,240,0.05)',
                border: `1.5px solid ${isActive ? '#C9A84C' : 'rgba(250,247,240,0.12)'}`,
                boxShadow: isActive ? '0 0 10px rgba(201,168,76,0.35)' : 'none',
                opacity: 1,
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{ fontSize: '18px', lineHeight: 1 }}>{opt.emoji}</span>
              <span style={{
                fontFamily: 'var(--font-dm-sans-var), sans-serif',
                fontSize: '9.5px',
                fontWeight: isActive ? 600 : 400,
                lineHeight: 1.25,
                textAlign: 'center',
                color: isActive ? '#C9A84C' : 'rgba(250,247,240,0.6)',
              }}>
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

const AVATAR: Record<Phase, string> = {
  intro:      '/melissa/melissa-default.png',
  intro_out:  '/melissa/melissa-default.png',
  thinking:   '/melissa/melissa-thinking.png',
  eureka:     '/melissa/melissa-insight.png',
  eureka_out: '/melissa/melissa-insight.png',
  revealing:  '/melissa/melissa-insight.png',
  complete:   '/melissa/melissa-insight.png',
};

const INTRO_SPEED    = 64;
const EUREKA_SPEED   = 56;
const REVEAL_SPEED   = 32;
const UNTYPE_SPEED   = 38;
const MIN_THINKING_MS = 5000;
const INTRO_PAUSE_MS  = 1000;
const EUREKA_PAUSE_MS = 800;

function useTypewriter(target: string, msPerChar: number, active: boolean): string {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    if (!active) { setDisplayed(''); return; }
    setDisplayed('');
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(target.slice(0, i));
      if (i >= target.length) clearInterval(id);
    }, msPerChar);
    return () => clearInterval(id);
  }, [target, msPerChar, active]);
  return displayed;
}

function useUntyper(text: string, msPerChar: number, active: boolean): string {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    if (!active) { setDisplayed(''); return; }
    let i = text.length;
    setDisplayed(text);
    const id = setInterval(() => {
      i--;
      setDisplayed(text.slice(0, Math.max(0, i)));
      if (i <= 0) clearInterval(id);
    }, msPerChar);
    return () => clearInterval(id);
  }, [text, msPerChar, active]);
  return displayed;
}

function Avatar({ phase }: { phase: Phase }) {
  const [errored, setErrored] = useState(false);
  const src = AVATAR[phase];

  // Single-message instance only (this component) — 2x size on phone. Desktop
  // keeps the original 48px; the chat view has no avatar at all anymore so this
  // doesn't touch that.
  const sizeStyle = (
    <style>{`
      .melissa-reading-avatar { width: 48px; height: 48px; }
      @media (max-width: 700px) {
        .melissa-reading-avatar { width: 96px; height: 96px; }
      }
    `}</style>
  );

  if (errored) {
    return (
      <>
        {sizeStyle}
        <div className="melissa-reading-avatar" style={{
          borderRadius: '50%',
          background: '#C9A84C', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-dm-serif-var), serif', fontSize: '18px', color: '#1E1256',
        }}>M</div>
      </>
    );
  }
  return (
    <>
      {sizeStyle}
      <AnimatePresence mode="wait">
        <motion.img
          key={src}
          src={src}
          alt="Melissa"
          onError={() => setErrored(true)}
          className="melissa-reading-avatar"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
        />
      </AnimatePresence>
    </>
  );
}

function ThinkingDots() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C9A84C' }}
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
      <span style={{
        fontFamily: 'var(--font-garamond-var), Georgia, serif',
        fontStyle: 'italic',
        fontSize: '13px',
        color: 'rgba(30,18,86,0.5)',
        marginLeft: '4px',
      }}>
        Reading the cards...
      </span>
    </div>
  );
}

function BlinkingCursor() {
  return (
    <motion.span
      style={{ display: 'inline-block', width: '2px', height: '16px', background: '#1E1256', verticalAlign: 'middle', marginLeft: '2px' }}
      animate={{ opacity: [1, 0] }}
      transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
    />
  );
}

export default function MelissaReadingFlow({
  apiEndpoint,
  apiPayload,
  userName,
  conversationPath,
  completeActions,
  onReadingComplete,
  initialEmojiReaction,
  onEmojiReaction,
  existingReadingText,
  precomputedReadingText,
}: MelissaReadingFlowProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>(existingReadingText ? 'complete' : 'intro');
  const [fullReadingText, setFullReadingText] = useState(existingReadingText ?? '');
  const thinkingStartRef = useRef<number>(0);
  const apiTextRef = useRef<string>('');

  const introText  = `Let me read your cards, ${userName}.`;
  const eurekaText = `I have a verdict. Here goes...`;

  const introDisplayed    = useTypewriter(introText,      INTRO_SPEED,  phase === 'intro');
  const introUndisplayed  = useUntyper(introText,         UNTYPE_SPEED, phase === 'intro_out');
  const eurekaDisplayed   = useTypewriter(eurekaText,     EUREKA_SPEED, phase === 'eureka');
  const eurekaUndisplayed = useUntyper(eurekaText,        UNTYPE_SPEED, phase === 'eureka_out');
  const revealDisplayed   = useTypewriter(fullReadingText, REVEAL_SPEED, phase === 'revealing');

  useEffect(() => {
    if (phase === 'intro' && introDisplayed === introText) {
      const id = setTimeout(() => setPhase('intro_out'), INTRO_PAUSE_MS);
      return () => clearTimeout(id);
    }
  }, [phase, introDisplayed, introText]);

  useEffect(() => {
    if (phase === 'intro_out' && introUndisplayed === '') {
      setPhase('thinking');
    }
  }, [phase, introUndisplayed]);

  useEffect(() => {
    if (phase !== 'thinking') return;

    thinkingStartRef.current = performance.now();
    apiTextRef.current = '';

    // Tour playback: skip the network call, use the pre-generated text but keep the
    // same "reading the cards" beat so the animation feels identical to the real thing.
    if (precomputedReadingText !== undefined) {
      apiTextRef.current = precomputedReadingText;
      const id = setTimeout(() => setPhase('eureka'), MIN_THINKING_MS);
      return () => clearTimeout(id);
    }

    fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiPayload),
    }).then(async res => {
      if (!res.ok || !res.body) return;
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        apiTextRef.current += decoder.decode(value, { stream: true });
      }
      const elapsed = performance.now() - thinkingStartRef.current;
      const wait = Math.max(0, MIN_THINKING_MS - elapsed);
      setTimeout(() => setPhase('eureka'), wait);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    if (phase === 'eureka' && eurekaDisplayed === eurekaText) {
      const id = setTimeout(() => setPhase('eureka_out'), EUREKA_PAUSE_MS);
      return () => clearTimeout(id);
    }
  }, [phase, eurekaDisplayed, eurekaText]);

  useEffect(() => {
    if (phase === 'eureka_out' && eurekaUndisplayed === '') {
      setFullReadingText(apiTextRef.current);
      setPhase('revealing');
    }
  }, [phase, eurekaUndisplayed]);

  useEffect(() => {
    if (phase === 'revealing' && fullReadingText && revealDisplayed === fullReadingText) {
      const id = setTimeout(() => {
        setPhase('complete');
        onReadingComplete?.(fullReadingText);
        track('reading_completed', { type: apiEndpoint.includes('spread') ? 'spread' : 'daily' });
      }, 200);
      return () => clearTimeout(id);
    }
  }, [phase, revealDisplayed, fullReadingText, onReadingComplete, apiEndpoint]);

  function handleCarryOn() {
    router.push(conversationPath);
  }

  const bubbleText =
    phase === 'intro'      ? introDisplayed :
    phase === 'intro_out'  ? introUndisplayed :
    phase === 'eureka'     ? eurekaDisplayed :
    phase === 'eureka_out' ? eurekaUndisplayed :
    phase === 'revealing'  ? revealDisplayed :
    phase === 'complete'   ? fullReadingText :
    '';

  const showCursor = phase === 'intro' || phase === 'eureka' || phase === 'revealing';
  const isComplete = phase === 'complete';

  return (
    <motion.div
      // Avatar centered above the bubble, not beside it — side-by-side pushed the
      // bubble's visual center to the right of the actual content column (the
      // avatar only eats space on the left), which read as off-center on phone.
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '100%' }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Avatar phase={phase} />

      <div style={{ width: '100%', position: 'relative' }}>
        <motion.div
          style={{
            background: '#FAF7F0',
            borderRadius: '16px',
            padding: '14px 16px',
            border: '1px solid rgba(201,168,76,0.3)',
            minHeight: '52px',
            display: 'flex',
            alignItems: 'center',
          }}
          animate={{
            borderColor: isComplete ? '#C9A84C' : 'rgba(201,168,76,0.3)',
            boxShadow: isComplete ? '0 0 12px rgba(201,168,76,0.2)' : '0 0 0px rgba(201,168,76,0)',
          }}
          transition={{ duration: 0.4 }}
        >
          {phase === 'thinking' ? (
            <ThinkingDots />
          ) : (
            <p style={{
              fontFamily: 'var(--font-garamond-var), Georgia, serif',
              fontStyle: 'italic',
              fontSize: '14.5px',
              color: '#1E1256',
              lineHeight: '1.6',
              margin: 0,
            }}>
              {bubbleText}
              {showCursor && <BlinkingCursor />}
            </p>
          )}
        </motion.div>

        <AnimatePresence>
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <EmojiReactionRow initial={initialEmojiReaction} onSelect={onEmojiReaction} />
              {completeActions ?? (
                <button
                  onClick={handleCarryOn}
                  style={{
                    marginTop: '10px',
                    width: '100%',
                    fontFamily: 'var(--font-dm-sans-var), sans-serif',
                    fontSize: '13px',
                    color: '#FAF7F0',
                    background: 'transparent',
                    border: '1px solid rgba(250,247,240,0.35)',
                    borderRadius: '10px',
                    padding: '10px 16px',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  Carry on the conversation
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
