"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";
import styles from "./landing.module.css";

interface StatProps {
  target: number;
  format: (value: number) => string;
  label: string;
}

function Stat({ target, format, label }: StatProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const reduced = useReducedMotion();
  // Server-renders the final value so there is no layout shift and
  // reduced-motion users never see the count-up.
  const [display, setDisplay] = useState(format(target));

  useEffect(() => {
    if (!inView || reduced) return;
    const controls = animate(0, target, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (value) => setDisplay(format(value)),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduced, target]);

  return (
    <div className={styles.trustStat} ref={ref}>
      <div className={styles.trustNumber}>{display}</div>
      <div className={styles.trustLabel}>{label}</div>
    </div>
  );
}

export default function TrustStrip() {
  return (
    <section className={styles.trust}>
      <div className={styles.container}>
        <div className={styles.trustRow}>
          <Stat
            target={50000}
            format={(v) => `${Math.round(v).toLocaleString("en-GB")}+`}
            label="readings given"
          />
          <div className={styles.trustDivider} aria-hidden="true"></div>
          <Stat
            target={4.9}
            format={(v) => `${v.toFixed(1)} ★`}
            label="rated by users"
          />
          <div className={styles.trustDivider} aria-hidden="true"></div>
          <Stat
            target={30}
            format={(v) => `${Math.round(v)}+`}
            label="countries"
          />
        </div>
      </div>
    </section>
  );
}
