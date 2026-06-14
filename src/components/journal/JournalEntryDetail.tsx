'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { JournalEntry, ResonanceRating } from '@/lib/types';
import { getCardById, getCardImagePath } from '@/lib/cards';
import { updateJournalEntry, deleteJournalEntry } from '@/lib/journal';
import { useUserProfile } from '@/lib/hooks/useUserProfile';

function formatFullDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

const RESONANCE_OPTIONS: { value: ResonanceRating; label: string }[] = [
  { value: 'yes', label: 'Yes, pretty much' },
  { value: 'some', label: 'Some of it' },
  { value: 'no', label: 'Not really' },
];

function ResonanceFollowUp({ entryId }: { entryId: string }) {
  const [rated, setRated] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  function handleRate(rating: ResonanceRating) {
    updateJournalEntry(entryId, { resonanceRating: rating });
    setRated(true);
    setTimeout(() => setDismissed(true), 2600);
  }

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
          transition={{ duration: 0.4 }}
          style={{ marginTop: '28px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}
        >
          <img
            src="/melissa/melissa-default.png"
            alt="Melissa"
            style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
          />
          <div style={{ flex: 1 }}>
            <div style={{
              background: 'rgba(201,168,76,0.1)',
              border: '1px solid rgba(201,168,76,0.3)',
              borderRadius: '14px',
              padding: '12px 14px',
            }}>
              <p style={{
                fontFamily: 'var(--font-dm-serif-var), serif',
                fontStyle: 'italic',
                fontSize: '14px',
                color: '#FAF7F0',
                lineHeight: 1.5,
                margin: 0,
              }}>
                {rated
                  ? 'Good to know. That helps me understand what lands.'
                  : 'Looking back at this one, did anything ring true?'}
              </p>
            </div>

            {!rated && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginTop: '10px' }}>
                {RESONANCE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleRate(opt.value)}
                    style={{
                      fontFamily: 'var(--font-dm-sans-var), sans-serif',
                      fontSize: '12.5px',
                      color: '#FAF7F0',
                      background: 'transparent',
                      border: '1px solid rgba(250,247,240,0.3)',
                      borderRadius: '10px',
                      padding: '9px 14px',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function JournalEntryDetail({
  entry,
  onClose,
  onChange,
}: {
  entry: JournalEntry;
  onClose: () => void;
  onChange: () => void;
}) {
  const router = useRouter();
  const { profile } = useUserProfile();
  const [impression, setImpression] = useState(entry.impression ?? '');
  const [showResonance, setShowResonance] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Option B appears only for entries older than 5 days that have no rating yet.
  // Computed in an effect so render stays pure (no Date.now() during render).
  useEffect(() => {
    const days = (Date.now() - new Date(entry.savedAt).getTime()) / 86_400_000;
    setShowResonance(days > 5 && entry.resonanceRating == null);
  }, [entry.savedAt, entry.resonanceRating]);

  // Debounced autosave of the user's note (800ms after they stop typing).
  useEffect(() => {
    if (impression === (entry.impression ?? '')) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      updateJournalEntry(entry.id, { impression: impression.trim() === '' ? null : impression });
      onChange();
    }, 800);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [impression, entry.id, entry.impression, onChange]);

  function handleDelete() {
    deleteJournalEntry(entry.id);
    onChange();
    onClose();
  }

  // Rehydrate the reading session from the saved entry, then open its reading
  // page. This keeps it working within the current browser session; durable
  // cross-session viewing will arrive when readings persist to Supabase.
  function handleViewReading() {
    if (!profile) return;
    if (entry.type === 'daily') {
      const c = entry.cards[0];
      sessionStorage.setItem(`reading-${entry.id}`, JSON.stringify({
        type: 'daily',
        card: getCardById(c.cardIndex),
        isReversed: c.isReversed,
        userProfile: profile,
        readingText: entry.melissaText,
        emojiReaction: entry.emojiReaction,
      }));
      router.push(`/daily/${entry.id}`);
    } else {
      sessionStorage.setItem(`reading-${entry.id}`, JSON.stringify({
        type: 'spread',
        questionText: entry.questionText,
        cards: entry.cards,
        positionLabels: entry.positionLabels,
        promptContext: '',
        userProfile: profile,
        readingText: entry.melissaText,
        emojiReaction: entry.emojiReaction,
      }));
      router.push(`/spread/${entry.id}`);
    }
  }

  const title = entry.type === 'daily' ? 'Daily Card' : entry.questionText ?? 'Spread';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(10,6,30,0.7)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        zIndex: 60,
      }}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
        style={{
          background: '#1E1256',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          width: '100%',
          maxWidth: '520px',
          maxHeight: '92dvh',
          overflowY: 'auto',
          padding: '14px 22px 40px',
          position: 'relative',
        }}
      >
        {/* Grab handle */}
        <div style={{
          width: '40px', height: '4px', borderRadius: '2px',
          background: 'rgba(250,247,240,0.25)', margin: '0 auto 18px',
        }} />

        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '18px', right: '20px',
            background: 'rgba(250,247,240,0.08)', border: 'none', borderRadius: '50%',
            width: '30px', height: '30px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', color: 'rgba(250,247,240,0.6)',
            fontSize: '16px', lineHeight: 1,
          }}
          aria-label="Close"
        >×</button>

        <p style={{
          fontFamily: 'var(--font-dm-sans-var), sans-serif',
          fontSize: '11px',
          color: '#C9A84C',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          margin: '0 0 6px',
        }}>
          {formatFullDate(entry.savedAt)}
        </p>
        <h2 style={{
          fontFamily: 'var(--font-dm-serif-var), serif',
          fontSize: '20px',
          fontWeight: 400,
          color: '#FAF7F0',
          margin: '0 0 22px',
          lineHeight: 1.35,
        }}>
          {title}
        </h2>

        {/* Cards */}
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: entry.cards.length > 1 ? 'center' : 'flex-start', marginBottom: '26px' }}>
          {entry.cards.map((c, i) => {
            const card = getCardById(c.cardIndex);
            return (
              <div key={i} style={{ width: '88px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <img
                  src={getCardImagePath(card.name_short)}
                  alt={card.name}
                  style={{
                    width: '88px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    transform: c.isReversed ? 'rotate(180deg)' : 'none',
                  }}
                />
                <span style={{
                  fontFamily: 'var(--font-dm-serif-var), serif',
                  fontSize: '11.5px',
                  color: '#C9A84C',
                  textAlign: 'center',
                  lineHeight: 1.3,
                }}>
                  {card.name}{c.isReversed ? ' (R)' : ''}
                </span>
                {entry.positionLabels?.[i] && (
                  <span style={{
                    fontFamily: 'var(--font-dm-sans-var), sans-serif',
                    fontSize: '9px',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    color: 'rgba(250,247,240,0.5)',
                    textAlign: 'center',
                  }}>
                    {entry.positionLabels[i]}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Melissa's reading */}
        {entry.melissaText && (
          <p style={{
            fontFamily: 'var(--font-garamond-var), Georgia, serif',
            fontSize: '15px',
            color: 'rgba(250,247,240,0.85)',
            lineHeight: 1.7,
            margin: '0 0 28px',
          }}>
            {entry.melissaText}
          </p>
        )}

        {/* View the full reading */}
        <button
          onClick={handleViewReading}
          style={{
            width: '100%',
            fontFamily: 'var(--font-dm-sans-var), sans-serif',
            fontSize: '13px',
            fontWeight: 500,
            color: '#C9A84C',
            background: 'transparent',
            border: '1px solid rgba(201,168,76,0.5)',
            borderRadius: '12px',
            padding: '12px 16px',
            cursor: 'pointer',
            textAlign: 'center',
            marginBottom: '28px',
          }}
        >
          View Reading
        </button>

        {/* My Take */}
        <div style={{ marginBottom: '6px' }}>
          <p style={{
            fontFamily: 'var(--font-dm-sans-var), sans-serif',
            fontSize: '11px',
            color: '#C9A84C',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            margin: '0 0 10px',
          }}>
            My Take
          </p>
          <textarea
            value={impression}
            onChange={e => setImpression(e.target.value)}
            placeholder="What was on your mind..."
            style={{
              width: '100%',
              minHeight: '90px',
              boxSizing: 'border-box',
              background: 'rgba(250,247,240,0.04)',
              border: '1px solid rgba(250,247,240,0.15)',
              borderRadius: '12px',
              padding: '12px 14px',
              fontFamily: 'var(--font-garamond-var), Georgia, serif',
              fontStyle: 'italic',
              fontSize: '14px',
              color: 'rgba(250,247,240,0.85)',
              lineHeight: 1.6,
              resize: 'none',
              outline: 'none',
            }}
          />
        </div>

        {/* Option B — did this ring true? */}
        {showResonance && (
          <ResonanceFollowUp entryId={entry.id} />
        )}

        {/* Delete */}
        <div style={{ textAlign: 'center', marginTop: '28px' }}>
          <button
            onClick={handleDelete}
            style={{
              fontFamily: 'var(--font-dm-sans-var), sans-serif',
              fontSize: '11.5px',
              color: 'rgba(250,247,240,0.4)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
            }}
          >
            Delete this entry
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
