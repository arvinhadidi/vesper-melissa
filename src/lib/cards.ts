import cardsData from '@/data/cards.json';

export type TarotCard = {
  id: number;
  name_short: string;
  name: string;
  arcana: 'major' | 'minor';
  suit: string | null;
  value_int: number;
  keywords: string[];
  meaning_up: string;
  meaning_rev: string;
  desc: string;
};

export const cards: TarotCard[] = cardsData as TarotCard[];

export function getCardById(id: number): TarotCard {
  const card = cards.find(c => c.id === id);
  if (!card) throw new Error(`Card with id ${id} not found`);
  return card;
}

export function getCardByNameShort(nameShort: string): TarotCard {
  const card = cards.find(c => c.name_short === nameShort);
  if (!card) throw new Error(`Card ${nameShort} not found`);
  return card;
}

export function getCardImagePath(nameShort: string): string {
  return `/cards/${nameShort}.png`;
}
