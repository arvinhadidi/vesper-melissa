import Link from "next/link";
import styles from "./landing.module.css";

export default function LandingFooter() {
  return (
    <footer className={styles.footer}>
      <p>
        © 2026 Vesper&nbsp;&nbsp;·&nbsp;&nbsp;
        <span>vesper.cards</span>
        &nbsp;&nbsp;·&nbsp;&nbsp;
        <Link href="/privacy" style={{ color: 'inherit', textDecoration: 'underline', textUnderlineOffset: '2px' }}>Privacy</Link>
        &nbsp;&nbsp;·&nbsp;&nbsp;
        <Link href="/tos" style={{ color: 'inherit', textDecoration: 'underline', textUnderlineOffset: '2px' }}>Terms</Link>
      </p>
    </footer>
  );
}
