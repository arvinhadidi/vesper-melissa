"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import styles from "./landing.module.css";
import { useReveal } from "./useReveal";

interface FeatureRowProps {
  reverse?: boolean;
  eyebrow: string;
  title: string;
  body: string;
  mockup: ReactNode;
  /** Transparent Melissa PNG overlapping the mockup's outer corner. */
  melissaSrc?: string;
}

export default function FeatureRow({
  reverse = false,
  eyebrow,
  title,
  body,
  mockup,
  melissaSrc,
}: FeatureRowProps) {
  const reveal = useReveal();
  const reduced = useReducedMotion();
  const visualX = reverse ? 24 : -24;

  return (
    <div
      className={`${styles.featureRow} ${
        reverse ? styles.featureRowReverse : ""
      }`}
    >
      <motion.div
        className={styles.featureVisual}
        {...reveal({ x: visualX })}
      >
        {mockup}
        {melissaSrc && (
          <motion.div
            className={styles.featureMelissa}
            {...(reduced
              ? {}
              : {
                  initial: { opacity: 0, scale: 0.8 },
                  whileInView: { opacity: 1, scale: 1 },
                  viewport: { once: true, amount: 0.15 },
                  transition: {
                    type: "spring" as const,
                    stiffness: 260,
                    damping: 18,
                    delay: 0.15,
                  },
                })}
          >
            <Image
              src={melissaSrc}
              alt=""
              width={130}
              height={130}
              className={styles.featureMelissaImg}
            />
          </motion.div>
        )}
      </motion.div>
      <motion.div
        className={styles.featureText}
        {...reveal({ x: -visualX })}
      >
        <span className={styles.featureEyebrow}>{eyebrow}</span>
        <h3 className={styles.featureTitle}>{title}</h3>
        <p className={styles.featureBody}>{body}</p>
      </motion.div>
    </div>
  );
}
