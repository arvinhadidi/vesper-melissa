'use client';

import { motion } from 'framer-motion';
import TarotCard from './TarotCard';
import { TarotCard as TarotCardType } from '@/lib/cards';

type Size = 'sm' | 'md' | 'lg';

interface CardEntry {
  card: TarotCardType | null;
  isReversed: boolean;
}

interface CardDealProps {
  cards: CardEntry[];
  onCardFlip: (index: number) => void;
  flippedStates: boolean[];
  positionLabels?: string[];
  size?: Size;
  labelVariant?: 'light' | 'dark';
}

export default function CardDeal({
  cards,
  onCardFlip,
  flippedStates,
  positionLabels,
  size = 'md',
  labelVariant = 'light',
}: CardDealProps) {
  const count = cards.length;

  const containerClass =
    count === 1
      ? 'flex justify-center'
      : count === 2
      ? 'flex flex-row justify-center gap-6'
      : 'flex flex-row justify-center gap-4 sm:gap-4 gap-2';

  const resolvedCardSize: Size = count === 3 ? (size === 'lg' ? 'md' : size) : size;

  const colWidthMap: Record<Size, number> = { sm: 100, md: 140, lg: 180 };
  const colWidth = colWidthMap[resolvedCardSize];
  // 10% narrower (rounded) for phone only — cards were too big on narrow screens
  // (the third position label was clipping at the screen edge). Desktop unchanged.
  const colWidthMobile = Math.round(colWidth * 0.9);
  const cardWidthMap: Record<Size, number> = { sm: 100, md: 130, lg: 180 };
  const cardWidthMobile = Math.round(cardWidthMap[resolvedCardSize] * 0.9);

  return (
    <div className={containerClass}>
      <style>{`
        .card-deal-col-${resolvedCardSize} { width: ${colWidth}px; }
        .card-deal-label-${resolvedCardSize} { font-size: 11px; }
        @media (max-width: 700px) {
          .card-deal-col-${resolvedCardSize} { width: ${colWidthMobile}px; }
          .card-deal-card-${resolvedCardSize} { width: ${cardWidthMobile}px !important; }
          .card-deal-label-${resolvedCardSize} { font-size: 9.9px; }
        }
      `}</style>
      {cards.map((entry, i) => (
        <motion.div
          key={i}
          className={`card-deal-col-${resolvedCardSize}`}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          initial={{ x: 0, y: 20, opacity: 0, scale: 0.8 }}
          animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          transition={{
            delay: i * 0.15,
            type: 'spring',
            stiffness: 200,
            damping: 20,
          }}
        >
          {positionLabels?.[i] && (
            <motion.p
              className={`card-deal-label-${resolvedCardSize}`}
              style={{
                fontFamily: 'var(--font-dm-sans-var), sans-serif',
                letterSpacing: '1px',
                textAlign: 'center',
                color: labelVariant === 'dark' ? '#C9A84C' : 'rgba(250,247,240,0.7)',
                height: '42px',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                lineHeight: '1.3',
                margin: 0,
                paddingBottom: '6px',
                width: '100%',
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.15 + 0.1 }}
            >
              {positionLabels[i]}
            </motion.p>
          )}
          <TarotCard
            card={entry.card}
            isReversed={entry.isReversed}
            isFlipped={flippedStates[i] ?? false}
            onFlip={() => onCardFlip(i)}
            size={resolvedCardSize}
            className={`card-deal-card-${resolvedCardSize}`}
          />
        </motion.div>
      ))}
    </div>
  );
}
