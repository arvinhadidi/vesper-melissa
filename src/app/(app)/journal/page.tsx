'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { JournalEntry } from '@/lib/types';
import { fetchJournalEntries } from '@/lib/journal';
import JournalEntryCard from '@/components/journal/JournalEntryCard';
import JournalEntryDetail from '@/components/journal/JournalEntryDetail';

export default function JournalPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntry[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    fetchJournalEntries().then(setEntries);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const selected = entries?.find(e => e.id === selectedId) ?? null;

  // First render before localStorage is read — render nothing to avoid flash.
  if (entries === null) return null;

  if (entries.length === 0) {
    return (
      <div style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
      }}>
        <img
          src="/melissa/melissa-default.png"
          alt="Melissa"
          style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', marginBottom: '20px' }}
        />
        <h1 style={{
          fontFamily: 'var(--font-dm-serif-var), serif',
          fontSize: '22px',
          fontWeight: 400,
          color: '#FAF7F0',
          margin: '0 0 8px',
        }}>
          Nothing here yet.
        </h1>
        <p style={{
          fontFamily: 'var(--font-garamond-var), Georgia, serif',
          fontSize: '15px',
          color: 'rgba(250,247,240,0.6)',
          lineHeight: 1.55,
          maxWidth: '300px',
          margin: '0 0 26px',
        }}>
          Your readings will be saved here after you pull cards.
        </p>
        <button
          onClick={() => router.push('/daily')}
          style={{
            fontFamily: 'var(--font-dm-sans-var), sans-serif',
            fontSize: '14px',
            fontWeight: 500,
            color: '#1E1256',
            background: '#C9A84C',
            border: 'none',
            borderRadius: '12px',
            padding: '13px 26px',
            cursor: 'pointer',
          }}
        >
          Pull your daily card
        </button>
      </div>
    );
  }

  return (
    <>
      <div style={{
        minHeight: '100dvh',
        padding: '48px 24px 120px',
      }}>
        <div style={{ marginBottom: '28px' }}>
          <p style={{
            fontFamily: 'var(--font-dm-sans-var), sans-serif',
            fontSize: '11px',
            color: '#C9A84C',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            margin: '0 0 8px',
          }}>
            JOURNAL
          </p>
          <h1 style={{
            fontFamily: 'var(--font-dm-serif-var), serif',
            fontSize: '22px',
            fontWeight: 400,
            color: '#FAF7F0',
            margin: 0,
          }}>
            Your readings
          </h1>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {entries.map(entry => (
            <JournalEntryCard
              key={entry.id}
              entry={entry}
              onOpen={() => setSelectedId(entry.id)}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <JournalEntryDetail
            entry={selected}
            onClose={() => setSelectedId(null)}
            onChange={refresh}
          />
        )}
      </AnimatePresence>
    </>
  );
}
