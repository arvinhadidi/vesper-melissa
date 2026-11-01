import JsonLd from './JsonLd';
import type { Faq } from '@/lib/seo/guides';
import { SITE_NAME, absoluteUrl } from '@/lib/seo/site';

// Article + FAQPage JSON-LD, same shape as the guide pages, shared by /zodiac and /questions.
export default function FaqArticleJsonLd({ headline, description, path, faqs }: { headline: string; description: string; path: string; faqs: Faq[] }) {
  return (
    <JsonLd
      data={[
        {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline,
          description,
          url: absoluteUrl(path),
          mainEntityOfPage: absoluteUrl(path),
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
  );
}
