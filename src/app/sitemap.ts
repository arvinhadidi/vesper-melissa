import type { MetadataRoute } from 'next';
import { CARD_GUIDES } from '@/lib/seo/cards';
import { GUIDES } from '@/lib/seo/guides';
import { absoluteUrl } from '@/lib/seo/site';

// Built from the same data that drives generateStaticParams, so every card/guide page is listed.
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: absoluteUrl('/'), lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: absoluteUrl('/cards'), lastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: absoluteUrl('/guides'), lastModified, changeFrequency: 'monthly', priority: 0.8 },
    ...GUIDES.map((g) => ({
      url: absoluteUrl(`/guides/${g.slug}`),
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...CARD_GUIDES.map((c) => ({
      url: absoluteUrl(`/cards/${c.slug}`),
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    { url: absoluteUrl('/privacy'), lastModified, changeFrequency: 'yearly', priority: 0.2 },
    { url: absoluteUrl('/tos'), lastModified, changeFrequency: 'yearly', priority: 0.2 },
  ];
}
