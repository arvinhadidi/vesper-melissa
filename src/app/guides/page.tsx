import type { Metadata } from 'next';
import Link from 'next/link';
import ContentShell from '@/components/seo/ContentShell';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import ReadingCta from '@/components/seo/ReadingCta';
import { GUIDES } from '@/lib/seo/guides';
import { DEFAULT_OG_IMAGE } from '@/lib/seo/site';
import { SERIF, BODY, CREAM, GOLD, MUTED, HAIRLINE } from '@/components/seo/tokens';

const TITLE = 'Tarot Guides: Spreads, Yes or No, Love Readings and Beginner Basics';
const DESCRIPTION =
  'Practical tarot guides from Vesper: daily readings, yes or no tarot, love readings, the three card spread, the Celtic Cross and how to read tarot as a beginner.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/guides' },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [DEFAULT_OG_IMAGE.url] },
  openGraph: { images: [DEFAULT_OG_IMAGE], url: '/guides', title: TITLE, description: DESCRIPTION },
};

export default function GuidesIndexPage() {
  return (
    <ContentShell>
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Tarot guides', href: '/guides' }]} />
      <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(34px, 6vw, 46px)', fontWeight: 400, color: CREAM, margin: '0 0 16px', lineHeight: 1.15 }}>
        Tarot guides
      </h1>
      <p style={{ fontFamily: BODY, fontSize: '20px', color: MUTED, lineHeight: 1.6, margin: '0 0 32px' }}>
        How to actually read the cards: which spread to use, how to ask a question that gets a useful answer, and what to do
        with what you pull. For individual cards, see <Link href="/cards" style={{ color: GOLD }}>all 78 tarot card meanings</Link>.
      </p>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {GUIDES.map((g) => (
          <li key={g.slug} style={{ borderTop: `1px solid ${HAIRLINE}`, padding: '20px 0' }}>
            <Link href={`/guides/${g.slug}`} style={{ textDecoration: 'none' }}>
              <span style={{ display: 'block', fontFamily: SERIF, fontSize: '24px', color: CREAM, marginBottom: '6px' }}>{g.h1}</span>
              <span style={{ display: 'block', fontFamily: BODY, fontSize: '17px', color: MUTED, lineHeight: 1.5 }}>{g.description}</span>
            </Link>
          </li>
        ))}
      </ul>
      <ReadingCta
        heading="Or skip the homework."
        body="Melissa reads your daily card and full spreads around your real question, in plain words."
      />
    </ContentShell>
  );
}
