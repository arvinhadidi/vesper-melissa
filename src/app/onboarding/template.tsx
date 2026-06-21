'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { STEP_ORDER, EASE } from '@/lib/onboarding/constants';
import { track } from '@/lib/analytics';

export default function OnboardingTemplate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const slug = pathname.split('/').pop() ?? '';
  const currentIndex = STEP_ORDER.indexOf(slug as typeof STEP_ORDER[number]);

  // Funnel event: which onboarding step the user reached, and how deep (index). Lets us
  // see drop-off per step in PostHog. Pageviews cover the URLs too, but a named event with
  // the index makes the funnel chart trivial to build.
  useEffect(() => {
    if (currentIndex >= 0) {
      track('onboarding_step_viewed', { step: slug, index: currentIndex, total: STEP_ORDER.length });
    }
  }, [slug, currentIndex]);

  const prevIndexRef = useRef(currentIndex);
  const direction = currentIndex >= prevIndexRef.current ? 1 : -1;
  prevIndexRef.current = currentIndex;

  return (
    <motion.div
      key={pathname}
      initial={{ y: direction * 16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
