"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import styles from "./landing.module.css";
import { useReveal } from "./useReveal";

const FAN_ROTATIONS = [-15, 9, -6, 6, -10, 14];

export default function FinalCta() {
  const reveal = useReveal();

  return (
    <section className={styles.finalCta}>
      <div className={styles.container}>
        <div className={styles.finalCtaContent}>
          {/* Deliberately NOT animated: the multiply blend that keeps
              Melissa's halo on the dark background breaks if she or any
              ancestor gets a transform, opacity or filter. */}
          <div className={styles.finalMelissaGlow}>
            <Image
              src="/landing/melissa_excited_transparent.png"
              alt="Melissa, glowing with excitement"
              width={200}
              height={200}
              className={styles.heroMelissaImg}
            />
          </div>
          {/* <motion.span className={styles.eyebrow} {...reveal()}>
            Begin your reading
          </motion.span> */}
          <motion.h2 className={styles.finalHeadingGold} {...reveal({ delay: 0.08 })}>
            Melissa is waiting.
          </motion.h2>
          <motion.p className={styles.finalSub} {...reveal({ delay: 0.16 })}>
            Your first 3 days are free.
            <br />
            No card required. Cancel any time.
          </motion.p>
          <motion.div {...reveal({ delay: 0.24 })}>
            <a href="/signin" className={styles.btnFinal}>
              Start free trial →
            </a>
            <p className={styles.finalFineprint}>
              Then £9.99 / month · Cancel anytime
            </p>
          </motion.div>

          <motion.div
            className={styles.tarotFan}
            aria-hidden="true"
            {...reveal({ delay: 0.32 })}
          >
            {FAN_ROTATIONS.map((rotation, i) => (
              <div
                key={i}
                style={{
                  transform: `rotate(${rotation}deg)`,
                  width: 36,
                  height: 60,
                  borderRadius: 4,
                  overflow: "hidden",
                  flexShrink: 0,
                  position: "relative",
                }}
              >
                <Image src="/card-back.png" alt="" fill style={{ objectFit: "cover" }} />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
