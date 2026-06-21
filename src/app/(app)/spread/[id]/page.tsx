'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getCardById, getCardImagePath, TarotCard as TarotCardType } from '@/lib/cards';
import { UserProfile } from '@/lib/types';
import CardDeal from '@/components/tarot/CardDeal';
import MelissaReadingFlow from '@/components/melissa/MelissaReadingFlow';
import { saveJournalEntry } from '@/lib/journal';
import { EmojiReaction } from '@/lib/types';

type Stage = 'cards' | 'reading';

interface DrawnCard {
  cardIndex: number;
  isReversed: boolean;
}

interface SpreadContext {
  type: 'spread';
  questionText: string;
  cards: DrawnCard[];
  positionLabels: string[];
  promptContext: string;
  userProfile: UserProfile;
  readingText?: string;
  emojiReaction?: EmojiReaction | null;
  fromJournal?: boolean;
}

export default function SpreadReadingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [context, setContext] = useState<SpreadContext | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [stage, setStage] = useState<Stage>('cards');
  const [flippedStates, setFlippedStates] = useState<boolean[]>([]);
  const [allFlipped, setAllFlipped] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [readingText, setReadingText] = useState('');
  const [emojiReaction, setEmojiReaction] = useState<EmojiReaction | null>(null);
  const [modalEntry, setModalEntry] = useState<{ card: TarotCardType; isReversed: boolean } | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem(`reading-${id}`);
    if (!raw) { setNotFound(true); return; }
    const ctx = JSON.parse(raw) as SpreadContext;
    setContext(ctx);
    const isRevisit = ctx.fromJournal || !!ctx.readingText;
    setFlippedStates(new Array(ctx.cards.length).fill(isRevisit));
    if (isRevisit) {
      setAllFlipped(true);
      setStage('reading');
    }
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
          onClick={() => router.push('/spread')}
          style={{
            fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '13px',
            color: '#FAF7F0', background: 'transparent',
            border: '1px solid rgba(250,247,240,0.35)', borderRadius: '10px',
            padding: '10px 20px', cursor: 'pointer',
          }}
        >
          Start a new spread
        </button>
      </div>
    );
  }

  if (!context) return null;

  const firstUnflippedIndex = flippedStates.findIndex(f => !f);

  const cardEntries = context.cards.map(d => ({
    card: getCardById(d.cardIndex),
    isReversed: d.isReversed,
  }));

  function handleCardFlip(index: number) {
    if (flippedStates[index]) {
      // Already flipped — open modal
      setModalEntry({ card: cardEntries[index].card!, isReversed: context!.cards[index].isReversed });
      return;
    }
    if (firstUnflippedIndex === -1 || index !== firstUnflippedIndex) return;
    setFlippedStates(prev => {
      const next = [...prev];
      next[index] = true;
      if (next.every(Boolean)) setAllFlipped(true);
      return next;
    });
  }

  const allTrueStates = new Array(context.cards.length).fill(true);
  const conversationPath = `/spread/${id}/conversation`;

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
      type: 'spread',
      savedAt: new Date().toISOString(),
      questionText: context.questionText,
      cards: context.cards.map(c => ({ cardIndex: c.cardIndex, isReversed: c.isReversed })),
      positionLabels: context.positionLabels,
      melissaText: readingText || context.readingText || '',
      impression: null,
      resonanceRating: null,
      emojiReaction,
    });
    setIsSaved(true);
  }

  const journalButton = (
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
  );

  return (
    <>
    <div style={{
      minHeight: '100dvh',
      padding: '48px 24px 120px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <p style={{
        fontFamily: 'var(--font-dm-serif-var), serif',
        fontSize: '18px',
        color: '#FAF7F0',
        textAlign: 'center',
        marginBottom: '28px',
        width: '100%',
      }}>
        {context.questionText}
      </p>

      <CardDeal
        cards={cardEntries}
        onCardFlip={stage === 'reading'
          ? (i) => setModalEntry({ card: cardEntries[i].card!, isReversed: context.cards[i].isReversed })
          : handleCardFlip
        }
        flippedStates={stage === 'cards' ? flippedStates : allTrueStates}
        positionLabels={context.positionLabels}
        labelVariant="dark"
      />

      {stage === 'cards' && (
        <AnimatePresence>
          {allFlipped && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                marginTop: '28px',
                width: '100%',
                maxWidth: '400px',
              }}
            >
              <button
                onClick={() => setStage('reading')}
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
              {journalButton}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {stage === 'reading' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          style={{ width: '100%', maxWidth: '400px', marginTop: '28px' }}
        >
          {(!context.fromJournal || context.readingText) ? (
            <MelissaReadingFlow
              apiEndpoint="/api/melissa-spread"
              apiPayload={{
                questionText: context.questionText,
                cards: context.cards,
                positionLabels: context.positionLabels,
                promptContext: context.promptContext,
                userProfile: context.userProfile,
              }}
              userName={context.userProfile.displayName}
              conversationPath={conversationPath}
              initialEmojiReaction={emojiReaction}
              onEmojiReaction={handleEmojiReaction}
              existingReadingText={context.readingText}
              onReadingComplete={(text) => {
                setReadingText(text);
                setContext(prev => (prev ? { ...prev, readingText: text } : prev));
                sessionStorage.setItem(`reading-${id}`, JSON.stringify({
                  ...context,
                  readingText: text,
                }));
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
                  {journalButton}
                </div>
              }
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => {
                  setContext(prev => prev ? { ...prev, fromJournal: false } : prev);
                }}
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
              {journalButton}
            </div>
          )}
        </motion.div>
      )}
    </div>

    <AnimatePresence>
      {modalEntry && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => setModalEntry(null)}
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
              onClick={() => setModalEntry(null)}
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
                src={getCardImagePath(modalEntry.card.name_short)}
                alt={modalEntry.card.name}
                style={{
                  width: '80px', borderRadius: '10px', flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(30,18,86,0.15)',
                  transform: modalEntry.isReversed ? 'rotate(180deg)' : 'none',
                }}
              />
              <div style={{ paddingTop: '4px' }}>
                <p style={{ fontFamily: 'var(--font-dm-serif-var), serif', fontSize: '20px', color: '#1E1256', margin: '0 0 2px' }}>
                  {modalEntry.card.name}
                </p>
                {modalEntry.isReversed && (
                  <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '11px', color: 'rgba(30,18,86,0.4)', margin: '0 0 8px' }}>
                    Reversed
                  </p>
                )}
                {modalEntry.card.keywords?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '8px' }}>
                    {modalEntry.card.keywords.map(k => (
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
                {modalEntry.isReversed ? 'Reversed meaning' : 'Upright meaning'}
              </p>
              <p style={{ fontFamily: 'var(--font-garamond-var), Georgia, serif', fontSize: '14.5px', color: 'rgba(30,18,86,0.75)', lineHeight: '1.65', margin: 0 }}>
                {modalEntry.isReversed ? modalEntry.card.meaning_rev : modalEntry.card.meaning_up}
              </p>
            </div>

            {modalEntry.card.desc && (
              <div style={{ marginTop: '16px' }}>
                <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '10.5px', color: '#C9A84C', letterSpacing: '1.5px', textTransform: 'uppercase', margin: '0 0 8px' }}>
                  Description
                </p>
                <p style={{ fontFamily: 'var(--font-garamond-var), Georgia, serif', fontSize: '14px', color: 'rgba(30,18,86,0.62)', lineHeight: '1.65', margin: 0 }}>
                  {modalEntry.card.desc}
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
