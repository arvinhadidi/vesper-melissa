import fs from 'node:fs';
import path from 'node:path';

// Question-intent pages under /questions/[slug] ("will my ex come back?" etc). Body copy lives in
// src/content/questions/{slug}.md (same Markdown + FAQ format as the guides), read at build time only.
// yes/no/wait hold card slugs shown as tiles; labels can be softened per question.

export interface QuestionPage {
  slug: string;
  question: string;
  title: string;
  description: string;
  yes: string[];
  no: string[];
  wait: string[];
  labels?: { yes?: string; no?: string; wait?: string };
}

export const QUESTION_PAGES: QuestionPage[] = [
  {
    slug: 'will-my-ex-come-back',
    question: 'Will my ex come back?',
    title: 'Will My Ex Come Back? Tarot Spread and the Cards That Answer',
    description: 'How to ask tarot whether your ex will come back, a three-card spread for it, and the cards that usually mean yes, no or wait.',
    yes: ['judgement', 'six-of-cups', 'two-of-cups'],
    no: ['eight-of-cups', 'death', 'five-of-cups'],
    wait: ['the-hanged-man', 'two-of-swords', 'the-moon'],
  },
  {
    slug: 'will-i-get-the-job',
    question: 'Will I get the job?',
    title: 'Will I Get the Job? Tarot Spread and Cards for Job Questions',
    description: 'How to ask tarot whether you will get the job, a three-card spread for interviews and applications, and the cards that mean yes, no or wait.',
    yes: ['six-of-wands', 'three-of-pentacles', 'eight-of-pentacles'],
    no: ['five-of-pentacles', 'ten-of-wands', 'the-tower'],
    wait: ['seven-of-pentacles', 'two-of-wands', 'justice'],
  },
  {
    slug: 'is-he-the-one',
    question: 'Is he the one?',
    title: 'Is He the One? A Tarot Spread for Big Relationship Questions',
    description: 'How to ask tarot whether he is the one, a three-card spread that keeps it honest, and the cards that usually lean yes, no or not yet.',
    yes: ['the-lovers', 'ten-of-cups', 'two-of-cups'],
    no: ['three-of-swords', 'the-devil', 'seven-of-swords'],
    wait: ['the-moon', 'the-high-priestess', 'seven-of-cups'],
    labels: { wait: 'Not clear yet' },
  },
  {
    slug: 'should-i-move',
    question: 'Should I move?',
    title: 'Should I Move? A Tarot Spread for Moving House, City or Country',
    description: 'How to ask tarot whether you should move, a three-card spread for relocation decisions, and the cards that lean go, stay or wait.',
    yes: ['six-of-swords', 'the-fool', 'eight-of-wands'],
    no: ['four-of-pentacles', 'four-of-swords', 'five-of-pentacles'],
    wait: ['two-of-wands', 'two-of-pentacles', 'the-hermit'],
    labels: { yes: 'Lean go', no: 'Lean stay', wait: 'Lean wait' },
  },
  {
    slug: 'am-i-going-to-be-ok',
    question: 'Am I going to be okay?',
    title: 'Am I Going to Be Okay? A Gentle Tarot Spread for Hard Times',
    description: 'A gentle tarot spread for when you are asking whether you will be okay: how to ask it, the cards that bring hope, and the ones that ask for support.',
    yes: ['the-star', 'the-sun', 'six-of-swords'],
    no: ['nine-of-swords', 'ten-of-swords', 'five-of-cups'],
    wait: ['the-hanged-man', 'the-hermit', 'the-moon'],
    labels: { yes: 'Cards of hope', no: 'Cards that say it is heavy right now', wait: 'Cards that say rest' },
  },
  {
    slug: 'will-i-get-pregnant',
    question: 'Will I get pregnant?',
    title: 'Will I Get Pregnant? Tarot for Reflection, Not Prediction',
    description: 'Asking tarot about pregnancy, gently: why the cards are a tool for reflection rather than a medical answer, a three-card spread, and how the key cards read.',
    yes: ['the-empress', 'ace-of-cups', 'ace-of-pentacles'],
    no: ['four-of-swords', 'ten-of-wands', 'five-of-cups'],
    wait: ['the-high-priestess', 'the-hanged-man', 'seven-of-pentacles'],
    labels: { yes: 'Cards of openness', no: 'Cards that ask for care', wait: 'Cards of patience' },
  },
  {
    slug: 'should-i-break-up',
    question: 'Should I break up with him?',
    title: 'Should I Break Up? A Tarot Spread for Staying or Leaving',
    description: 'How to ask tarot whether you should break up, a three-card spread for staying or leaving, and the cards that lean leave, stay or wait.',
    yes: ['eight-of-cups', 'death', 'the-tower'],
    no: ['two-of-cups', 'ten-of-cups', 'temperance'],
    wait: ['two-of-swords', 'the-hanged-man', 'justice'],
    labels: { yes: 'Lean leave', no: 'Lean stay', wait: 'Lean wait' },
  },
  {
    slug: 'will-i-get-the-offer',
    question: 'Will I get the offer?',
    title: 'Will I Get the Offer? Tarot for UCAS and University Offers',
    description: 'Waiting on a UCAS or university offer? How to ask tarot about it, a three-card spread for the wait, and the cards that lean yes, no or wait.',
    yes: ['six-of-wands', 'the-world', 'three-of-wands'],
    no: ['five-of-pentacles', 'four-of-cups', 'the-tower'],
    wait: ['seven-of-pentacles', 'two-of-wands', 'the-hanged-man'],
  },
];

export function getQuestionPage(slug: string): QuestionPage | undefined {
  return QUESTION_PAGES.find((q) => q.slug === slug);
}

export function readQuestionMarkdown(slug: string): string {
  return fs.readFileSync(path.join(process.cwd(), 'src/content/questions', `${slug}.md`), 'utf8');
}
