import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ContentShell from '@/components/seo/ContentShell';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import JsonLd from '@/components/seo/JsonLd';
import Prose from '@/components/seo/Prose';
import ReadingCta from '@/components/seo/ReadingCta';
import { GUIDES, extractFaqs, getGuide, readGuideMarkdown } from '@/lib/seo/guides';
import { DEFAULT_OG_IMAGE, SITE_NAME, absoluteUrl } from '@/lib/seo/site';
import { SERIF, UI, CREAM, GOLD, HAIRLINE } from '@/components/seo/tokens';

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return {};
  const url = `/guides/${guide.slug}`;
  return {
    title: { absolute: `${guide.title} | ${SITE_NAME}` },
    description: guide.description,
    alternates: { canonical: url },
    openGraph: { type: 'article', url, title: guide.title, description: guide.description, images: [DEFAULT_OG_IMAGE] },
    twitter: { card: 'summary_large_image', title: guide.title, description: guide.description, images: [DEFAULT_OG_IMAGE.url] },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();
  const markdown = readGuideMarkdown(guide.slug);
  const faqs = extractFaqs(markdown);
  const others = GUIDES.filter((g) => g.slug !== guide.slug);

  return (
    <ContentShell>
      <Breadcrumbs
        items={[
          { name: 'Home', href: '/' },
          { name: 'Tarot guides', href: '/guides' },
          { name: guide.h1.split(':')[0], href: `/guides/${guide.slug}` },
        ]}
      />
      <article>
        <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(34px, 6vw, 46px)', fontWeight: 400, color: CREAM, margin: '0 0 24px', lineHeight: 1.15 }}>
          {guide.h1}
        </h1>
        <Prose markdown={markdown} />
      </article>

      <ReadingCta
        heading="Want the cards read for your actual question?"
        body="Melissa pulls a daily card for you and reads full spreads around whatever is on your mind, then stays to talk it through."
      />

      <nav aria-label="More guides" style={{ borderTop: `1px solid ${HAIRLINE}`, paddingTop: '24px' }}>
        <p style={{ fontFamily: UI, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', color: GOLD, margin: '0 0 12px' }}>
          More tarot guides
        </p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {others.map((g) => (
            <li key={g.slug} style={{ margin: '0 0 10px' }}>
              <Link href={`/guides/${g.slug}`} style={{ fontFamily: SERIF, fontSize: '20px', color: CREAM, textDecoration: 'none' }}>
                {g.h1}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/cards" style={{ fontFamily: SERIF, fontSize: '20px', color: CREAM, textDecoration: 'none' }}>
              All 78 tarot card meanings
            </Link>
          </li>
        </ul>
      </nav>

      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: guide.title,
            description: guide.description,
            url: absoluteUrl(`/guides/${guide.slug}`),
            mainEntityOfPage: absoluteUrl(`/guides/${guide.slug}`),
            author: { '@type': 'Organization', name: SITE_NAME, url: absoluteUrl('/') },
            publisher: { '@type': 'Organization', name: SITE_NAME, url: absoluteUrl('/'), logo: absoluteUrl('/melissa/melissa-default.png') },
          },
          ...(faqs.length
            ? [
                {
                  '@context': 'https://schema.org',
                  '@type': 'FAQPage',
                  mainEntity: faqs.map((f) => ({
                    '@type': 'Question',
                    name: f.question,
                    acceptedAnswer: { '@type': 'Answer', text: f.answer },
                  })),
                },
              ]
            : []),
        ]}
      />
    </ContentShell>
  );
}
