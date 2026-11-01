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
import { ZODIAC_SIGNS, getZodiacSign, readZodiacMarkdown, zodiacTitle } from '@/lib/seo/zodiac';
import { DEFAULT_OG_IMAGE, SITE_NAME } from '@/lib/seo/site';
import { SERIF, UI, CREAM, GOLD, FAINT, HAIRLINE } from '@/components/seo/tokens';

export const dynamicParams = false;

export function generateStaticParams() {
  return ZODIAC_SIGNS.map((s) => ({ sign: s.slug }));
}

type Props = { params: Promise<{ sign: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sign: slug } = await params;
  const sign = getZodiacSign(slug);
  if (!sign) return {};
  const title = zodiacTitle(sign);
  const url = `/zodiac/${sign.slug}`;
  return {
    title: { absolute: `${title} | ${SITE_NAME}` },
    description: sign.description,
    alternates: { canonical: url },
    openGraph: { type: 'article', url, title, description: sign.description, images: [DEFAULT_OG_IMAGE] },
    twitter: { card: 'summary_large_image', title, description: sign.description, images: [DEFAULT_OG_IMAGE.url] },
  };
}

export default async function ZodiacSignPage({ params }: Props) {
  const { sign: slug } = await params;
  const sign = getZodiacSign(slug);
  if (!sign) notFound();
  const markdown = readZodiacMarkdown(sign.slug);
  const faqs = extractFaqs(markdown);
  const others = ZODIAC_SIGNS.filter((s) => s.slug !== sign.slug);

  return (
    <ContentShell>
      <Breadcrumbs
        items={[
          { name: 'Home', href: '/' },
          { name: 'Tarot by zodiac sign', href: '/zodiac' },
          { name: `Tarot for ${sign.name}`, href: `/zodiac/${sign.slug}` },
        ]}
      />
      <article>
        <p style={{ fontFamily: UI, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', color: GOLD, margin: '0 0 10px' }}>
          {sign.dates} · {sign.element} · {sign.modality}
        </p>
        <h1 style={{ fontFamily: SERIF, fontSize: 'clamp(34px, 6vw, 46px)', fontWeight: 400, color: CREAM, margin: '0 0 24px', lineHeight: 1.15 }}>
          {`Tarot for ${sign.name}`}
        </h1>
        <CardTiles label={`${sign.name}'s cards`} slugs={[sign.majorSlug, sign.courtSlug]} size={120} />
        <Prose markdown={markdown} />
      </article>

      <ReadingCta
        heading={`A reading for you, not just for ${sign.name}.`}
        body="Your sign is a starting point. Melissa reads the cards around your actual question, then stays to talk it through."
      />

      <nav aria-label="Other zodiac signs" style={{ borderTop: `1px solid ${HAIRLINE}`, paddingTop: '24px' }}>
        <p style={{ fontFamily: UI, fontSize: '13px', letterSpacing: '0.08em', textTransform: 'uppercase', color: GOLD, margin: '0 0 12px' }}>
          Tarot for other signs
        </p>
        <p style={{ fontFamily: UI, fontSize: '15px', color: FAINT, lineHeight: 2, margin: 0 }}>
          {others.map((s, i) => (
            <span key={s.slug}>
              {i > 0 && ' · '}
              <Link href={`/zodiac/${s.slug}`} style={{ color: CREAM, textDecoration: 'none' }}>{s.name}</Link>
            </span>
          ))}
        </p>
      </nav>

      <FaqArticleJsonLd headline={zodiacTitle(sign)} description={sign.description} path={`/zodiac/${sign.slug}`} faqs={faqs} />
    </ContentShell>
  );
}
