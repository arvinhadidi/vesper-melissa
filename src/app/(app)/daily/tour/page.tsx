'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCardById, TarotCard } from '@/lib/cards';
import TarotCardComponent from '@/components/tarot/TarotCard';
import MelissaReadingFlow from '@/components/melissa/MelissaReadingFlow';
import { useTour } from '@/components/tour/TourProvider';

type TourDaily = {
  cardIndex: number;
  isReversed: boolean;
  readingText: string;
  userName: string;
};

const FALLBACK_READING =
  "Today asks you to trust what you already feel. Carry this card with you, and let it remind you that the next step is quieter than you think.";

type Stage = 'card' | 'reading' | 'chat';

export default function DailyTourPage() {
  const { nextStep } = useTour();
  const [data, setData] = useState<TourDaily | null>(null);
  const [missing, setMissing] = useState(false);
  const [stage, setStage] = useState<Stage>('card');
  const [readingDone, setReadingDone] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('vesper_tour_daily');
    if (!raw) { setMissing(true); return; }
    try {
      setData(JSON.parse(raw));
    } catch {
      setMissing(true);
    }
  }, []);

  if (missing) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <button
          onClick={nextStep}
          style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '15px', fontWeight: 500, color: '#1E1256', background: '#C9A84C', border: 'none', borderRadius: '12px', padding: '14px 28px', cursor: 'pointer' }}
        >
          Continue to your spread →
        </button>
      </div>
    );
  }

  if (!data) return null;

  const card: TarotCard = getCardById(data.cardIndex);
  const reading = data.readingText || FALLBACK_READING;

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '48px 24px 140px',
    }}>
      {/* Header — large, like a real title */}
      <div style={{ textAlign: 'center', marginBottom: '32px', width: '100%' }}>
        <p style={{
          fontFamily: 'var(--font-dm-sans-var), sans-serif',
          fontSize: '13px',
          fontWeight: 500,
          color: '#C9A84C',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          margin: '0 0 12px',
        }}>
          Your daily card
        </p>
        <h1 style={{
          fontFamily: 'var(--font-dm-serif-var), serif',
          fontSize: 'clamp(30px, 9vw, 40px)',
          fontWeight: 400,
          color: '#FAF7F0',
          margin: 0,
          lineHeight: 1.15,
        }}>
          {stage === 'chat' ? 'Keep the conversation going' : 'The card you drew'}
        </h1>
      </div>

      {stage !== 'chat' && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <TarotCardComponent
              card={card}
              isFlipped={true}
              isReversed={data.isReversed}
              onFlip={() => {}}
              size="lg"
            />
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              style={{ fontFamily: 'var(--font-dm-serif-var), serif', fontSize: '18px', color: '#C9A84C', margin: '18px 0 0' }}
            >
              {card.name}
            </motion.p>
          </div>

          {stage === 'card' && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              onClick={() => setStage('reading')}
              style={{
                marginTop: '28px',
                width: '100%',
                maxWidth: '400px',
                fontFamily: 'var(--font-dm-sans-var), sans-serif',
                fontSize: '15px',
                fontWeight: 500,
                color: '#1E1256',
                background: '#C9A84C',
                border: 'none',
                borderRadius: '12px',
                padding: '15px 16px',
                cursor: 'pointer',
              }}
            >
              Get Melissa&apos;s take
            </motion.button>
          )}

          {stage === 'reading' && (
            <div style={{ width: '100%', maxWidth: '400px', marginTop: '28px' }}>
              <MelissaReadingFlow
                apiEndpoint="/api/melissa-daily"
                apiPayload={{}}
                userName={data.userName}
                conversationPath="#"
                precomputedReadingText={reading}
                onReadingComplete={() => setReadingDone(true)}
                completeActions={
                  <button
                    onClick={() => setStage('chat')}
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
                    Ask Melissa more →
                  </button>
                }
              />
            </div>
          )}
        </>
      )}

      {stage === 'chat' && (
        <ChatShowcase userName={data.userName} cardName={card.name} onContinue={nextStep} />
      )}

      <TourHint stage={stage} readingDone={readingDone} />
    </div>
  );
}

