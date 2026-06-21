'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { getDailyCardIndex } from '@/lib/cardLogic';
import { useOnboardingData } from '@/lib/onboarding/useOnboardingData';
import { PrimaryButton } from '@/components/onboarding/PrimaryButton';
import { MICRO_CARDS, MICRO_CARD_INDICES } from '@/lib/onboarding/constants';

export default function MicroPullPage() {
  const router = useRouter();
  const { data, setData, persist } = useOnboardingData();
  const [flipped, setFlipped] = useState(false);
  const [selectedCard, setSelectedCard] = useState<typeof MICRO_CARDS[number] | null>(null);
  const [displayedText, setDisplayedText] = useState('');
  const [typingDone, setTypingDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [excludedIndex, setExcludedIndex] = useState<number | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const now = new Date();
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      setExcludedIndex(getDailyCardIndex(user.id, dateStr));
    });
  }, []);

  const CARD_W = 150;
  const CARD_H = Math.round(CARD_W * 1.75);

  function handleDeckTap() {
    if (flipped) return;
    const pool = excludedIndex !== null
      ? MICRO_CARDS.filter(c => MICRO_CARD_INDICES[c.imagePath] !== excludedIndex)
      : [...MICRO_CARDS];
    const card = pool[Math.floor(Math.random() * pool.length)];
    setSelectedCard(card);
    setFlipped(true);
    setData(d => ({ ...d, micro_pull_card: card.name }));
  }

  useEffect(() => {
    if (!flipped || !selectedCard) return;
    const full = selectedCard.line;
    let i = 0;
    intervalRef.current = setInterval(() => {
      i++;
      setDisplayedText(full.slice(0, i));
      if (i >= full.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setTypingDone(true);
      }
    }, 22);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [flipped, selectedCard]);

  function handleContinue() {
    persist(data);
    router.push('/onboarding/duration');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <h1 style={{ fontFamily: 'var(--font-dm-serif-var), serif', fontSize: '42px', fontWeight: 400, color: '#FAF7F0', margin: '0 0 10px', lineHeight: 1.25 }}>
        Think of a yes or no question.
      </h1>
      <p style={{ fontFamily: 'var(--font-garamond-var), Georgia, serif', fontSize: '17px', color: 'rgba(250,247,240,0.6)', lineHeight: 1.6, margin: '0 0 40px' }}>
        Don&apos;t tell me. Just hold it. Then tap the deck.
      </p>

      <div style={{ marginBottom: '36px', perspective: '900px' }}>
        <motion.div
          onClick={handleDeckTap}
          style={{ width: CARD_W, height: CARD_H, position: 'relative', cursor: flipped ? 'default' : 'pointer', transformStyle: 'preserve-3d' }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', borderRadius: '12px', overflow: 'hidden' }}>
            <motion.div
              animate={!flipped ? { boxShadow: ['0 0 16px rgba(201,168,76,0.2)', '0 0 40px rgba(201,168,76,0.5)', '0 0 16px rgba(201,168,76,0.2)'] } : { boxShadow: '0 0 8px rgba(201,168,76,0.15)' }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ width: '100%', height: '100%', borderRadius: '12px', overflow: 'hidden' }}
            >
              <Image src="/card-back.png" alt="Card deck" width={CARD_W} height={CARD_H} style={{ objectFit: 'cover', width: '100%', height: '100%', display: 'block' }} />
            </motion.div>
          </div>
          <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.5)' }}>
            {selectedCard && (
              <Image
                src={`/cards-cropped/${selectedCard.imagePath}.png`}
                alt={selectedCard.name}
                width={CARD_W} height={CARD_H}
                style={{ objectFit: 'cover', width: '100%', height: '100%', display: 'block' }}
              />
            )}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {flipped && selectedCard && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', marginBottom: '24px' }}>
            <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '12px', letterSpacing: '2.5px', textTransform: 'uppercase', color: '#C9A84C', margin: '0 0 10px', textAlign: 'center' }}>
              {selectedCard.name}
            </p>
            <p style={{ fontFamily: 'var(--font-garamond-var), Georgia, serif', fontSize: '18px', fontStyle: 'italic', color: 'rgba(250,247,240,0.85)', lineHeight: 1.65, textAlign: 'center', margin: 0 }}>
              {displayedText}
              {!typingDone && (
                <motion.span
                  animate={{ opacity: [1, 0] }} transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
                  style={{ display: 'inline-block', width: '2px', height: '17px', background: '#C9A84C', marginLeft: '2px', verticalAlign: 'middle' }}
                />
              )}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {typingDone && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ width: '100%' }}>
            <PrimaryButton onClick={handleContinue}>Continue</PrimaryButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
