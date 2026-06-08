'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDailyCardIndex } from '@/lib/cardLogic.js';
import { getCardById, TarotCard } from '@/lib/cards';
import { TEST_USER } from '@/lib/testUser';
import TarotCardComponent from '@/components/tarot/TarotCard';
import MelissaBubble from '@/components/melissa/MelissaBubble';

type MelissaState = 'idle' | 'thinking' | 'streaming' | 'complete';

function formatDate(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function DailyPage() {
  const [isFlipped, setIsFlipped] = useState(false);
  const [melissaState, setMelissaState] = useState<MelissaState>('idle');
  const [melissaText, setMelissaText] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [dailyCard, setDailyCard] = useState<TarotCard | null>(null);
  const [isReversed, setIsReversed] = useState(false);
  const [todayString, setTodayString] = useState('');

  useEffect(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;
    setTodayString(dateStr);

    const cardIndex = getDailyCardIndex(TEST_USER.id, dateStr);
    const reversed = (cardIndex * 7 + dateStr.length) % 10 < 3;
    setDailyCard(getCardById(cardIndex));
    setIsReversed(reversed);
  }, []);

  async function handleGetReading() {
    if (!dailyCard) return;
    setMelissaState('thinking');
    setMelissaText('');

    const response = await fetch('/api/melissa-daily', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cardIndex: dailyCard.id,
        isReversed,
        userProfile: TEST_USER,
      }),
    });

    if (!response.ok || !response.body) {
      setMelissaState('idle');
      return;
    }

    setMelissaState('streaming');
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      setMelissaText(prev => prev + chunk);
    }

    setMelissaState('complete');
  }

  return (
    <div className="relative min-h-screen bg-indigo-deep px-6 pb-32 flex flex-col items-center max-w-[480px] mx-auto">

      {/* Streak indicator */}
      <div className="absolute top-4 right-4">
        <span className="font-cinzel text-[10px] text-cream/25 tracking-wide">Day 1 ◦◦◦</span>
      </div>

      {/* Date + heading */}
      <div className="mt-14 text-center w-full">
        <p className="font-cinzel text-[11px] text-gold tracking-[2px] uppercase">
          {todayString ? formatDate(todayString) : ''}
        </p>
        <h1 className="font-cinzel text-[20px] text-cream mt-1.5">Your card for today</h1>
      </div>

      {/* Card section */}
      <div className="mt-8 flex flex-col items-center">
        <TarotCardComponent
          card={dailyCard}
          isFlipped={isFlipped}
          isReversed={isReversed}
          onFlip={() => setIsFlipped(true)}
          size="lg"
        />

        <AnimatePresence>
          {!isFlipped && (
            <motion.p
              className="font-cinzel italic text-[12px] text-cream/30 mt-4"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              exit={{ opacity: 0 }}
            >
              tap to reveal
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Post-flip content */}
      <AnimatePresence>
        {isFlipped && dailyCard && (
          <motion.div
            className="w-full flex flex-col items-center mt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {/* Card name */}
            <p className="font-cinzel text-[18px] text-gold text-center">{dailyCard.name}</p>
            {isReversed && (
              <p className="font-lato text-[11px] text-cream/50 text-center mt-0.5">(Reversed)</p>
            )}

            {/* Action buttons */}
            <div className="flex gap-2.5 mt-5 w-full">
              <button className="flex-1 font-cinzel text-[13px] text-cream border border-cream/30 rounded-[10px] px-4 py-2.5 hover:border-cream/50 transition-colors">
                Card meaning
              </button>
              <button
                className="flex-1 font-cinzel text-[13px] text-indigo-deep bg-gold rounded-[10px] px-4 py-2.5 hover:opacity-90 transition-opacity disabled:opacity-50"
                onClick={handleGetReading}
                disabled={melissaState !== 'idle'}
              >
                {melissaState === 'idle' ? "Get Melissa's take" : 'Reading…'}
              </button>
            </div>

            {/* Melissa section */}
            <AnimatePresence>
              {melissaState !== 'idle' && (
                <motion.div
                  className="w-full mt-6"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  <MelissaBubble state={melissaState} text={melissaText} />

                  {/* Add to journal */}
                  <AnimatePresence>
                    {melissaState === 'complete' && (
                      <motion.button
                        className="w-full mt-4 font-cinzel text-[13px] text-cream border border-cream/30 rounded-[10px] px-4 py-2.5 hover:border-cream/50 transition-colors disabled:opacity-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4 }}
                        onClick={() => setIsSaved(true)}
                        disabled={isSaved}
                      >
                        {isSaved ? 'Saved ✓' : 'Add to journal ♡'}
                      </motion.button>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
