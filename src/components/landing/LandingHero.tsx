"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import styles from "./landing.module.css";
import { track } from "@/lib/analytics";

const STAGGER = 0.12;

export default function LandingHero() {
  const reduced = useReducedMotion();

  const enter = (step: number, scale = false) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 28, ...(scale ? { scale: 0.96 } : {}) },
          animate: { opacity: 1, y: 0, ...(scale ? { scale: 1 } : {}) },
          transition: {
            duration: 0.65,
            ease: "easeOut" as const,
            delay: step * STAGGER,
          },
        };

  return (
    <header className={styles.hero}>
      <div className={styles.heroContent}>
        <motion.h1 className={styles.heroHeadline} {...enter(1)}>
          What the <span style={{ color: "var(--gold)" }}>cards</span>
          <br />
          have been trying
          <br />
          to tell you
        </motion.h1>
        <motion.div className={styles.heroMelissaGlow} {...enter(2, true)}>
          <motion.div
            animate={reduced ? undefined : { y: [0, -6, 0] }}
            transition={{
              duration: 6,
              ease: "easeInOut",
              repeat: Infinity,
              delay: 1,
            }}
          >
            <Image
              src="/landing/melissa_base.png"
              alt="Melissa, your tarot guide"
              width={270}
              height={270}
              priority
              className={styles.heroMelissaImg}
              style={{
                /* Single mask layer only: multi-layer masks with
                   mask-composite render as a hard square edge on iOS Safari. */
                maskImage: 'radial-gradient(ellipse 78% 70% at 50% 36%, black 50%, transparent 95%)',
                WebkitMaskImage: 'radial-gradient(ellipse 78% 70% at 50% 36%, black 50%, transparent 95%)',
              }}
            />
          </motion.div>
        </motion.div>
        <motion.p className={styles.heroSub} {...enter(3)}>
          Meet Melissa. Your personal oracle, available every day for the
          clarity you&rsquo;ve been looking for.
        </motion.p>
        <motion.div {...enter(4)}>
          <a
            href="/onboarding"
            className={styles.btnPrimary}
            onClick={() => track("landing_cta_clicked", { location: "hero" })}
          >
            Start your free reading
          </a>
        </motion.div>
      </div>
    </header>
  );
}
