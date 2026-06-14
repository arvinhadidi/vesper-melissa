import Image from "next/image";
import styles from "./landing.module.css";

const ENTRIES = [
  {
    title: "What is the energy between us?",
    date: "Today · 3 cards",
    preview:
      "Something in this connection has gone very still, and that stillness is actually the message you need right now…",
  },
  {
    title: "Daily card · The Star",
    date: "Yesterday",
    preview:
      "Hope is quietly returning, Arvin. The Star asks you to trust that the worst of the storm has already passed…",
  },
  {
    title: "Should I reach out first?",
    date: "Monday · 2 cards",
    preview:
      "The cards lean toward courage here. The Knight of Cups suggests the gesture matters more than the outcome…",
  },
];

function CardBackThumb() {
  return (
    <div className={styles.mkThumb} style={{ position: "relative", overflow: "hidden" }}>
      <Image src="/card-back.png" alt="" fill style={{ objectFit: "cover" }} />
    </div>
  );
}

export default function JournalMockup() {
  return (
    <div className={styles.mockup}>
      <div className={styles.mkJhead}>Journal</div>
      {ENTRIES.map((entry) => (
        <div className={styles.mkEntry} key={entry.title}>
          <CardBackThumb />
          <div>
            <div className={styles.mkEtitle}>{entry.title}</div>
            <div className={styles.mkEdate}>{entry.date}</div>
            <div className={styles.mkEtext}>{entry.preview}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
