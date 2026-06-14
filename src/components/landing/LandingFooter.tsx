import styles from "./landing.module.css";

export default function LandingFooter() {
  return (
    <footer className={styles.footer}>
      <p>
        © 2026 Vesper&nbsp;&nbsp;·&nbsp;&nbsp;
        <span>vesper.cards</span>
        &nbsp;&nbsp;·&nbsp;&nbsp;
        <span>Privacy</span>
        &nbsp;&nbsp;·&nbsp;&nbsp;
        <span>Terms</span>
      </p>
    </footer>
  );
}
