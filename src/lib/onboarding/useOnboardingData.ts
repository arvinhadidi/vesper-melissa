'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { OnboardingData } from './types';
import { DEFAULT_ONBOARDING_DATA, ONBOARDING_SESSION_KEY } from './constants';

export function useOnboardingData() {
  const router = useRouter();

  const [data, setData] = useState<OnboardingData>(() => {
    if (typeof window === 'undefined') return DEFAULT_ONBOARDING_DATA;
    try {
      const raw = sessionStorage.getItem(ONBOARDING_SESSION_KEY);
      if (!raw) return DEFAULT_ONBOARDING_DATA;
      return (JSON.parse(raw) as { data: OnboardingData }).data;
    } catch {
      return DEFAULT_ONBOARDING_DATA;
    }
  });

  const persist = useCallback((d: OnboardingData) => {
    try {
      sessionStorage.setItem(ONBOARDING_SESSION_KEY, JSON.stringify({ data: d }));
    } catch { /* storage full */ }
  }, []);

  const updateAndNavigate = useCallback((updates: Partial<OnboardingData>, nextPath: string) => {
    setData(prev => {
      const next = { ...prev, ...updates };
      persist(next);
      return next;
    });
    router.push(nextPath);
  }, [router, persist]);

  const navigate = useCallback((nextPath: string) => {
    persist(data);
    router.push(nextPath);
  }, [data, router, persist]);

  return { data, setData, updateAndNavigate, navigate, persist };
}
