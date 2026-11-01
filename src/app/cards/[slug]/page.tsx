import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ContentShell from '@/components/seo/ContentShell';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import JsonLd from '@/components/seo/JsonLd';
import ReadingCta from '@/components/seo/ReadingCta';
import { CARD_GUIDES, SUIT_INFO, getCardBySlug, type CardGuide } from '@/lib/seo/cards';
import { SITE_NAME, absoluteUrl } from '@/lib/seo/site';
import { SERIF, BODY, UI, CREAM, GOLD, MUTED, FAINT, HAIRLINE } from '@/components/seo/tokens';

export const dynamicParams = false;

export function generateStaticParams() {
  return CARD_GUIDES.map((c) => ({ slug: c.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const card = getCardBySlug(slug);
  if (!card) return {};
  const title = `${card.name} Tarot Card Meaning: Upright, Reversed, Love & Yes or No`;
  const url = `/cards/${card.slug}`;
  return {
    title: { absolute: `${title} | ${SITE_NAME}` },
    description: card.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      url,
      title,
      description: card.metaDescription,
      images: [{ url: card.image, width: 271, height: 508, alt: `The ${card.name} tarot card` }],
    },
    twitter: { card: 'summary', title, description: card.metaDescription, images: [card.image] },
  };
}

const h2 = { fontFamily: SERIF, fontSize: '28px', fontWeight: 400, color: CREAM, margin: '44px 0 14px', lineHeight: 1.25 } as const;
const para = { fontFamily: BODY, fontSize: '19px', color: MUTED, lineHeight: 1.7, margin: '0 0 18px' } as const;

function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text.split(/\n\n+/).map((p, i) => (
        <p key={i} style={para}>{p}</p>
      ))}
    </>
  );
}

function Chips({ label, items }: { label: string; items: string[] }) {
  return (
    <div style={{ margin: '0 0 12px' }}>
      <span style={{ fontFamily: UI, fontSize: '12px', letterSpacing: '0.08em', textTransform: 'uppercase', color: GOLD, marginRight: '10px' }}>
        {label}
      </span>
      {items.map((k) => (
        <span
          key={k}
          style={{
            display: 'inline-block',
            fontFamily: UI,
            fontSize: '13px',
            color: CREAM,
            border: `1px solid ${HAIRLINE}`,
            borderRadius: '999px',
            padding: '4px 11px',
            margin: '0 6px 6px 0',
          }}
        >
          {k}
        </span>
      ))}
    </div>
  );
}

function related(card: CardGuide): CardGuide[] {
  const group = CARD_GUIDES.filter((c) => (card.arcana === 'major' ? c.arcana === 'major' : c.suit === card.suit));
  const i = group.findIndex((c) => c.slug === card.slug);
  const picks = [group[i - 1], group[i + 1], group[i + 2], group[i - 2]].filter(Boolean) as CardGuide[];
  return picks.slice(0, 4);
}

const YES_NO_LABEL = { yes: 'Leans yes', no: 'Leans no', maybe: 'Maybe' } as const;

