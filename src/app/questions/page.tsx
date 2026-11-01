import type { Metadata } from 'next';
import Link from 'next/link';
import ContentShell from '@/components/seo/ContentShell';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import JsonLd from '@/components/seo/JsonLd';
import ReadingCta from '@/components/seo/ReadingCta';
import { QUESTION_PAGES } from '@/lib/seo/questions';
import { DEFAULT_OG_IMAGE, absoluteUrl } from '@/lib/seo/site';
import { SERIF, BODY, UI, CREAM, GOLD, MUTED, HAIRLINE } from '@/components/seo/tokens';

const TITLE = 'Tarot Questions: Spreads and Cards for the Questions You Actually Ask';
const DESCRIPTION =
  'Will my ex come back? Will I get the job? Should I move? How to ask tarot the big questions, a three-card spread for each, and the cards that mean yes, no or wait.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/questions' },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: [DEFAULT_OG_IMAGE.url] },
  openGraph: { images: [DEFAULT_OG_IMAGE], url: '/questions', title: TITLE, description: DESCRIPTION },
};

export default function QuestionsIndexPage() {
  return (
    <ContentShell>
      <Breadcrumbs items={[{ name: 'Home', href: '/' }, { name: 'Tarot questions', href: '/questions' }]} />
      <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(34px, 6vw, 46px)', fontWeight: 400, color: CREAM, margin: '0 0 16px', lineHeight: 1.15 }}>
        Questions people ask the cards
      </h1>
      <p style={{ fontFamily: BODY, fontSize: '20px', color: MUTED, lineHeight: 1.6, margin: '0 0 12px' }}>
        The questions that keep you up at night are usually the ones tarot is asked most. Each page below covers how to phrase
        the question so the answer is useful, a three-card spread built for it, and which cards tend to mean yes, no or wait.
      </p>
      <p style={{ fontFamily: UI, fontSize: '14px', color: MUTED, margin: '0 0 28px' }}>
        New to this? Start with <Link href="/guides/yes-or-no-tarot" style={{ color: GOLD }}>yes or no tarot</Link>, or find{' '}
        <Link href="/zodiac" style={{ color: GOLD }}>your tarot card by zodiac sign</Link>.
      </p>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {QUESTION_PAGES.map((q) => (
          <li key={q.slug} style={{ borderTop: `1px solid ${HAIRLINE}`, padding: '20px 0' }}>
            <Link href={`/questions/${q.slug}`} style={{ textDecoration: 'none' }}>
              <span style={{ display: 'block', fontFamily: SERIF, fontSize: '24px', color: CREAM, marginBottom: '6px' }}>{q.question}</span>
              <span style={{ display: 'block', fontFamily: BODY, fontSize: '17px', color: MUTED, lineHeight: 1.5 }}>{q.description}</span>
            </Link>
          </li>
        ))}
      </ul>
      <ReadingCta
        heading="Ask your own question."
        body="Whatever is on your mind, Melissa pulls the cards for it and reads them in plain words, then stays to talk it through."
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: TITLE,
          description: DESCRIPTION,
          url: absoluteUrl('/questions'),
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: QUESTION_PAGES.length,
            itemListElement: QUESTION_PAGES.map((q, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: q.question,
              url: absoluteUrl(`/questions/${q.slug}`),
            })),
          },
        }}
      />
    </ContentShell>
  );
}
