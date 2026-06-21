'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_CURRENCY } from './constants';

// Detects the visitor's billing currency from their IP (USD vs the default GBP) so the
// paywall shows local pricing. Used by both the onboarding trial paywall and the standalone
// re-subscribe paywall — keep the detection logic in one place.
export function useDetectedCurrency(): string {
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);

  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(d => { if (d.currency === 'USD') setCurrency('USD'); })
      .catch(() => {});
  }, []);

  return currency;
}
