import { createClient } from './supabase/client';

export type TourStepId = 'main' | 'daily' | 'spread' | 'journal';

export type TourStep = {
  id: TourStepId;
  route: string;
  title: string;
  body: string;
};

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'main',
    route: '/main',
    title: 'Welcome to Vesper.',
    body: 'This is your home. Daily readings, guided spreads with Melissa, and your private journal — everything is here.',
  },
  {
    id: 'daily',
    route: '/daily',
    title: 'Your daily card.',
    body: 'Every morning, a card is drawn just for you. This is the one you pulled during your reading. Come back tomorrow for a new one.',
  },
  {
    id: 'spread',
    route: '/spread/tour',
    title: 'Ask Melissa anything.',
    body: "When you have a question, Melissa pulls three cards and reads them together. Here's your first spread.",
  },
  {
    id: 'journal',
    route: '/journal',
    title: 'Your private journal.',
    body: 'Every reading is saved here. Add your own thoughts, track what resonates, and watch patterns emerge over time.',
  },
];

const TOUR_ACTIVE_KEY = 'vesper_tour_active';

export function isTourActive(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(TOUR_ACTIVE_KEY) === 'true';
}

export function setTourActive(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOUR_ACTIVE_KEY, 'true');
}

export function getTourStepIndexForRoute(pathname: string): number {
  const idx = TOUR_STEPS.findIndex(s => s.route === pathname);
  return idx;
}

export function completeTour(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOUR_ACTIVE_KEY);
  const supabase = createClient();
  supabase.auth.getUser().then(({ data: { user } }) => {
    if (!user) return;
    void supabase.from('user_profiles').upsert(
      { id: user.id, tour_completed: true, tour_completed_at: new Date().toISOString() },
      { onConflict: 'id' },
    );
  });
}