// Bottom guidance box (same cream look as the global tour tooltip) that narrates each
// step of the daily walkthrough. Purely informational — the in-page buttons drive it.
function TourHint({ stage, readingDone }: { stage: Stage; readingDone: boolean }) {
  // Keyed per distinct piece of copy, not just once overall — dismissing the
  // "reading in progress" text shouldn't also suppress the next one that appears
  // once the reading finishes; each new text gets its own close button.
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);

  if (stage === 'chat') return null;

  const key = `${stage}-${readingDone}`;
  if (dismissedKey === key) return null;

  const text =
    stage === 'card'
      ? 'This is the card drawn for you today. Tap “Get Melissa’s take” to hear her read it.'
      : readingDone
        ? 'You can rate Melissa’s reading so she learns what resonates, then tap “Ask Melissa more” to keep the conversation going.'
        : 'Melissa is reading the card you drew…';

  return (
    <>
      {/* Centered-bottom overlaps the reading bubble on desktop (which can grow tall
          with long reading text) and the reaction buttons + bottom nav on mobile.
          Anchor to the right on wider screens, clear of the centered content column;
          on mobile, sit above the reaction row instead of on top of it. */}
      <style>{`
        .tour-hint-box {
          left: 16px;
          right: 16px;
          bottom: 100px;
        }
        @media (min-width: 700px) {
          .tour-hint-box {
            left: auto;
            right: 24px;
            bottom: 32px;
            width: min(340px, 30vw);
          }
        }
      `}</style>
      <AnimatePresence mode="wait">
        <motion.div
          key={`${stage}-${readingDone}`}
          className="tour-hint-box"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: 'fixed',
            zIndex: 90,
            background: '#FAF7F0',
            border: '1px solid rgba(201,168,76,0.4)',
            borderRadius: '16px',
            padding: '14px 36px 14px 16px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-start',
          }}
        >
          <span style={{ color: '#C9A84C', fontSize: '15px', lineHeight: 1.45, flexShrink: 0 }}>✦</span>
          <p style={{
            fontFamily: 'var(--font-dm-sans-var), sans-serif',
            fontSize: '13.5px',
            color: 'rgba(30,18,86,0.7)',
            margin: 0,
            lineHeight: 1.5,
          }}>
            {text}
          </p>
          <button
            onClick={() => setDismissedKey(key)}
            aria-label="Close"
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              background: 'none',
              borderRadius: '50%',
              color: 'rgba(30,18,86,0.4)',
              cursor: 'pointer',
              fontSize: '16px',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

function ChatShowcase({ userName, cardName, onContinue }: { userName: string; cardName: string; onContinue: () => void }) {
  const [introDismissed, setIntroDismissed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column' }}
    >
      {!introDismissed && (
        <div style={{
          position: 'relative',
          background: '#FAF7F0',
          border: '1px solid rgba(201,168,76,0.4)',
          borderRadius: '16px',
          padding: '14px 36px 14px 16px',
          marginBottom: '24px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-start',
        }}>
          <span style={{ color: '#C9A84C', fontSize: '15px', lineHeight: 1.45, flexShrink: 0 }}>✦</span>
          <p style={{
            fontFamily: 'var(--font-dm-sans-var), sans-serif',
            fontSize: '13.5px',
            color: 'rgba(30,18,86,0.7)',
            margin: 0,
            lineHeight: 1.5,
          }}>
            After any reading, you can keep talking to Melissa. She remembers your cards and answers in the moment.
          </p>
          <button
            onClick={() => setIntroDismissed(true)}
            aria-label="Close"
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              background: 'none',
              borderRadius: '50%',
              color: 'rgba(30,18,86,0.4)',
              cursor: 'pointer',
              fontSize: '16px',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* User message */}
      <div style={{ alignSelf: 'flex-end', maxWidth: '85%', marginBottom: '14px' }}>
        <div style={{
          background: '#C9A84C',
          color: '#1E1256',
          borderRadius: '16px 16px 4px 16px',
          padding: '12px 15px',
          fontFamily: 'var(--font-dm-sans-var), sans-serif',
          fontSize: '14.5px',
          lineHeight: 1.5,
        }}>
          What should I keep in mind about {cardName} today?
        </div>
      </div>

      {/* Melissa reply — no avatar, matching the real chat (MelissaChatPage):
          bubble side + color is the speaker cue, not a repeated avatar. */}
      <div style={{ alignSelf: 'flex-start', maxWidth: '85%', marginBottom: '28px' }}>
        <div style={{
          background: '#FAF7F0',
          border: '1px solid rgba(201,168,76,0.3)',
          borderRadius: '16px 16px 16px 4px',
          padding: '14px 16px',
          fontFamily: 'var(--font-garamond-var), Georgia, serif',
          fontStyle: 'italic',
          fontSize: '14.5px',
          color: '#1E1256',
          lineHeight: 1.6,
        }}>
          Hold it lightly, {userName}. The card is pointing you toward something you already sense but haven&apos;t said out loud yet. Let today be about listening for it.
        </div>
      </div>

      <button
        onClick={onContinue}
        style={{
          width: '100%',
          fontFamily: 'var(--font-dm-sans-var), sans-serif',
          fontSize: '15px',
          fontWeight: 500,
          color: '#1E1256',
          background: '#C9A84C',
          border: 'none',
          borderRadius: '12px',
          padding: '15px 16px',
          cursor: 'pointer',
        }}
      >
        Continue to your spread →
      </button>
    </motion.div>
  );
}
