'use client';

import { motion } from 'framer-motion';
import { TarotCard as TarotCardType } from '@/lib/cards';
import { getCardImagePath } from '@/lib/cards';

type Size = 'sm' | 'md' | 'lg';

interface TarotCardProps {
  card: TarotCardType | null;
  isReversed?: boolean;
  isFlipped?: boolean;
  onFlip?: () => void;
  size?: Size;
  animateIn?: boolean;
  // Extra class for callers that need a narrower size override (e.g. CardDeal's
  // mobile-only shrink) without touching the default sizeClasses every other
  // single-card usage (the daily card) relies on.
  className?: string;
}

const sizeClasses: Record<Size, string> = {
  sm: 'w-[100px]',
  md: 'w-[130px]',
  lg: 'w-[180px]',
};


export function TarotCard({
  card,
  isReversed = false,
  isFlipped = false,
  onFlip,
  size = 'md',
  animateIn = false,
  className = '',
}: TarotCardProps) {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        className={`${sizeClasses[size]} ${className} aspect-[300/527] cursor-pointer drop-shadow-[0_4px_8px_rgba(0,0,0,0.45)]`}
        initial={animateIn ? { y: 20, opacity: 0 } : false}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        onClick={onFlip}
        style={{ perspective: '1000px' }}
      >
        <motion.div
          initial={{ rotateY: isFlipped ? 180 : 0 }}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="relative w-full h-full"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Card back */}
          <motion.div
            className="absolute inset-0 rounded-xl overflow-hidden"
            style={{ backfaceVisibility: 'hidden' }}
            animate={{
              boxShadow: ['0 0 0px rgba(201,168,76,0)', '0 0 16px rgba(201,168,76,0.4)', '0 0 0px rgba(201,168,76,0)'],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <img src="/card-back.png" alt="" className="w-full h-full object-contain" aria-hidden="true" />
          </motion.div>

          {/* Card front */}
          <div
            className="absolute inset-0 rounded-xl overflow-hidden bg-[#FAF7F0] shadow-md"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            {card && (
              <img
                src={getCardImagePath(card.name_short)}
                alt={card.name}
                className="w-full h-full object-cover"
                style={isReversed ? { transform: 'rotate(180deg)' } : undefined}
              />
            )}
          </div>
        </motion.div>
      </motion.div>

    </div>
  );
}

export default TarotCard;