export default async function CardPage({ params }: Props) {
  const { slug } = await params;
  const card = getCardBySlug(slug);
  if (!card) notFound();

  const idx = CARD_GUIDES.findIndex((c) => c.slug === card.slug);
  const prev = CARD_GUIDES[(idx - 1 + CARD_GUIDES.length) % CARD_GUIDES.length];
  const next = CARD_GUIDES[(idx + 1) % CARD_GUIDES.length];
  const suit = card.suit ? SUIT_INFO[card.suit] : null;

  const facts: [string, string][] = [
    ['Arcana', card.arcana === 'major' ? `Major Arcana (${card.id})` : 'Minor Arcana'],
    ...(suit ? ([['Suit', `${suit.label} (${suit.element})`]] as [string, string][]) : []),
    ['Yes or no', YES_NO_LABEL[card.yesNo]],
  ];

  return (
    <ContentShell>
      <Breadcrumbs
        items={[
          { name: 'Home', href: '/' },
          { name: 'Tarot card meanings', href: '/cards' },
          { name: card.name, href: `/cards/${card.slug}` },
        ]}
      />
      <article>
        <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(34px, 6vw, 46px)', fontWeight: 400, color: CREAM, margin: '0 0 24px', lineHeight: 1.15 }}>
          {card.name} tarot card meaning
        </h1>

        <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <Image
            src={card.image}
            alt={`The ${card.name} tarot card from the Rider-Waite deck`}
            width={180}
            height={338}
            priority
            style={{ borderRadius: '10px', border: `1px solid ${HAIRLINE}`, flexShrink: 0, height: 'auto' }}
          />
          <div style={{ flex: '1 1 300px' }}>
            <p style={{ ...para, fontSize: '20px', color: CREAM }}>{card.intro}</p>
            <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 16px', fontFamily: UI, fontSize: '14px', margin: '0 0 18px' }}>
              {facts.map(([k, v]) => (
                <div key={k} style={{ display: 'contents' }}>
                  <dt style={{ color: FAINT }}>{k}</dt>
                  <dd style={{ color: CREAM, margin: 0 }}>{v}</dd>
                </div>
              ))}
            </dl>
            <Chips label="Upright" items={card.keywordsUpright} />
            <Chips label="Reversed" items={card.keywordsReversed} />
          </div>
        </div>

        <h2 style={h2}>{card.name} upright meaning</h2>
        <Paragraphs text={card.upright} />

        <h2 style={h2}>{card.name} reversed meaning</h2>
        <Paragraphs text={card.reversed} />

        <h2 style={h2}>{card.name} in love and relationships</h2>
        <Paragraphs text={card.love} />

        <h2 style={h2}>{card.name} for career and money</h2>
        <Paragraphs text={card.career} />

        <h2 style={h2}>Is {card.name} a yes or no card?</h2>
        <Paragraphs text={card.yesNoText} />
        <p style={{ ...para, fontSize: '17px' }}>
          For how to phrase the question and read the answer, see our{' '}
          <Link href="/guides/yes-or-no-tarot" style={{ color: GOLD }}>yes or no tarot guide</Link>.
        </p>

        <figure style={{ margin: '40px 0 0', borderLeft: `2px solid ${GOLD}`, padding: '4px 0 4px 20px' }}>
          <blockquote style={{ margin: 0, fontFamily: SERIF, fontStyle: 'italic', fontSize: '24px', color: CREAM, lineHeight: 1.4 }}>
            {card.melissaLine}
          </blockquote>
          <figcaption style={{ fontFamily: UI, fontSize: '13px', color: FAINT, marginTop: '10px' }}>Melissa, Vesper&apos;s reader</figcaption>
        </figure>

        <ReadingCta
          heading={`Pulled ${card.name}? Ask Melissa what it means for you.`}
          body="A card means one thing in a book and another thing in your life. Tell Melissa your question and she will read the cards around your actual situation, then keep talking it through with you."
        />

        <section aria-labelledby="related-heading">
          <h2 id="related-heading" style={{ ...h2, fontSize: '22px' }}>
            {card.arcana === 'major' ? 'More Major Arcana cards' : `More ${suit?.label} cards`}
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {related(card).map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/cards/${c.slug}`}
                  style={{ fontFamily: UI, fontSize: '14px', color: CREAM, textDecoration: 'none', border: `1px solid ${HAIRLINE}`, borderRadius: '999px', padding: '7px 14px', display: 'inline-block' }}
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
          <nav aria-label="Card navigation" style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', fontFamily: UI, fontSize: '14px' }}>
            <Link href={`/cards/${prev.slug}`} style={{ color: GOLD, textDecoration: 'none' }}>← {prev.name}</Link>
            <Link href="/cards" style={{ color: FAINT, textDecoration: 'none' }}>All cards</Link>
            <Link href={`/cards/${next.slug}`} style={{ color: GOLD, textDecoration: 'none' }}>{next.name} →</Link>
          </nav>
        </section>
      </article>

      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: `${card.name} tarot card meaning`,
          description: card.metaDescription,
          image: absoluteUrl(card.image),
          url: absoluteUrl(`/cards/${card.slug}`),
          mainEntityOfPage: absoluteUrl(`/cards/${card.slug}`),
          author: { '@type': 'Organization', name: SITE_NAME, url: absoluteUrl('/') },
          publisher: { '@type': 'Organization', name: SITE_NAME, url: absoluteUrl('/'), logo: absoluteUrl('/melissa/melissa-default.png') },
          about: { '@type': 'Thing', name: `${card.name} (tarot card)` },
          keywords: [...card.keywordsUpright, ...card.keywordsReversed].join(', '),
        }}
      />
    </ContentShell>
  );
}
