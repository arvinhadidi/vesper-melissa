import fs from 'node:fs';
import path from 'node:path';

// "Tarot for {Sign}" pages under /zodiac/[sign]. Body copy lives in src/content/zodiac/{slug}.md
// (same Markdown + "## Frequently asked questions" format as the guides) and is read at build time only.
// Card correspondences: Golden Dawn Major Arcana attribution, plus the common modern court-card mapping
// (cardinal signs = Queens, fixed signs = Kings, mutable signs = Knights).

export type Element = 'Fire' | 'Earth' | 'Air' | 'Water';

export interface ZodiacSign {
  slug: string;
  name: string;
  dates: string;
  element: Element;
  modality: 'Cardinal' | 'Fixed' | 'Mutable';
  majorSlug: string;
  courtSlug: string;
  description: string;
}

export const ZODIAC_SIGNS: ZodiacSign[] = [
  { slug: 'aries', name: 'Aries', dates: '21 March to 19 April', element: 'Fire', modality: 'Cardinal', majorSlug: 'the-emperor', courtSlug: 'queen-of-wands', description: 'Tarot for Aries: The Emperor and the Queen of Wands, what an Aries reading tends to bring up in love, work and this month, and three spreads to try.' },
  { slug: 'taurus', name: 'Taurus', dates: '20 April to 20 May', element: 'Earth', modality: 'Fixed', majorSlug: 'the-hierophant', courtSlug: 'king-of-pentacles', description: 'Tarot for Taurus: The Hierophant and the King of Pentacles, what a Taurus reading tends to bring up in love, work and this month, and three spreads to try.' },
  { slug: 'gemini', name: 'Gemini', dates: '21 May to 20 June', element: 'Air', modality: 'Mutable', majorSlug: 'the-lovers', courtSlug: 'knight-of-swords', description: 'Tarot for Gemini: The Lovers and the Knight of Swords, what a Gemini reading tends to bring up in love, work and this month, and three spreads to try.' },
  { slug: 'cancer', name: 'Cancer', dates: '21 June to 22 July', element: 'Water', modality: 'Cardinal', majorSlug: 'the-chariot', courtSlug: 'queen-of-cups', description: 'Tarot for Cancer: The Chariot and the Queen of Cups, what a Cancer reading tends to bring up in love, work and this month, and three spreads to try.' },
  { slug: 'leo', name: 'Leo', dates: '23 July to 22 August', element: 'Fire', modality: 'Fixed', majorSlug: 'strength', courtSlug: 'king-of-wands', description: 'Tarot for Leo: Strength and the King of Wands, what a Leo reading tends to bring up in love, work and this month, and three spreads to try.' },
  { slug: 'virgo', name: 'Virgo', dates: '23 August to 22 September', element: 'Earth', modality: 'Mutable', majorSlug: 'the-hermit', courtSlug: 'knight-of-pentacles', description: 'Tarot for Virgo: The Hermit and the Knight of Pentacles, what a Virgo reading tends to bring up in love, work and this month, and three spreads to try.' },
  { slug: 'libra', name: 'Libra', dates: '23 September to 22 October', element: 'Air', modality: 'Cardinal', majorSlug: 'justice', courtSlug: 'queen-of-swords', description: 'Tarot for Libra: Justice and the Queen of Swords, what a Libra reading tends to bring up in love, work and this month, and three spreads to try.' },
  { slug: 'scorpio', name: 'Scorpio', dates: '23 October to 21 November', element: 'Water', modality: 'Fixed', majorSlug: 'death', courtSlug: 'king-of-cups', description: 'Tarot for Scorpio: Death and the King of Cups, what a Scorpio reading tends to bring up in love, work and this month, and three spreads to try.' },
  { slug: 'sagittarius', name: 'Sagittarius', dates: '22 November to 21 December', element: 'Fire', modality: 'Mutable', majorSlug: 'temperance', courtSlug: 'knight-of-wands', description: 'Tarot for Sagittarius: Temperance and the Knight of Wands, what a Sagittarius reading tends to bring up in love, work and this month, and three spreads to try.' },
  { slug: 'capricorn', name: 'Capricorn', dates: '22 December to 19 January', element: 'Earth', modality: 'Cardinal', majorSlug: 'the-devil', courtSlug: 'queen-of-pentacles', description: 'Tarot for Capricorn: The Devil and the Queen of Pentacles, what a Capricorn reading tends to bring up in love, work and this month, and three spreads to try.' },
  { slug: 'aquarius', name: 'Aquarius', dates: '20 January to 18 February', element: 'Air', modality: 'Fixed', majorSlug: 'the-star', courtSlug: 'king-of-swords', description: 'Tarot for Aquarius: The Star and the King of Swords, what an Aquarius reading tends to bring up in love, work and this month, and three spreads to try.' },
  { slug: 'pisces', name: 'Pisces', dates: '19 February to 20 March', element: 'Water', modality: 'Mutable', majorSlug: 'the-moon', courtSlug: 'knight-of-cups', description: 'Tarot for Pisces: The Moon and the Knight of Cups, what a Pisces reading tends to bring up in love, work and this month, and three spreads to try.' },
];

export function getZodiacSign(slug: string): ZodiacSign | undefined {
  return ZODIAC_SIGNS.find((s) => s.slug === slug);
}

export function zodiacTitle(sign: ZodiacSign): string {
  return `Tarot for ${sign.name}: Your Cards, Love, Career and Spreads`;
}

export function readZodiacMarkdown(slug: string): string {
  return fs.readFileSync(path.join(process.cwd(), 'src/content/zodiac', `${slug}.md`), 'utf8');
}
