'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTour } from './TourProvider';
import { TOUR_STEPS } from '@/lib/tour';

export default function TourOverlay() {
  const { isActive, currentStep, currentStepIndex, nextStep, skipTour } = useTour();
  const isLastStep = currentStepIndex === TOUR_STEPS.length - 1;
  // Self-guided steps (e.g. /daily/tour) render their own UI and suppress this tooltip.
  const isOnTourRoute = currentStep !== null && !currentStep.hideOverlay;

  return (
    <AnimatePresence>
      {isActive && isOnTourRoute && (
        <>
          {/* left/right margins (not left:50%+transform) keep this reliably within
              the viewport at any width. bottom clears BottomNav on phone — it used
              to sit right on top of it (BottomNav's z-index is 110, higher than
              this used to be, so the nav rendered over part of this box). */}
          <style>{`
            .tour-overlay-box { left: 16px; right: 16px; bottom: 100px; }
            @media (min-width: 700px) {
              .tour-overlay-box { left: 50%; right: auto; transform: translateX(-50%); width: calc(100% - 32px); max-width: 488px; bottom: 24px; }
            }
          `}</style>
          <motion.div
            key={`tour-step-${currentStepIndex}`}
            className="tour-overlay-box"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'fixed',
              zIndex: 120,
              background: '#FAF7F0',
              border: '1px solid rgba(201,168,76,0.4)',
              borderRadius: '20px',
              padding: '24px 24px 20px',
              boxShadow: '0 -4px 32px rgba(0,0,0,0.3), 0 8px 40px rgba(0,0,0,0.25)',
            }}
          >
          <button
            onClick={skipTour}
            aria-label="Close"
            style={{
              position: 'absolute',
              top: '14px',
              right: '14px',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              background: 'none',
              borderRadius: '50%',
              color: 'rgba(30,18,86,0.4)',
              cursor: 'pointer',
              fontSize: '18px',
              lineHeight: 1,
            }}
          >
            ×
          </button>

          {/* Step dots */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === currentStepIndex ? '18px' : '6px',
                  height: '6px',
                  borderRadius: '3px',
                  background: i === currentStepIndex ? '#C9A84C' : 'rgba(201,168,76,0.3)',
                  transition: 'width 0.2s ease, background 0.2s ease',
                }}
              />
            ))}
          </div>

          {/* Title */}
          <p style={{
            fontFamily: 'var(--font-dm-serif-var), serif',
            fontSize: '20px',
            fontWeight: 400,
            color: '#1E1256',
            margin: '0 0 8px',
            lineHeight: 1.2,
          }}>
            {currentStep?.title}
          </p>

          {/* Body */}
          <p style={{
            fontFamily: 'var(--font-dm-sans-var), sans-serif',
            fontSize: '14px',
            color: 'rgba(30,18,86,0.65)',
            margin: '0 0 20px',
            lineHeight: 1.55,
          }}>
            {currentStep?.body}
          </p>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <button
              onClick={skipTour}
              style={{
                fontFamily: 'var(--font-dm-sans-var), sans-serif',
                fontSize: '13px',
                color: 'rgba(30,18,86,0.4)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px 0',
              }}
            >
              Skip tour
            </button>

            <button
              onClick={nextStep}
              style={{
                fontFamily: 'var(--font-dm-sans-var), sans-serif',
                fontSize: '14px',
                fontWeight: 600,
                color: '#1E1256',
                background: '#C9A84C',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 22px',
                cursor: 'pointer',
                letterSpacing: '0.2px',
              }}
            >
              {isLastStep ? 'Done ✦' : 'Next →'}
            </button>
          </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
