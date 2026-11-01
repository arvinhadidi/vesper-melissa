import Link from 'next/link';
import { GUIDES } from '@/lib/seo/guides';
import { FEATURED_CARD_SLUGS, getCardBySlug } from '@/lib/seo/cards';
import { QUESTION_PAGES } from '@/lib/seo/questions';
import { READING_CTA_HREF } from '@/lib/seo/site';
import { SERIF, UI, CREAM, GOLD, FAINT, HAIRLINE } from './tokens';

// Page chrome for the public content pages: brand header, centred reading column, link-rich footer.
// Uses the same bluer indigo gradient as the legal pages (pre-trial theme, see CLAUDE.md).

const navLink = { fontFamily: UI, fontSize: '14px', color: CREAM, textDecoration: 'none', opacity: 0.8 } as const;
const footLink = { color: FAINT, textDecoration: 'none', display: 'block', margin: '0 0 8px' } as const;

export default function ContentShell({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div style={{ minHeight: '100dvh', background: 'linear-gradient(to bottom, #1E1256 0%, #15103A 100%)' }}>
      <header style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
        <nav
          aria-label="Main"
          style={{
            maxWidth: wide ? '1040px' : '760px',
            margin: '0 auto',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            flexWrap: 'wrap',
          }}
        >
          <Link href="/" style={{ fontFamily: SERIF, fontSize: '24px', color: CREAM, textDecoration: 'none', marginRight: 'auto' }}>
            Vesper
          </Link>
          <Link href="/cards" style={navLink}>Card meanings</Link>
          <Link href="/guides" style={navLink}>Guides</Link>
          <Link href="/questions" style={navLink}>Questions</Link>
          <Link href="/zodiac" style={navLink}>Zodiac</Link>
          <Link
            href={READING_CTA_HREF}
            style={{ ...navLink, opacity: 1, color: GOLD, border: `1px solid ${GOLD}`, borderRadius: '999px', padding: '6px 14px' }}
          >
            Free reading
          </Link>
        </nav>
      </header>
      <main style={{ maxWidth: wide ? '1040px' : '760px', margin: '0 auto', padding: '32px 20px 72px' }}>{children}</main>
      <footer style={{ borderTop: `1px solid ${HAIRLINE}`, padding: '40px 20px 56px' }}>
        <div
          style={{
            maxWidth: '1040px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '28px',
            fontFamily: UI,
            fontSize: '14px',
          }}
        >
          <div>
            <p style={{ fontFamily: SERIF, fontSize: '20px', color: CREAM, margin: '0 0 10px' }}>Vesper</p>
            <p style={{ color: FAINT, margin: '0 0 8px', lineHeight: 1.5 }}>
              Daily tarot readings and question-led spreads with Melissa, your personal oracle.
            </p>
            <Link href={READING_CTA_HREF} style={{ ...footLink, color: GOLD }}>Start your free reading</Link>
          </div>
          <div>
            <p style={{ color: CREAM, margin: '0 0 10px', fontWeight: 500 }}>Tarot guides</p>
            {GUIDES.map((g) => (
              <Link key={g.slug} href={`/guides/${g.slug}`} style={footLink}>{g.h1.split(':')[0]}</Link>
            ))}
          </div>
          <div>
            <p style={{ color: CREAM, margin: '0 0 10px', fontWeight: 500 }}>Popular cards</p>
            {FEATURED_CARD_SLUGS.map((s) => {
              const c = getCardBySlug(s);
              return c ? <Link key={s} href={`/cards/${s}`} style={footLink}>{c.name} meaning</Link> : null;
            })}
            <Link href="/cards" style={footLink}>All 78 tarot cards</Link>
          </div>
          <div>
            <p style={{ color: CREAM, margin: '0 0 10px', fontWeight: 500 }}>Ask the cards</p>
            {QUESTION_PAGES.map((q) => (
              <Link key={q.slug} href={`/questions/${q.slug}`} style={footLink}>{q.question}</Link>
            ))}
            <Link href="/zodiac" style={{ ...footLink, marginTop: '14px' }}>Tarot by zodiac sign</Link>
          </div>
          <div>
            <p style={{ color: CREAM, margin: '0 0 10px', fontWeight: 500 }}>Vesper</p>
            <Link href="/" style={footLink}>Home</Link>
            <Link href="/privacy" style={footLink}>Privacy</Link>
            <Link href="/tos" style={footLink}>Terms</Link>
            <p style={{ color: FAINT, margin: '16px 0 0', fontSize: '12px' }}>© 2026 Vesper · vesper.cards</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
