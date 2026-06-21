'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getCardById } from '@/lib/cards';
import CardDeal from '@/components/tarot/CardDeal';

type TourSpreadData = {
  spreadCards: Array<{ cardIndex: number; isReversed: boolean }>;
  positionLabels: string[];
  questionText: string;
  melissaText: string;
  pending?: boolean;
};

export default function TourSpreadPage() {
  const router = useRouter();
  const [tourData, setTourData] = useState<TourSpreadData | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('vesper_tour_spread');
    if (!raw) { setNotFound(true); return; }
    try {
      setTourData(JSON.parse(raw));
    } catch {
      setNotFound(true);
    }
  }, []);

  if (notFound) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: 'var(--font-garamond-var), Georgia, serif', fontSize: '18px', color: 'rgba(250,247,240,0.6)', marginBottom: '24px' }}>
            Your first spread is ready when you visit the Spread tab.
          </p>
          <button
            onClick={() => router.push('/spread')}
            style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '15px', fontWeight: 500, color: '#1E1256', background: '#C9A84C', border: 'none', borderRadius: '12px', padding: '14px 28px', cursor: 'pointer' }}
          >
            Go to Spread
          </button>
        </div>
      </div>
    );
  }

  if (!tourData) return null;

  const cards = tourData.spreadCards.map(c => ({
    card: getCardById(c.cardIndex),
    isReversed: c.isReversed,
  }));

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px 180px',
    }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ textAlign: 'center', marginBottom: '40px', width: '100%' }}
      >
        <p style={{
          fontFamily: 'var(--font-dm-sans-var), sans-serif',
          fontSize: '14px',
          fontWeight: 500,
          color: '#C9A84C',
          letterSpacing: '3.5px',
          textTransform: 'uppercase',
          margin: '0 0 12px',
        }}>
          Your first spread
        </p>
        <h1 style={{
          fontFamily: 'var(--font-dm-serif-var), serif',
          fontSize: 'clamp(30px, 9vw, 40px)',
          fontWeight: 400,
          color: '#FAF7F0',
          margin: 0,
          lineHeight: 1.2,
        }}>
          {tourData.questionText}
        </h1>
      </motion.div>

      {/* Cards — all face-up */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        style={{ marginBottom: '36px', width: '100%' }}
      >
        <CardDeal
          cards={cards}
          onCardFlip={() => {}}
          flippedStates={cards.map(() => true)}
          positionLabels={tourData.positionLabels}
          size="md"
        />
      </motion.div>

      {/* Melissa's reading — same cream bubble + avatar as the real single-reading
          view (MelissaReadingFlow), not a custom box, so the demo matches reality. */}
      {tourData.melissaText ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={{
            width: '100%',
            maxWidth: '440px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <style>{`
            .spread-tour-avatar { width: 48px; height: 48px; }
            @media (max-width: 700px) {
              .spread-tour-avatar { width: 96px; height: 96px; }
            }
          `}</style>
          <img
            src="/melissa/melissa-insight.png"
            alt="Melissa"
            className="spread-tour-avatar"
            style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
          />
          <div style={{
            width: '100%',
            background: '#FAF7F0',
            border: '1px solid rgba(201,168,76,0.3)',
            borderRadius: '16px',
            padding: '14px 16px',
          }}>
            <p style={{
              fontFamily: 'var(--font-garamond-var), Georgia, serif',
              fontStyle: 'italic',
              fontSize: '14.5px',
              color: '#1E1256',
              lineHeight: 1.6,
              margin: 0,
            }}>
              {tourData.melissaText}
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ textAlign: 'center' }}
        >
          <p style={{
            fontFamily: 'var(--font-garamond-var), Georgia, serif',
            fontSize: '16px',
            fontStyle: 'italic',
            color: 'rgba(250,247,240,0.55)',
            margin: 0,
          }}>
            Get Melissa&apos;s reading from the Spread tab.
          </p>
        </motion.div>
      )}
    </div>
  );
}
