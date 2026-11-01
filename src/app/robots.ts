import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo/site';

// Public, indexable surface = landing, /cards, /guides, legal pages.
// Everything behind auth, the paywall funnel and internal test routes stays out of the index.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/auth/',
          '/onboarding/',
          '/paywall',
          '/personalisation',
          '/daily',
          '/spread',
          '/journal',
          '/chat',
          '/main',
          '/account',
          '/test',
          '/main-preview',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
