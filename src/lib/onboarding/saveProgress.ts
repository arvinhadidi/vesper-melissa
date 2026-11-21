'use client';

import posthog from 'posthog-js';
import { ONBOARDING_SESSION_KEY } from './constants';

const SID_KEY = 'vesper_sid';
const ATTR_KEY = 'vesper_first_touch';

/** Stable per-browser id (localStorage, survives tabs, visits and the Google redirect). */
export function getSessionId(): string | null {
  try {
    let sid = localStorage.getItem(SID_KEY);
    if (!sid) {
      sid = crypto.randomUUID();
      localStorage.setItem(SID_KEY, sid);
    }
    return sid;
  } catch {
    return null;
  }
}

type FirstTouch = { referrer: string | null; landing_path: string; utm: Record<string, string> };

function firstTouch(): FirstTouch | null {
  try {
    const stored = localStorage.getItem(ATTR_KEY);
    if (stored) return JSON.parse(stored) as FirstTouch;
    const params = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    params.forEach((v, k) => { if (/^utm_|^ttclid$|^fbclid$|^gclid$/.test(k)) utm[k] = v; });
    const ft: FirstTouch = { referrer: document.referrer || null, landing_path: window.location.pathname, utm };
    localStorage.setItem(ATTR_KEY, JSON.stringify(ft));
    return ft;
  } catch {
    return null;
  }
}

/** Call once as early as possible (landing page) so first-touch source is the real one. */
export function captureFirstTouch(): void {
  firstTouch();
}

function readAnswers(): unknown {
  try {
    const raw = sessionStorage.getItem(ONBOARDING_SESSION_KEY);
    return raw ? (JSON.parse(raw) as { data: unknown }).data : null;
  } catch {
    return null;
  }
}

/**
 * Fire-and-forget save of where this visitor is and everything they have answered.
 * Never throws, never blocks navigation (keepalive lets it finish during a redirect).
 */
export function saveProgress(opts: { step?: string; index?: number; event?: string } = {}): void {
  const sid = getSessionId();
  if (!sid) return;
  const ft = firstTouch();
  let posthogId: string | undefined;
  try { posthogId = posthog.get_distinct_id?.(); } catch { /* posthog not initialised */ }
  const body = JSON.stringify({
    sid,
    ...opts,
    answers: readAnswers(),
    referrer: ft?.referrer,
    landing_path: ft?.landing_path,
    utm: ft?.utm,
    posthog_id: posthogId,
  });
  try {
    fetch('/api/onboarding/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {});
  } catch { /* ignore */ }
}
