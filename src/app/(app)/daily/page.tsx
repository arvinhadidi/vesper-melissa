'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { getDailyCardIndex } from '@/lib/cardLogic.js';
import { getCardById, TarotCard, getCardImagePath } from '@/lib/cards';
import { useUserProfile } from '@/lib/hooks/useUserProfile';
import TarotCardComponent from '@/components/tarot/TarotCard';
import { saveJournalEntry, fetchJournalEntries } from '@/lib/journal';

function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}

function CardModal({ card, isReversed, onClose }: { card: TarotCard; isReversed: boolean; onClose: () => void }) {
  return (
    <motion.div
      key="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10,6,30,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '0 24px',
      }}
    >
      <motion.div
        key="modal-sheet"
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
        style={{
          background: '#FAF7F0',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '460px',
          padding: '28px 24px 32px',
          position: 'relative',
          maxHeight: '85dvh',
          overflowY: 'auto',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '18px',
            background: 'rgba(30,18,86,0.07)',
            border: 'none',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'rgba(30,18,86,0.5)',
            fontSize: '16px',
            lineHeight: 1,
          }}
          aria-label="Close"
        >
          ×
        </button>

        <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-start', marginBottom: '20px' }}>
          <img
            src={getCardImagePath(card.name_short)}
            alt={card.name}
            style={{
              width: '80px',
              borderRadius: '10px',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(30,18,86,0.15)',
              transform: isReversed ? 'rotate(180deg)' : 'none',
            }}
          />
          <div style={{ paddingTop: '4px' }}>
            <p style={{
              fontFamily: 'var(--font-dm-serif-var), serif',
              fontSize: '20px',
              color: '#1E1256',
              margin: '0 0 2px',
            }}>
              {card.name}
            </p>
            {isReversed && (
              <p style={{
                fontFamily: 'var(--font-dm-sans-var), sans-serif',
                fontSize: '11px',
                color: 'rgba(30,18,86,0.4)',
                margin: '0 0 8px',
              }}>
                Reversed
              </p>
            )}
            {card.keywords?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '8px' }}>
                {card.keywords.map(k => (
                  <span key={k} style={{
                    fontFamily: 'var(--font-dm-sans-var), sans-serif',
                    fontSize: '10.5px',
                    color: 'rgba(30,18,86,0.5)',
                    background: 'rgba(30,18,86,0.06)',
                    borderRadius: '20px',
                    padding: '3px 9px',
                  }}>
                    {k}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(30,18,86,0.08)', paddingTop: '16px' }}>
          <p style={{
            fontFamily: 'var(--font-dm-sans-var), sans-serif',
            fontSize: '10.5px',
            color: '#C9A84C',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            margin: '0 0 8px',
          }}>
            {isReversed ? 'Reversed meaning' : 'Upright meaning'}
          </p>
          <p style={{
            fontFamily: 'var(--font-garamond-var), Georgia, serif',
            fontSize: '14.5px',
            color: 'rgba(30,18,86,0.75)',
            lineHeight: '1.65',
            margin: 0,
          }}>
            {isReversed ? card.meaning_rev : card.meaning_up}
          </p>
        </div>

        {card.desc && (
          <div style={{ marginTop: '16px' }}>
            <p style={{
              fontFamily: 'var(--font-dm-sans-var), sans-serif',
              fontSize: '10.5px',
              color: '#C9A84C',
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              margin: '0 0 8px',
            }}>
              Description
            </p>
            <p style={{
              fontFamily: 'var(--font-garamond-var), Georgia, serif',
              fontSize: '14px',
              color: 'rgba(30,18,86,0.62)',
              lineHeight: '1.65',
              margin: 0,
            }}>
              {card.desc}
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function DailyPage() {
  const router = useRouter();
  const { profile, loading: profileLoading } = useUserProfile();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [dailyCard, setDailyCard] = useState<TarotCard | null>(null);
  const [isReversed, setIsReversed] = useState(false);
  const [todayString, setTodayString] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);

  useEffect(() => {
    if (profileLoading || !profile) return;
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    setTodayString(dateStr);

    const cardIndex = getDailyCardIndex(profile.id, dateStr);
    const reversed = (cardIndex * 7 + dateStr.length) % 10 < 3;
    const card = getCardById(cardIndex);
    setDailyCard(card);
    setIsReversed(reversed);

    // If today's card has already been pulled and read, jump straight to that
    // reading instead of re-presenting a blank flippable card — re-flipping and
    // re-saving it used to silently no-op against the existing journal entry.
    const entryId = `daily-${dateStr}`;
    fetchJournalEntries()
      .then(entries => {
        const existing = entries.find(e => e.id === entryId);
        if (existing && existing.melissaText) {
          sessionStorage.setItem(`reading-${entryId}`, JSON.stringify({
            type: 'daily',
            card,
            isReversed: reversed,
            userProfile: profile,
            readingText: existing.melissaText,
            emojiReaction: existing.emojiReaction,
          }));
          router.replace(`/daily/${entryId}`);
        } else {
          // Saved pre-reading (empty melissaText) — let them flip/save as normal,
          // but reflect that it's already in the journal so the button isn't misleading.
          if (existing) setIsSaved(true);
          setCheckingExisting(false);
        }
      })
      .catch(() => setCheckingExisting(false));
  }, [profile, profileLoading, router]);

  if (profileLoading || checkingExisting) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '14px', color: 'rgba(250,247,240,0.6)' }}>Loading...</p>
      </div>
    );
  }

  function handleCardClick() {
    if (!isFlipped) {
      setIsFlipped(true);
    } else {
      setShowModal(true);
    }
  }

  function handleSaveToJournal() {
    if (!dailyCard || !todayString) return;
    saveJournalEntry({
      id: `daily-${todayString}`,
      type: 'daily',
      savedAt: new Date().toISOString(),
      questionText: null,
      cards: [{ cardIndex: dailyCard.id, isReversed }],
      positionLabels: null,
      melissaText: '',
      impression: null,
      resonanceRating: null,
      emojiReaction: null,
    });
    setIsSaved(true);
  }

  function handleGetReading() {
    if (!dailyCard || !todayString || !profile) return;
    const id = `daily-${todayString}`;
    sessionStorage.setItem(`reading-${id}`, JSON.stringify({
      type: 'daily',
      card: dailyCard,
      isReversed,
      userProfile: profile,
    }));
    router.push(`/daily/${id}`);
  }

  return (
    <>
      <div style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '48px 24px 120px',
      }}>

        <div style={{ textAlign: 'center', marginBottom: '36px', width: '100%' }}>
          <p style={{
            fontFamily: 'var(--font-dm-sans-var), sans-serif',
            fontSize: '13px',
            fontWeight: 500,
            color: '#C9A84C',
            letterSpacing: '2.5px',
            textTransform: 'uppercase',
            margin: 0,
          }}>
            {todayString ? formatDate(todayString) : ''}
          </p>
          <h1 style={{
            fontFamily: 'var(--font-dm-serif-var), serif',
            fontSize: 'clamp(30px, 9vw, 40px)',
            fontWeight: 400,
            color: '#FAF7F0',
            margin: '10px 0 0',
            lineHeight: 1.15,
          }}>
            Your card for today
          </h1>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <TarotCardComponent
            card={dailyCard}
            isFlipped={isFlipped}
            isReversed={isReversed}
            onFlip={handleCardClick}
            size="lg"
          />

          <AnimatePresence>
            {!isFlipped && (
              <motion.p
                key="tap-hint"
                style={{
                  fontFamily: 'var(--font-garamond-var), Georgia, serif',
                  fontStyle: 'italic',
                  fontSize: '12px',
                  color: 'rgba(250,247,240,0.55)',
                  marginTop: '14px',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.35, 0.65, 0.35] }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                tap to reveal
              </motion.p>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isFlipped && (
              <motion.p
                key="tap-view-hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.7, duration: 0.4 }}
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
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {isFlipped && dailyCard && (
            <motion.div
              style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <p style={{
                fontFamily: 'var(--font-dm-serif-var), serif',
                fontSize: '18px',
                color: '#C9A84C',
                textAlign: 'center',
                margin: 0,
              }}>
                {dailyCard.name}
              </p>
              {isReversed && (
                <p style={{
                  fontFamily: 'var(--font-dm-sans-var), sans-serif',
                  fontSize: '11px',
                  color: 'rgba(250,247,240,0.55)',
                  textAlign: 'center',
                  margin: '3px 0 0',
                }}>
                  (Reversed)
                </p>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px', width: '100%' }}>
                <button
                  onClick={handleGetReading}
                  style={{
                    width: '100%',
                    fontFamily: 'var(--font-dm-sans-var), sans-serif',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#1E1256',
                    background: '#C9A84C',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '13px 16px',
                    cursor: 'pointer',
                  }}
                >
                  Get Melissa's take
                </button>

                <button
                  onClick={handleSaveToJournal}
                  disabled={isSaved}
                  style={{
                    width: '100%',
                    fontFamily: 'var(--font-dm-sans-var), sans-serif',
                    fontSize: '14px',
                    color: isSaved ? 'rgba(30,18,86,0.4)' : 'rgba(30,18,86,0.7)',
                    background: isSaved ? 'rgba(250,247,240,0.6)' : '#FAF7F0',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '13px 16px',
                    cursor: isSaved ? 'default' : 'pointer',
                    transition: 'opacity 0.15s ease',
                  }}
                >
                  {isSaved ? 'Saved to journal ✓' : 'Add to journal'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showModal && dailyCard && (
          <CardModal
            card={dailyCard}
            isReversed={isReversed}
            onClose={() => setShowModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
