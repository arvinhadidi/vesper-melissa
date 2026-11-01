import type { Metadata } from 'next';
import Link from 'next/link';
import ContentShell from '@/components/seo/ContentShell';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import JsonLd from '@/components/seo/JsonLd';
import ReadingCta from '@/components/seo/ReadingCta';
import { ZODIAC_SIGNS } from '@/lib/seo/zodiac';
import { getCardBySlug } from '@/lib/seo/cards';
import { DEFAULT_OG_IMAGE, absoluteUrl } from '@/lib/seo/site';
import { SERIF, BODY, UI, CREAM, GOLD, MUTED, FAINT, HAIRLINE } from '@/components/seo/tokens';

const TITLE = 'Tarot by Zodiac Sign: Your Tarot Card and Court Card for All 12 Signs';
const DESCRIPTION =
  'Which tarot card is your zodiac sign? The Major Arcana card and court card for all 12 signs, what each sign tends to ask the cards, and spreads to try.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/zodiac' },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [DEFAULT_OG_IMAGE.url] },
  openGraph: { images: [DEFAULT_OG_IMAGE], url: '/zodiac', title: TITLE, description: DESCRIPTION },
};

export default function ZodiacIndexPage() {
  return (
    <ContentShell>
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Tarot by zodiac sign', href: '/zodiac' }]} />
      <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(34px, 6vw, 46px)', fontWeight: 400, color: CREAM, margin: '0 0 16px', lineHeight: 1.15 }}>
        Tarot by zodiac sign
      </h1>
      <p style={{ fontFamily: BODY, fontSize: '20px', color: MUTED, lineHeight: 1.6, margin: '0 0 12px' }}>
        Every sign has a Major Arcana card from the traditional astrological correspondences, and a court card that matches
        its element. They are not a fortune, more a mirror: the habits you bring to a reading, and the questions you keep
        circling back to. Find your sign below.
      </p>
      <p style={{ fontFamily: UI, fontSize: '14px', color: MUTED, margin: '0 0 28px' }}>
        Looking for a specific question instead? See <Link href="/questions" style={{ color: GOLD }}>questions people ask the cards</Link>{' '}
        or browse <Link href="/cards" style={{ color: GOLD }}>all 78 card meanings</Link>.
      </p>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {ZODIAC_SIGNS.map((s) => (
          <li key={s.slug} style={{ borderTop: `1px solid ${HAIRLINE}`, padding: '18px 0' }}>
            <Link href={`/zodiac/${s.slug}`} style={{ textDecoration: 'none' }}>
              <span style={{ display: 'block', fontFamily: SERIF, fontSize: '24px', color: CREAM, marginBottom: '4px' }}>{`Tarot for ${s.name}`}</span>
              <span style={{ display: 'block', fontFamily: UI, fontSize: '14px', color: FAINT, marginBottom: '6px' }}>
                {s.dates} · {s.element}
              </span>
              <span style={{ display: 'block', fontFamily: BODY, fontSize: '17px', color: MUTED, lineHeight: 1.5 }}>
                {getCardBySlug(s.majorSlug)?.name} and the {getCardBySlug(s.courtSlug)?.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <ReadingCta
        heading="Your sign is only the start."
        body="Melissa reads the cards around what is actually happening for you, every day, in plain words."
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: TITLE,
          description: DESCRIPTION,
          url: absoluteUrl('/zodiac'),
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: ZODIAC_SIGNS.length,
            itemListElement: ZODIAC_SIGNS.map((s, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: `Tarot for ${s.name}`,
              url: absoluteUrl(`/zodiac/${s.slug}`),
            })),
          },
        }}
      />
    </ContentShell>
  );
}
