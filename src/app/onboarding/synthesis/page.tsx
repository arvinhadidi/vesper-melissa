'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useOnboardingData } from '@/lib/onboarding/useOnboardingData';
import { MelissaAvatar } from '@/components/onboarding/MelissaAvatar';
import { ZODIAC_SIGNS, MICRO_CARDS, SYNTHESIS_DURATION, SYNTHESIS_PERSON, SYNTHESIS_GUT } from '@/lib/onboarding/constants';

export default function SynthesisPage() {
  const router = useRouter();
  const { data } = useOnboardingData();
  const [lineIndex, setLineIndex] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);
  const advancedRef = useRef(false);

  const [spreadFirstCard] = useState(() => {
    const pool = MICRO_CARDS.filter(c => c.name !== data.micro_pull_card);
    return pool[Math.floor(Math.random() * pool.length)];
  });

  const signLabel = ZODIAC_SIGNS.find(s => s.value === data.star_sign)?.label ?? data.star_sign ?? '';
  const durationFrag = data.duration_weight ? SYNTHESIS_DURATION[data.duration_weight] ?? '' : '';
  const personLine = data.has_specific_person ? SYNTHESIS_PERSON[data.has_specific_person] ?? '' : '';
  const gutLine = data.gut_feeling ? SYNTHESIS_GUT[data.gut_feeling] ?? '' : '';

  const lines = [
    `Reading your energy, ${data.display_name || 'you'}...`,
    `A ${signLabel}. ${durationFrag}`,
    personLine,
    gutLine,
    'Choosing your spread... three cards.',
    "Here's your first one.",
  ].filter(Boolean);

  const CARD_W = 110;
  const CARD_H = Math.round(CARD_W * 1.75);

  useEffect(() => {
    if (lineIndex >= lines.length) {
      const flipTimer = setTimeout(() => setCardFlipped(true), 400);
      const advTimer = setTimeout(() => {
        if (!advancedRef.current) {
          advancedRef.current = true;
          router.push('/onboarding/social-proof');
        }
      }, 3380);
      return () => { clearTimeout(flipTimer); clearTimeout(advTimer); };
    }
    const t = setTimeout(() => setLineIndex(i => i + 1), 1820);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineIndex, router]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '32px' }}>
      <div style={{ marginBottom: '40px', perspective: '800px' }}>
        <motion.div
          style={{ width: CARD_W, height: CARD_H, position: 'relative', transformStyle: 'preserve-3d' }}
          animate={{ rotateY: cardFlipped ? 180 : 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {!cardFlipped && [2, 1].map(i => (
            <motion.div key={i}
              style={{ position: 'absolute', width: CARD_W, height: CARD_H, left: i * 5, top: i * 4, borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.35)' }}
              animate={{ rotate: [0, i === 1 ? 1.5 : -1.5, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
            >
              <Image src="/card-back.png" alt="" width={CARD_W} height={CARD_H} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
            </motion.div>
          ))}
          <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.4)' }}>
            <Image src="/card-back.png" alt="" width={CARD_W} height={CARD_H} style={{ objectFit: 'cover', width: '100%', height: '100%', display: 'block' }} />
          </div>
          <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 0 32px rgba(201,168,76,0.4), 0 4px 16px rgba(0,0,0,0.5)' }}>
            <Image
              src={`/cards-cropped/${spreadFirstCard.imagePath}.png`}
              alt={spreadFirstCard.name}
              width={CARD_W} height={CARD_H}
              style={{ objectFit: 'cover', width: '100%', height: '100%', display: 'block' }}
            />
          </div>
        </motion.div>
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {lines.slice(0, lineIndex).map((line, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}
          >
            <span style={{ color: '#C9A84C', fontSize: '14px', flexShrink: 0, marginTop: '3px' }}>✦</span>
            <p style={{ fontFamily: 'var(--font-garamond-var), Georgia, serif', fontSize: '17px', fontStyle: 'italic', color: 'rgba(250,247,240,0.85)', lineHeight: 1.55, margin: 0 }}>
              {line}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
