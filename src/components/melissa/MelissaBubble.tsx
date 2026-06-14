'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

type MelissaState = 'idle' | 'thinking' | 'streaming' | 'complete';

interface MelissaBubbleProps {
  state: MelissaState;
  text?: string;
  idleMessage?: string;
}

const avatarSrc: Record<MelissaState, string> = {
  idle: '/melissa/melissa-default.png',
  thinking: '/melissa/melissa-thinking.png',
  streaming: '/melissa/melissa-thinking.png',
  complete: '/melissa/melissa-insight.png',
};

function AvatarFallback() {
  return (
    <div className="w-16 h-16 rounded-full bg-gold flex items-center justify-center flex-shrink-0">
      <span className="font-cinzel font-semibold text-indigo-deep text-xl">M</span>
    </div>
  );
}

function Avatar({ state }: { state: MelissaState }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const src = avatarSrc[state];

  if (errored || !src) return <AvatarFallback />;

  return (
    <div className="relative w-16 h-16 flex-shrink-0">
      {!loaded && <AvatarFallback />}
      <AnimatePresence mode="wait">
        <motion.img
          key={src}
          src={src}
          alt="Melissa"
          className={`w-16 h-16 rounded-full object-cover absolute inset-0 ${loaded ? '' : 'invisible'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: loaded ? 1 : 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
        />
      </AnimatePresence>
    </div>
  );
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-gold"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
      <span className="font-garamond italic text-indigo-deep/70 text-sm ml-1">
        Reading your cards...
      </span>
    </div>
  );
}

function Cursor() {
  return (
    <motion.span
      className="inline-block align-middle ml-0.5 bg-indigo-deep"
      style={{ width: '2px', height: '18px' }}
      animate={{ opacity: [1, 0] }}
      transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
    />
  );
}

export default function MelissaBubble({
  state,
  text,
  idleMessage = "What's been weighing on you?",
}: MelissaBubbleProps) {
  const isComplete = state === 'complete';

  return (
    <motion.div
      className="flex items-start gap-3"
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      <Avatar state={state} />

      {/* Triangle pointer */}
      <div className="relative flex items-start">
        <div
          className="absolute left-[-8px] top-5 w-0 h-0"
          style={{
            borderTop: '6px solid transparent',
            borderBottom: '6px solid transparent',
            borderRight: '8px solid rgba(201,168,76,0.3)',
          }}
        />
        <div
          className="absolute left-[-7px] top-5 w-0 h-0"
          style={{
            borderTop: '6px solid transparent',
            borderBottom: '6px solid transparent',
            borderRight: '8px solid #FAF7F0',
          }}
        />

        <motion.div
          className="relative rounded-2xl px-4 py-4 min-h-16"
          style={{
            backgroundColor: '#FAF7F0',
            border: '1px solid rgba(201,168,76,0.3)',
          }}
          animate={{
            borderColor: isComplete ? '#C9A84C' : 'rgba(201,168,76,0.3)',
            boxShadow: isComplete
              ? '0 0 12px rgba(201,168,76,0.25)'
              : '0 0 0px rgba(201,168,76,0)',
          }}
          transition={{ duration: 0.4 }}
          initial={false}
        >

          {state === 'idle' && (
            <p className="font-garamond italic text-indigo-deep text-sm leading-relaxed">
              {idleMessage}
            </p>
          )}

          {state === 'thinking' && <ThinkingDots />}

          {state === 'streaming' && (
            <p className="font-garamond italic text-indigo-deep text-sm leading-relaxed">
              {text}
              <Cursor />
            </p>
          )}

          {state === 'complete' && (
            <p className="font-garamond italic text-indigo-deep text-sm leading-relaxed">
              {text}
            </p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
