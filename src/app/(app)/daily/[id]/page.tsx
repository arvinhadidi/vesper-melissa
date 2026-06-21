'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { TarotCard as TarotCardType, getCardImagePath } from '@/lib/cards';
import { UserProfile } from '@/lib/types';
import TarotCardComponent from '@/components/tarot/TarotCard';
import MelissaReadingFlow from '@/components/melissa/MelissaReadingFlow';
import { saveJournalEntry } from '@/lib/journal';
import { EmojiReaction } from '@/lib/types';

interface DailyReadingContext {
  type?: 'daily';
  card: TarotCardType;
  isReversed: boolean;
  userProfile: UserProfile;
  readingText?: string;
  emojiReaction?: EmojiReaction | null;
  fromJournal?: boolean;
}

function CardModal({ card, isReversed, onClose }: { card: TarotCardType; isReversed: boolean; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(10,6,30,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 50, padding: '0 24px',
      }}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
        style={{
          background: '#FAF7F0', borderRadius: '24px', width: '100%',
          maxWidth: '460px', padding: '28px 24px 32px',
          position: 'relative', maxHeight: '85dvh', overflowY: 'auto',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '18px',
            background: 'rgba(30,18,86,0.07)', border: 'none', borderRadius: '50%',
            width: '30px', height: '30px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', color: 'rgba(30,18,86,0.5)',
            fontSize: '16px', lineHeight: 1,
          }}
          aria-label="Close"
        >×</button>

        <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-start', marginBottom: '20px' }}>
          <img
            src={getCardImagePath(card.name_short)}
            alt={card.name}
            style={{
              width: '80px', borderRadius: '10px', flexShrink: 0,
              boxShadow: '0 4px 12px rgba(30,18,86,0.15)',
              transform: isReversed ? 'rotate(180deg)' : 'none',
            }}
          />
          <div style={{ paddingTop: '4px' }}>
            <p style={{ fontFamily: 'var(--font-dm-serif-var), serif', fontSize: '20px', color: '#1E1256', margin: '0 0 2px' }}>
              {card.name}
            </p>
            {isReversed && (
              <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '11px', color: 'rgba(30,18,86,0.4)', margin: '0 0 8px' }}>
                Reversed
              </p>
            )}
            {card.keywords?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '8px' }}>
                {card.keywords.map(k => (
                  <span key={k} style={{
                    fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '10.5px',
                    color: 'rgba(30,18,86,0.5)', background: 'rgba(30,18,86,0.06)',
                    borderRadius: '20px', padding: '3px 9px',
                  }}>{k}</span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(30,18,86,0.08)', paddingTop: '16px' }}>
          <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '10.5px', color: '#C9A84C', letterSpacing: '1.5px', textTransform: 'uppercase', margin: '0 0 8px' }}>
            {isReversed ? 'Reversed meaning' : 'Upright meaning'}
          </p>
          <p style={{ fontFamily: 'var(--font-garamond-var), Georgia, serif', fontSize: '14.5px', color: 'rgba(30,18,86,0.75)', lineHeight: '1.65', margin: 0 }}>
            {isReversed ? card.meaning_rev : card.meaning_up}
          </p>
        </div>

        {card.desc && (
          <div style={{ marginTop: '16px' }}>
            <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '10.5px', color: '#C9A84C', letterSpacing: '1.5px', textTransform: 'uppercase', margin: '0 0 8px' }}>
              Description
            </p>
            <p style={{ fontFamily: 'var(--font-garamond-var), Georgia, serif', fontSize: '14px', color: 'rgba(30,18,86,0.62)', lineHeight: '1.65', margin: 0 }}>
              {card.desc}
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function DailyReadingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [context, setContext] = useState<DailyReadingContext | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [readingText, setReadingText] = useState('');
  const [emojiReaction, setEmojiReaction] = useState<EmojiReaction | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(`reading-${id}`);
    if (!raw) { setNotFound(true); return; }
    const ctx = JSON.parse(raw) as DailyReadingContext;
    setContext(ctx);
    if (ctx.fromJournal) setIsSaved(true);
    if (ctx.readingText) setReadingText(ctx.readingText);
    if (ctx.emojiReaction) setEmojiReaction(ctx.emojiReaction);
  }, [id]);

  if (notFound) {
    return (
      <div style={{
        minHeight: '100dvh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '24px',
        fontFamily: 'var(--font-garamond-var), Georgia, serif',
      }}>
        <p style={{ fontSize: '16px', color: 'rgba(250,247,240,0.6)', marginBottom: '20px', textAlign: 'center' }}>
          This reading has expired.
        </p>
        <button
          onClick={() => router.push('/daily')}
          style={{
            fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '13px',
            color: '#FAF7F0', background: 'transparent',
            border: '1px solid rgba(250,247,240,0.35)', borderRadius: '10px',
            padding: '10px 20px', cursor: 'pointer',
          }}
        >
          Go to today&apos;s card
        </button>
      </div>
    );
  }

  if (!context) return null;

  const conversationPath = `/daily/${id}/conversation`;

  function handleEmojiReaction(reaction: EmojiReaction) {
    if (!context) return;
    setEmojiReaction(reaction);
    const updated = { ...context, emojiReaction: reaction };
    setContext(updated);
    sessionStorage.setItem(`reading-${id}`, JSON.stringify(updated));
  }

  function handleSaveToJournal() {
    if (!context) return;
    saveJournalEntry({
      id,
      type: 'daily',
      savedAt: new Date().toISOString(),
      questionText: null,
      cards: [{ cardIndex: context.card.id, isReversed: context.isReversed }],
      positionLabels: null,
      melissaText: readingText || context.readingText || '',
      impression: null,
      resonanceRating: null,
      emojiReaction,
    });
    setIsSaved(true);
  }

  return (
    <>
      <div style={{
        minHeight: '100dvh',
        padding: '48px 24px 120px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        {/* Date header */}
        <div style={{ textAlign: 'center', marginBottom: '28px', width: '100%' }}>
          <p style={{
            fontFamily: 'var(--font-dm-sans-var), sans-serif',
            fontSize: '11px',
            color: '#C9A84C',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            margin: 0,
          }}>
            {formatDate(id.replace('daily-', ''))}
          </p>
          <h1 style={{
            fontFamily: 'var(--font-dm-serif-var), serif',
            fontSize: '20px',
            fontWeight: 400,
            color: '#FAF7F0',
            margin: '6px 0 0',
          }}>
            Your card for today
          </h1>
        </div>

        {/* Card — already face up */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <TarotCardComponent
            card={context.card}
            isFlipped={true}
            isReversed={context.isReversed}
            onFlip={() => setShowModal(true)}
            size="lg"
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            style={{
              fontFamily: 'var(--font-garamond-var), Georgia, serif',
              fontStyle: 'italic',
              fontSize: '11px',
              color: 'rgba(250,247,240,0.5)',
              marginTop: '10px',
              cursor: 'pointer',
            }}
            onClick={() => setShowModal(true)}
          >
            tap card to view meaning
          </motion.p>
        </div>

        {/* Card name */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          style={{ textAlign: 'center', marginTop: '20px', marginBottom: '28px' }}
        >
          <p style={{ fontFamily: 'var(--font-dm-serif-var), serif', fontSize: '18px', color: '#C9A84C', margin: 0 }}>
            {context.card.name}
          </p>
          {context.isReversed && (
            <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '11px', color: 'rgba(250,247,240,0.55)', margin: '3px 0 0' }}>
              (Reversed)
            </p>
          )}
        </motion.div>

        {/* Melissa reading */}
        <div style={{ width: '100%', maxWidth: '400px' }}>
          {(!context.fromJournal || context.readingText) ? (
            <MelissaReadingFlow
              apiEndpoint="/api/melissa-daily"
              apiPayload={{
                cardIndex: context.card.id,
                isReversed: context.isReversed,
                userProfile: context.userProfile,
              }}
              userName={context.userProfile.displayName}
              conversationPath={conversationPath}
              initialEmojiReaction={emojiReaction}
              onEmojiReaction={handleEmojiReaction}
              existingReadingText={context.readingText || undefined}
              onReadingComplete={(text) => {
                setReadingText(text);
                setContext(prev => (prev ? { ...prev, readingText: text } : prev));
                sessionStorage.setItem(`reading-${id}`, JSON.stringify({ ...context, readingText: text }));
              }}
              completeActions={
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                  <button
                    onClick={() => router.push(conversationPath)}
                    style={{
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
                  <button
                    onClick={handleSaveToJournal}
                    disabled={isSaved}
                    style={{
                      width: '100%',
                      fontFamily: 'var(--font-dm-sans-var), sans-serif',
                      fontSize: '13px',
                      color: isSaved ? 'rgba(30,18,86,0.4)' : 'rgba(30,18,86,0.7)',
                      background: isSaved ? 'rgba(250,247,240,0.6)' : '#FAF7F0',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '10px 16px',
                      cursor: isSaved ? 'default' : 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    {isSaved ? 'Added to journal ✓' : 'Add to journal'}
                  </button>
                </div>
              }
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => setContext(prev => prev ? { ...prev, fromJournal: false } : prev)}
                style={{
                  width: '100%',
                  background: '#C9A84C',
                  color: '#1E1256',
                  padding: '14px',
                  borderRadius: '12px',
                  fontFamily: 'var(--font-dm-sans-var), sans-serif',
                  fontWeight: 500,
                  fontSize: '15px',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Get Melissa&apos;s take
              </button>
              <button
                disabled
                style={{
                  width: '100%',
                  fontFamily: 'var(--font-dm-sans-var), sans-serif',
                  fontSize: '13px',
                  color: 'rgba(30,18,86,0.4)',
                  background: 'rgba(250,247,240,0.6)',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 16px',
                  cursor: 'default',
                  textAlign: 'center',
                }}
              >
                Added to journal ✓
              </button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <CardModal
            card={context.card}
            isReversed={context.isReversed}
            onClose={() => setShowModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
