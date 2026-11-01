import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ContentShell from '@/components/seo/ContentShell';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import CardTiles from '@/components/seo/CardTiles';
import FaqArticleJsonLd from '@/components/seo/FaqArticleJsonLd';
import Prose from '@/components/seo/Prose';
import ReadingCta from '@/components/seo/ReadingCta';
import { extractFaqs } from '@/lib/seo/guides';
import { QUESTION_PAGES, getQuestionPage, readQuestionMarkdown } from '@/lib/seo/questions';
import { DEFAULT_OG_IMAGE, SITE_NAME } from '@/lib/seo/site';
import { SERIF, UI, CREAM, GOLD, HAIRLINE } from '@/components/seo/tokens';

export const dynamicParams = false;

export function generateStaticParams() {
  return QUESTION_PAGES.map((q) => ({ slug: q.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const q = getQuestionPage(slug);
  if (!q) return {};
  const url = `/questions/${q.slug}`;
  return {
    title: { absolute: `${q.title} | ${SITE_NAME}` },
    description: q.description,
    alternates: { canonical: url },
    openGraph: { type: 'article', url, title: q.title, description: q.description, images: [DEFAULT_OG_IMAGE] },
    twitter: { card: 'summary_large_image', title: q.title, description: q.description, images: [DEFAULT_OG_IMAGE.url] },
  };
}

export default async function QuestionPage({ params }: Props) {
  const { slug } = await params;
  const q = getQuestionPage(slug);
  if (!q) notFound();
  const markdown = readQuestionMarkdown(q.slug);
  const faqs = extractFaqs(markdown);
  const others = QUESTION_PAGES.filter((o) => o.slug !== q.slug);

  return (
    <ContentShell>
      <Breadcrumbs
        items={[
          { name: 'Home', href: '/' },
          { name: 'Tarot questions', href: '/questions' },
          { name: q.question, href: `/questions/${q.slug}` },
        ]}
      />
      <article>
        <p style={{ fontFamily: UI, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', color: GOLD, margin: '0 0 10px' }}>
          Asking the cards
        </p>
        <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(34px, 6vw, 46px)', fontWeight: 400, color: CREAM, margin: '0 0 24px', lineHeight: 1.15 }}>
          {q.question}
        </h1>
        <section aria-label="Cards for this question" style={{ margin: '0 0 28px' }}>
          <CardTiles label={q.labels?.yes ?? 'Cards that lean yes'} slugs={q.yes} size={88} />
          <CardTiles label={q.labels?.no ?? 'Cards that lean no'} slugs={q.no} size={88} />
          <CardTiles label={q.labels?.wait ?? 'Cards that say wait'} slugs={q.wait} size={88} />
        </section>
        <Prose markdown={markdown} />
      </article>

      <ReadingCta
        heading="Ask Melissa this question for real."
        body="Tell her what is actually going on. She pulls the cards for your situation, reads them in plain words, and you can ask follow-ups."
      />

      <nav aria-label="More tarot questions" style={{ borderTop: `1px solid ${HAIRLINE}`, paddingTop: '24px' }}>
        <p style={{ fontFamily: UI, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', color: GOLD, margin: '0 0 12px' }}>
          More questions people ask the cards
        </p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {others.map((o) => (
            <li key={o.slug} style={{ margin: '0 0 10px' }}>
              <Link href={`/questions/${o.slug}`} style={{ fontFamily: SERIF, fontSize: '20px', color: CREAM, textDecoration: 'none' }}>
                {o.question}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <FaqArticleJsonLd headline={q.title} description={q.description} path={`/questions/${q.slug}`} faqs={faqs} />
    </ContentShell>
  );
}
