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

  const resolvedCardSize: Size = count === 3 ? (size === 'lg' ? 'md' : size === 'md' ? 'sm' : 'sm') : size;

  // Column width matches card width so all labels wrap within the same boundary
  const colWidthMap: Record<Size, number> = { sm: 80, md: 120, lg: 180 };
  const colWidth = colWidthMap[resolvedCardSize];

  return (
    <div className={containerClass}>
      {cards.map((entry, i) => (
        <motion.div
          key={i}
          style={{ width: colWidth, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
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
              style={{
                fontFamily: 'var(--font-dm-sans-var), sans-serif',
                fontSize: '11px',
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
            size={count === 3 ? 'sm' : size}
          />
        </motion.div>
      ))}
    </div>
  );
}
