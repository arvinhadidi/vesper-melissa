import fs from 'node:fs';
import path from 'node:path';

// Long-form intent pages under /guides/[slug]. Body copy lives in src/content/guides/{slug}.md
// and is read at build time only (every guide route is statically generated, dynamicParams=false).

export interface GuideMeta {
  slug: string;
  title: string;
  h1: string;
  description: string;
}

export const GUIDES: GuideMeta[] = [
  {
    slug: 'daily-tarot-reading',
    title: 'Daily Tarot Reading: How to Pull and Read Your Card of the Day',
    h1: 'Daily tarot reading: your card of the day',
    description: 'How to do a one-card daily tarot reading in two minutes: the question to ask, how to read the card, and how to journal it so it actually helps.',
  },
  {
    slug: 'yes-or-no-tarot',
    title: 'Yes or No Tarot: How It Works and Which Cards Mean Yes',
    h1: 'Yes or no tarot: how to get a straight answer',
    description: 'How yes or no tarot works, how to phrase the question, the one-card and three-card methods, and which tarot cards lean yes, no or maybe.',
  },
  {
    slug: 'love-tarot-reading',
    title: 'Love Tarot Reading: Questions, Spreads and the Key Love Cards',
    h1: 'Love tarot reading: what to ask and how to read it',
    description: 'A practical love tarot reading guide: questions that work, a five-card love spread, the key love cards, and reading for an ex or situationship.',
  },
  {
    slug: 'three-card-spread',
    title: 'Three Card Tarot Spread: Positions, Variations and an Example',
    h1: 'The three card tarot spread',
    description: 'The three card tarot spread explained: past, present, future plus five other position sets, and a worked example reading with real cards.',
  },
  {
    slug: 'celtic-cross',
    title: 'Celtic Cross Tarot Spread: All 10 Positions Explained',
    h1: 'The Celtic Cross tarot spread',
    description: 'All 10 positions of the Celtic Cross tarot spread, the order to lay them, how to read the spread as one story, and the common mistakes to avoid.',
  },
  {
    slug: 'how-to-read-tarot-for-beginners',
    title: 'How to Read Tarot for Beginners: A Plain-English Guide',
    h1: 'How to read tarot for beginners',
    description: 'How to read tarot as a beginner: the deck structure, the four suits, reversals, your first spreads, and a seven-day practice plan.',
  },
];

export function getGuide(slug: string): GuideMeta | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

export function readGuideMarkdown(slug: string): string {
  return fs.readFileSync(path.join(process.cwd(), 'src/content/guides', `${slug}.md`), 'utf8');
}

export interface Faq {
  question: string;
  answer: string;
}

// Pulls the "## Frequently asked questions" section (### question + paragraph answer) for FAQPage JSON-LD.
export function extractFaqs(markdown: string): Faq[] {
  const idx = markdown.search(/^## Frequently asked questions/im);
  if (idx === -1) return [];
  const section = markdown.slice(idx).split(/^### /m).slice(1);
  return section
    .map((block) => {
      const [q, ...rest] = block.split('\n');
      const answer = rest
        .join(' ')
        .split(/^## /m)[0]
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/[*_`]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      return { question: q.trim(), answer };
    })
    .filter((f) => f.question && f.answer);
}
