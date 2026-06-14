import styles from "./landing.module.css";

export default function HomeMockup() {
  return (
    <div className={styles.mockup}>
      <div className={styles.mkGreeting}>Good morning, Arvin.</div>
      <div className={styles.mkSub}>What would you like to explore today?</div>
      <div className={styles.mkTile}>
        <span className={styles.mkTileTitle}>Daily Reading</span>
        <span className={styles.mkTileIcon}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#C9A84C"
            strokeWidth="1.6"
          >
            <path d="M16.5 4a8.5 8.5 0 1 0 4 11.5A7 7 0 0 1 16.5 4z" />
          </svg>
        </span>
        <span className={styles.mkTileCap}>
          See what piece of the universe is drawn to you every morning.
        </span>
      </div>
      <div className={styles.mkTile}>
        <span className={styles.mkTileTitle}>Spread</span>
        <span className={styles.mkTileIcon}>
          <svg
            width="22"
            height="20"
            viewBox="0 0 26 22"
            fill="none"
            stroke="#1E1256"
            strokeWidth="1.4"
          >
            <rect
              x="2"
              y="4"
              width="8"
              height="14"
              rx="1.5"
              transform="rotate(-8 6 11)"
            />
            <rect x="9" y="3" width="8" height="14" rx="1.5" />
            <rect
              x="16"
              y="4"
              width="8"
              height="14"
              rx="1.5"
              transform="rotate(8 20 11)"
            />
          </svg>
        </span>
        <span className={styles.mkTileCap}>
          Ask a question. Draw three cards. Receive clarity.
        </span>
      </div>
      <div className={styles.mkTile}>
        <span className={styles.mkTileTitle}>Journal</span>
        <span className={styles.mkTileIcon}>
          <svg
            width="22"
            height="18"
            viewBox="0 0 24 20"
            fill="none"
            stroke="#C9A84C"
            strokeWidth="1.5"
          >
            <path d="M12 4 C9 1.5 4 1.5 2 3 V17 C4 15.5 9 15.5 12 18 C15 15.5 20 15.5 22 17 V3 C20 1.5 15 1.5 12 4 Z M12 4 V18" />
          </svg>
        </span>
        <span className={styles.mkTileCap}>
          Revisit your readings. Track patterns over time.
        </span>
      </div>
    </div>
  );
}
