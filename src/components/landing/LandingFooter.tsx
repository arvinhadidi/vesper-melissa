import Link from "next/link";
import styles from "./landing.module.css";
import { FEATURED_CARD_SLUGS, getCardBySlug } from "@/lib/seo/cards";

const linkStyle = { color: 'inherit', textDecoration: 'underline', textUnderlineOffset: '2px' } as const;
const sep = <>&nbsp;&nbsp;·&nbsp;&nbsp;</>;

export default function LandingFooter() {
  return (
    <footer className={styles.footer}>
      <nav aria-label="Tarot meanings" style={{ marginBottom: '14px' }}>
        <p>
          <Link href="/cards" style={linkStyle}>Tarot card meanings</Link>
          {sep}
          <Link href="/guides" style={linkStyle}>Tarot guides</Link>
          {sep}
          <Link href="/questions" style={linkStyle}>Tarot questions</Link>
          {sep}
          <Link href="/zodiac" style={linkStyle}>Tarot by zodiac sign</Link>
        </p>
        <p style={{ marginTop: '8px' }}>
          {FEATURED_CARD_SLUGS.map((slug, i) => {
            const card = getCardBySlug(slug);
            if (!card) return null;
            return (
              <span key={slug}>
                {i > 0 && sep}
                <Link href={`/cards/${slug}`} style={linkStyle}>{card.name}</Link>
              </span>
            );
          })}
        </p>
      </nav>
      <p>
        © 2026 Vesper{sep}
        <span>vesper.cards</span>
        {sep}
        <Link href="/privacy" style={linkStyle}>Privacy</Link>
        {sep}
        <Link href="/tos" style={linkStyle}>Terms</Link>
      </p>
    </footer>
  );
}
