import { describe, it, expect } from 'vitest';
import { getCardById, getCardByNameShort, getCardImagePath, cards } from '@/lib/cards';

describe('cards utility', () => {
  it('should load all 78 cards', () => {
    expect(cards.length).toBe(78);
  });

  it('should get card by id', () => {
    const card = getCardById(1);
    expect(card).toBeDefined();
    expect(card.id).toBe(1);
  });

  it('should throw on invalid id', () => {
    expect(() => getCardById(999)).toThrow();
  });

  it('should get card by name_short', () => {
    const card = getCardByNameShort('ar00');
    expect(card).toBeDefined();
    expect(card.name_short).toBe('ar00');
  });

  it('should throw on invalid name_short', () => {
    expect(() => getCardByNameShort('invalid')).toThrow();
  });

  it('should return correct image path', () => {
    const path = getCardImagePath('ar00');
    expect(path).toBe('/cards-cropped/ar00.png');
  });

  it('all major arcana should have arcana=major', () => {
    const majors = cards.filter(c => c.arcana === 'major');
    expect(majors.length).toBe(22);
  });

  it('all minor arcana should have arcana=minor', () => {
    const minors = cards.filter(c => c.arcana === 'minor');
    expect(minors.length).toBe(56);
  });

  it('should have keywords for all cards', () => {
    cards.forEach(card => {
      expect(card.keywords).toBeDefined();
      expect(Array.isArray(card.keywords)).toBe(true);
      expect(card.keywords.length).toBeGreaterThan(0);
    });
  });

  it('should have meanings for all cards', () => {
    cards.forEach(card => {
      expect(card.meaning_up).toBeDefined();
      expect(card.meaning_rev).toBeDefined();
      expect(card.meaning_up.length).toBeGreaterThan(0);
      expect(card.meaning_rev.length).toBeGreaterThan(0);
    });
  });

  it('minor arcana should have suit', () => {
    const minors = cards.filter(c => c.arcana === 'minor');
    minors.forEach(card => {
      expect(card.suit).toBeDefined();
      expect(['wands', 'cups', 'swords', 'pentacles']).toContain(card.suit);
    });
  });

  it('major arcana should not have suit', () => {
    const majors = cards.filter(c => c.arcana === 'major');
    majors.forEach(card => {
      expect(card.suit).toBeNull();
    });
  });
});
