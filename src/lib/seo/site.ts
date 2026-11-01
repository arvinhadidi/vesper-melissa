// Public-site constants for SEO (canonical URLs, sitemap, JSON-LD).
export const SITE_URL = 'https://vesper.cards';
export const SITE_NAME = 'Vesper';
export const SITE_TAGLINE = 'What the cards have been trying to tell you';
export const SITE_DESCRIPTION =
  'Meet Melissa, your personal oracle. Daily tarot readings, question-led spreads, and a private journal. 14-day free trial.';

// Where every content-page CTA sends people: the start of the onboarding funnel.
export const READING_CTA_HREF = '/onboarding';

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

// The app-root opengraph-image.tsx. Pages that declare their own `openGraph` object replace the
// inherited one wholesale (file-based image included), so they must re-attach this explicitly.
export const DEFAULT_OG_IMAGE = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: 'Vesper: tarot readings with Melissa, your personal oracle',
};
