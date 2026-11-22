'use client';

import { useEffect, useState } from 'react';
import { DEFAULT_CURRENCY } from './constants';
import { isCurrencyCode, type CurrencyCode } from './pricing';

const PREVIEW_KEY = 'vesper_preview_currency';

export type GeoInfo = { currency: CurrencyCode; closingOffer: boolean; ready: boolean };

// Visitor's billing currency, from /api/geo (Vercel IP country → local currency, only
// when the live Stripe price can charge it), plus whether the paywall exit offer is
// live. Used by both paywalls so detection lives in one place.
// Dev only: add ?currency=EUR to any onboarding URL to preview another currency.
export function useGeo(): GeoInfo {
  const [geo, setGeo] = useState<GeoInfo>({ currency: DEFAULT_CURRENCY as CurrencyCode, closingOffer: false, ready: false });

  useEffect(() => {
    let preview: string | null = null;
    try {
      preview = new URLSearchParams(window.location.search).get('currency');
      if (preview) sessionStorage.setItem(PREVIEW_KEY, preview);
      else preview = sessionStorage.getItem(PREVIEW_KEY);
    } catch { /* storage blocked */ }
    fetch(`/api/geo${preview ? `?currency=${encodeURIComponent(preview)}` : ''}`)
      .then(r => r.json())
      .then((d: { currency?: string; closingOffer?: boolean }) => {
        setGeo({ currency: isCurrencyCode(d.currency) ? d.currency : (DEFAULT_CURRENCY as CurrencyCode), closingOffer: Boolean(d.closingOffer), ready: true });
      })
      .catch(() => setGeo(g => ({ ...g, ready: true })));
  }, []);

  return geo;
}

export function useDetectedCurrency(): CurrencyCode {
  return useGeo().currency;
}
