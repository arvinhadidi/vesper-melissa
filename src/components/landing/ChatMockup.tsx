"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import styles from "./landing.module.css";

const BUBBLE_TEXT =
  "Arvin, what I'm seeing here is that something in this connection has gone very still — and that stillness is actually the message. You don't need a grand sign from the universe. You need to decide if you're willing to gently stir things, to speak what's true…";

const MS_PER_CHAR = 18;

export default function ChatMockup() {
  const bubbleRef = useRef<HTMLDivElement>(null);
  const inView = useInView(bubbleRef, { once: true, amount: 0.4 });
  const reduced = useReducedMotion();
  const [chars, setChars] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      const frame = requestAnimationFrame(() => setChars(BUBBLE_TEXT.length));
      return () => cancelAnimationFrame(frame);
    }
    const interval = setInterval(() => {
      setChars((current) => {
        if (current >= BUBBLE_TEXT.length) {
          clearInterval(interval);
          return current;
        }
        return current + 1;
      });
    }, MS_PER_CHAR);
    return () => clearInterval(interval);
  }, [inView, reduced]);

  return (
    <div className={styles.mockup}>
      <div className={styles.mkChatCard}>
        <div className={`${styles.mkThumb} ${styles.mkThumbLarge}`} style={{ position: "relative", overflow: "hidden" }}>
          <Image src="/card-back.png" alt="" fill style={{ objectFit: "cover" }} />
        </div>
        <div>
          <div className={styles.mkCname}>Death</div>
          <div className={styles.mkCrev}>Reversed</div>
        </div>
      </div>
      <div className={styles.mkBubbleRow}>
        <Image
          src="/landing/melissa_base.png"
          alt=""
          width={36}
          height={36}
          className={styles.mkAvatar}
        />
        <div className={styles.mkBubble} ref={bubbleRef}>
          {/* Invisible full text reserves the bubble's final size so
              the typewriter never causes layout shift. */}
          <span className={styles.mkBubbleGhost} aria-hidden="true">
            {BUBBLE_TEXT}
          </span>
          <span className={styles.mkBubbleTyped}>
            {BUBBLE_TEXT.slice(0, chars)}
          </span>
        </div>
      </div>
      <div className={styles.mkBtnGhost}>Carry on the conversation</div>
    </div>
  );
}
