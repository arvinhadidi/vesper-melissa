import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import ContentShell from '@/components/seo/ContentShell';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import JsonLd from '@/components/seo/JsonLd';
import ReadingCta from '@/components/seo/ReadingCta';
import { CARD_GROUPS, CARD_GUIDES, cardsInGroup } from '@/lib/seo/cards';
import { DEFAULT_OG_IMAGE, absoluteUrl } from '@/lib/seo/site';
import { SERIF, BODY, UI, CREAM, GOLD, MUTED, HAIRLINE } from '@/components/seo/tokens';

const TITLE = 'Tarot Card Meanings: All 78 Cards, Upright and Reversed';
const DESCRIPTION =
  'Every tarot card meaning in one place: all 22 Major Arcana and 56 Minor Arcana cards, upright and reversed, in love, career and yes or no readings.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/cards' },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [DEFAULT_OG_IMAGE.url] },
  openGraph: { images: [DEFAULT_OG_IMAGE], url: '/cards', title: TITLE, description: DESCRIPTION },
};

export default function CardsIndexPage() {
  return (
    <ContentShell wide>
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Tarot card meanings', href: '/cards' }]} />
      <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(34px, 6vw, 48px)', fontWeight: 400, color: CREAM, margin: '0 0 16px', lineHeight: 1.15 }}>
        Tarot card meanings
      </h1>
      <p style={{ fontFamily: BODY, fontSize: '20px', color: MUTED, lineHeight: 1.6, maxWidth: '720px', margin: '0 0 12px' }}>
        All 78 cards of the Rider-Waite tarot, explained in plain English: what each card means upright and reversed, what it
        says about love and work, and whether it leans yes or no. Start with the Major Arcana for the big themes, or jump to
        the suit you keep pulling.
      </p>
      <p style={{ fontFamily: UI, fontSize: '14px', color: MUTED, margin: '0 0 8px' }}>
        New to tarot? Read <Link href="/guides/how-to-read-tarot-for-beginners" style={{ color: GOLD }}>how to read tarot for beginners</Link>{' '}
        or try a <Link href="/guides/three-card-spread" style={{ color: GOLD }}>three card spread</Link>.
      </p>

      {CARD_GROUPS.map((group) => (
        <section key={group.key} aria-labelledby={`g-${group.key}`} style={{ marginTop: '48px' }}>
          <h2 id={`g-${group.key}`} style={{ fontFamily: SERIF, fontSize: '30px', fontWeight: 400, color: CREAM, margin: '0 0 6px' }}>
            {group.title}
          </h2>
          <p style={{ fontFamily: BODY, fontSize: '18px', color: MUTED, margin: '0 0 20px' }}>{group.blurb}</p>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(118px, 1fr))',
              gap: '18px',
            }}
          >
            {cardsInGroup(group.key).map((c) => (
              <li key={c.slug}>
                <Link href={`/cards/${c.slug}`} style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}>
                  <Image
                    src={c.image}
                    alt={`${c.name} tarot card`}
                    width={118}
                    height={221}
                    sizes="118px"
                    style={{ width: '100%', height: 'auto', borderRadius: '8px', border: `1px solid ${HAIRLINE}` }}
                  />
                  <span style={{ display: 'block', fontFamily: UI, fontSize: '14px', color: CREAM, marginTop: '8px' }}>{c.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <div style={{ maxWidth: '760px' }}>
        <ReadingCta
          heading="Rather not look every card up?"
          body="Ask Melissa your question and she will pull and read the cards for your situation, in plain words, every day."
        />
      </div>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: TITLE,
          description: DESCRIPTION,
          url: absoluteUrl('/cards'),
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: CARD_GUIDES.length,
            itemListElement: CARD_GUIDES.map((c, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: c.name,
              url: absoluteUrl(`/cards/${c.slug}`),
            })),
          },
        }}
      />
    </ContentShell>
  );
}
