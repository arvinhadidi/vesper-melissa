"use client";

import { motion } from "framer-motion";
import styles from "./landing.module.css";
import { useReveal } from "./useReveal";
import FeatureRow from "./FeatureRow";
import HomeMockup from "./HomeMockup";
import SpreadMockup from "./SpreadMockup";
import JournalMockup from "./JournalMockup";
import ChatMockup from "./ChatMockup";

export default function FeaturesSection() {
  const reveal = useReveal();

  return (
    <section className={styles.features}>
      <div className={styles.container}>
        <motion.div className={styles.featuresHeading} {...reveal()}>
          <h2 className={styles.sectionHeading}>
            Everything you need.
            <br />
            Nothing you don&rsquo;t.
          </h2>
        </motion.div>

        <FeatureRow
          eyebrow="Every morning"
          title="Card spreads waiting for you, every morning"
          body="Open Vesper and something is already there — your daily card, drawn just for you. Melissa reads it in the context of your life, not a generic interpretation you've seen a hundred times."
          mockup={<HomeMockup />}
          melissaSrc="/landing/melissa_base.png"
        />

        <FeatureRow
          reverse
          eyebrow="Spreads"
          title="Ask anything. Get a real answer."
          body="Bring Melissa your questions — about him, about the decision, about what comes next. She draws the cards and reads the story they're telling."
          mockup={<SpreadMockup />}
          melissaSrc="/landing/melissa_thinking.png"
        />

        <FeatureRow
          eyebrow="Journal"
          title="Every reading, saved"
          body="Your readings collect automatically in a private journal. Look back and see the patterns Melissa has been pointing to all along."
          mockup={<JournalMockup />}
          melissaSrc="/landing/melissa_excited_transparent.png"
        />

        <FeatureRow
          reverse
          eyebrow="Melissa"
          title="Real talk, any time"
          body="A reading doesn't have to end when the cards are down. Keep talking — ask follow-ups, push back, go deeper. Melissa remembers every card she's pulled for you."
          mockup={<ChatMockup />}
        />
      </div>
    </section>
  );
}
