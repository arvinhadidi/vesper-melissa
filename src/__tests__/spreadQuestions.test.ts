import { describe, it, expect } from 'vitest';
import { SPREAD_QUESTIONS } from '@/data/spreadQuestions';

describe('spreadQuestions', () => {
  it('exports an array of 8 questions', () => {
    expect(SPREAD_QUESTIONS).toHaveLength(8);
  });

  it('every question has an id, text, and promptContext', () => {
    for (const q of SPREAD_QUESTIONS) {
      expect(q.id).toBeTruthy();
      expect(q.text).toBeTruthy();
      expect(typeof q.promptContext).toBe('string');
    }
  });

  it('every question has a cardCount of 2 or 3', () => {
    for (const q of SPREAD_QUESTIONS) {
      expect([2, 3]).toContain(q.cardCount);
    }
  });

  it('positionLabels length matches cardCount for every question', () => {
    for (const q of SPREAD_QUESTIONS) {
      expect(q.positionLabels).toHaveLength(q.cardCount);
    }
  });

  it('all ids are unique', () => {
    const ids = SPREAD_QUESTIONS.map(q => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('includes the custom question option', () => {
    const custom = SPREAD_QUESTIONS.find(q => q.id === 'custom');
    expect(custom).toBeTruthy();
  });
});
