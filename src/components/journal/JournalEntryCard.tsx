'use client';

import { motion } from 'framer-motion';
import { JournalEntry } from '@/lib/types';
import { getCardById, getCardImagePath } from '@/lib/cards';

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + '...';
}

export default function JournalEntryCard({
  entry,
  onOpen,
}: {
  entry: JournalEntry;
  onOpen: () => void;
}) {
  const title =
    entry.type === 'daily'
      ? 'Daily Card'
      : truncate(entry.questionText ?? 'Spread', 40);

  return (
    <motion.button
      onClick={onOpen}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        background: '#FAF7F0',
        border: '1px solid rgba(201,168,76,0.25)',
        borderRadius: '16px',
        padding: '16px 18px',
        cursor: 'pointer',
      }}
    >
      <p style={{
        fontFamily: 'var(--font-dm-serif-var), serif',
        fontSize: '12px',
        color: 'rgba(30,18,86,0.5)',
        margin: '0 0 4px',
      }}>
        {formatShortDate(entry.savedAt)}
      </p>

      <p style={{
        fontFamily: 'var(--font-garamond-var), Georgia, serif',
        fontSize: '15.5px',
        color: '#1E1256',
        margin: '0 0 14px',
        lineHeight: 1.4,
      }}>
        {title}
      </p>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: entry.melissaText ? '14px' : 0 }}>
        {entry.cards.map((c, i) => {
          const card = getCardById(c.cardIndex);
          return (
            <div key={i} style={{ width: '46px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <img
                src={getCardImagePath(card.name_short)}
                alt={card.name}
                style={{
                  width: '46px',
                  borderRadius: '5px',
                  boxShadow: '0 2px 6px rgba(30,18,86,0.15)',
                  transform: c.isReversed ? 'rotate(180deg)' : 'none',
                }}
              />
              <span style={{
                fontFamily: 'var(--font-dm-sans-var), sans-serif',
                fontSize: '8px',
                lineHeight: 1.2,
                color: 'rgba(30,18,86,0.55)',
                textAlign: 'center',
              }}>
                {card.name}{c.isReversed ? ' (R)' : ''}
              </span>
            </div>
          );
        })}
      </div>

      {entry.melissaText && (
        <p style={{
          fontFamily: 'var(--font-garamond-var), Georgia, serif',
          fontSize: '13.5px',
          color: 'rgba(30,18,86,0.7)',
          lineHeight: 1.55,
          margin: 0,
        }}>
          {truncate(entry.melissaText, 120)}
        </p>
      )}

      {entry.impression && (
        <p style={{
          fontFamily: 'var(--font-garamond-var), Georgia, serif',
          fontStyle: 'italic',
          fontSize: '12.5px',
          color: 'rgba(30,18,86,0.55)',
          lineHeight: 1.5,
          margin: '10px 0 0',
          paddingLeft: '10px',
          borderLeft: '2px solid rgba(201,168,76,0.4)',
        }}>
          {truncate(entry.impression, 100)}
        </p>
      )}
    </motion.button>
  );
}
