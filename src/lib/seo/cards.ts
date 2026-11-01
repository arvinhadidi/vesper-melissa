import rawCards from '@/data/cards.json';
import major from '@/data/card-guides/major.json';
import wandsCups from '@/data/card-guides/wands-cups.json';
import pentaclesSwords from '@/data/card-guides/pentacles-swords.json';

// Static, crawlable card-meaning content for /cards and /cards/[slug].
// Copy lives in src/data/card-guides/*.json (one object per card, keyed by slug);
// image + arcana/suit come from the canonical deck file src/data/cards.json.

export type YesNo = 'yes' | 'no' | 'maybe';
export type Suit = 'wands' | 'cups' | 'swords' | 'pentacles';

interface CardGuideCopy {
  slug: string;
  name: string;
  metaDescription: string;
  intro: string;
  keywordsUpright: string[];
  keywordsReversed: string[];
  upright: string;
  reversed: string;
  love: string;
  career: string;
  yesNo: string;
  yesNoText: string;
  melissaLine: string;
}

interface DeckCard {
  id: number;
  name_short: string;
  name: string;
  arcana: string;
  suit: string | null;
}

export interface CardGuide extends Omit<CardGuideCopy, 'yesNo'> {
  id: number;
  image: string;
  arcana: 'major' | 'minor';
  suit: Suit | null;
  yesNo: YesNo;
}

// cards.json uses older Waite titles for three cards; pages use the names people search for.
const NAME_OVERRIDES: Record<string, string> = {
  Fortitude: 'Strength',
  'Wheel Of Fortune': 'Wheel of Fortune',
  'The Last Judgment': 'Judgement',
};

export function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const copyBySlug = new Map<string, CardGuideCopy>(
  ([...major, ...wandsCups, ...pentaclesSwords] as CardGuideCopy[]).map((c) => [c.slug, c]),
);

function toYesNo(v: string): YesNo {
  return v === 'yes' || v === 'no' ? v : 'maybe';
}

export const CARD_GUIDES: CardGuide[] = (rawCards as DeckCard[]).map((card) => {
  const name = NAME_OVERRIDES[card.name] ?? card.name;
  const slug = slugify(name);
  const copy = copyBySlug.get(slug);
  if (!copy) throw new Error(`Missing card guide copy for ${slug}`);
  return {
    ...copy,
    id: card.id,
    name,
    image: `/cards-cropped/${card.name_short}.png`,
    arcana: card.arcana === 'major' ? 'major' : 'minor',
    suit: (card.suit as Suit | null) ?? null,
    yesNo: toYesNo(copy.yesNo),
  };
});

export function getCardBySlug(slug: string): CardGuide | undefined {
  return CARD_GUIDES.find((c) => c.slug === slug);
}

export const SUIT_INFO: Record<Suit, { label: string; element: string; theme: string }> = {
  wands: { label: 'Wands', element: 'Fire', theme: 'drive, ambition, desire and creative spark' },
  cups: { label: 'Cups', element: 'Water', theme: 'feelings, relationships, intuition and love' },
  swords: { label: 'Swords', element: 'Air', theme: 'thoughts, conflict, truth and hard decisions' },
  pentacles: { label: 'Pentacles', element: 'Earth', theme: 'money, work, home and the body' },
};

export const CARD_GROUPS: { key: 'major' | Suit; title: string; blurb: string }[] = [
  { key: 'major', title: 'Major Arcana', blurb: 'The 22 big-picture cards: turning points, lessons and the moments you remember.' },
  { key: 'cups', title: 'Cups', blurb: `The suit of Water: ${SUIT_INFO.cups.theme}.` },
  { key: 'wands', title: 'Wands', blurb: `The suit of Fire: ${SUIT_INFO.wands.theme}.` },
  { key: 'swords', title: 'Swords', blurb: `The suit of Air: ${SUIT_INFO.swords.theme}.` },
  { key: 'pentacles', title: 'Pentacles', blurb: `The suit of Earth: ${SUIT_INFO.pentacles.theme}.` },
];

export function cardsInGroup(key: 'major' | Suit): CardGuide[] {
  return CARD_GUIDES.filter((c) => (key === 'major' ? c.arcana === 'major' : c.suit === key));
}

// Six high-search-volume cards linked from the home page footer.
export const FEATURED_CARD_SLUGS = ['the-lovers', 'the-tower', 'death', 'the-moon', 'three-of-swords', 'two-of-cups'];
