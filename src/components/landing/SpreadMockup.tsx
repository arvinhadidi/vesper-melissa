"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import styles from "./landing.module.css";

interface DealtCardProps {
  index: number;
  position: string;
  reversed?: boolean;
}

function DealtCard({ index, position, reversed }: DealtCardProps) {
  const reduced = useReducedMotion();
  return (
    <div>
      <span className={styles.mkPos}>{position}</span>
      <motion.div
        className={`${styles.mkCard} ${reversed ? styles.mkCardReversed : ""}`}
        {...(reduced
          ? {}
          : {
              initial: { opacity: 0, y: 14 },
              whileInView: { opacity: 1, y: 0 },
              viewport: { once: true, amount: 0.3 },
              transition: {
                duration: 0.45,
                ease: "easeOut" as const,
                delay: 0.25 + index * 0.08,
              },
            })}
      >
        <Image
          src="/card-back.png"
          alt=""
          fill
          style={{ objectFit: "cover", borderRadius: "8px" }}
        />
      </motion.div>
    </div>
  );
}

export default function SpreadMockup() {
  return (
    <div className={styles.mockup}>
      <div className={styles.mkQ}>What is the energy between us?</div>
      <div className={styles.mkCards}>
        <DealtCard index={0} position="What you bring" reversed />
        <DealtCard index={1} position="What they bring" />
        <DealtCard index={2} position="What exists between you" />
      </div>
      <div className={styles.mkBtnGold}>Get Melissa&rsquo;s take</div>
    </div>
  );
}
