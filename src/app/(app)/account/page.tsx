'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUserProfile } from '@/lib/hooks/useUserProfile';
import { createClient } from '@/lib/supabase/client';
import { clearVesperLocalData } from '@/lib/clearLocalData';
import { resetAnalytics } from '@/lib/analytics';
import { PRICING, DEFAULT_CURRENCY, TRIAL_DAYS } from '@/lib/onboarding/constants';

type SubInfo = {
  status: string;
  cancelAtPeriodEnd: boolean;
  accessEndsAt: string | null;
  isTrialing: boolean;
};

export default function AccountPage() {
  const { profile, loading, error } = useUserProfile();
  const [subInfo, setSubInfo] = useState<SubInfo | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Reconcile the subscription against Stripe on load so the page reflects the truth
  // even if a webhook (e.g. a portal cancellation) hasn't been processed yet.
  useEffect(() => {
    let cancelled = false;
    fetch('/api/subscription-status', { method: 'POST' })
      .then(r => (r.ok ? r.json() : null))
      .then((data: SubInfo | null) => { if (!cancelled && data) setSubInfo(data); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  async function handleManageSubscription() {
    if (portalLoading) return;
    setPortalLoading(true);
    setPortalError(null);
    try {
      const res = await fetch('/api/billing-portal', { method: 'POST' });
      if (!res.ok) {
        setPortalError(res.status === 404 ? 'No billing account found yet.' : 'Could not open billing portal.');
        setPortalLoading(false);
        return;
      }
      const { url } = await res.json();
      if (url) window.location.href = url;
      else setPortalLoading(false);
    } catch {
      setPortalError('Could not open billing portal.');
      setPortalLoading(false);
    }
  }

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    clearVesperLocalData();
    resetAnalytics();
    window.location.href = '/';
  }

  async function handleDeleteAccount() {
    if (deleting) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch('/api/delete-account', { method: 'DELETE' });
      if (res.ok) {
        const supabase = createClient();
        await supabase.auth.signOut();
        clearVesperLocalData();
        resetAnalytics();
        window.location.href = '/';
      } else {
        setDeleteError("We couldn't delete your account. Please try again.");
        setDeleting(false);
      }
    } catch {
      setDeleteError("We couldn't delete your account. Please try again.");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '14px', color: 'rgba(250,247,240,0.6)' }}>Loading...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '24px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '14px', color: 'rgba(250,247,240,0.6)' }}>
          {error ? `Couldn't load your account: ${error}` : "Couldn't load your account."}
        </p>
        <Link href="/" style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '14px', color: '#C9A84C' }}>
          Sign in again
        </Link>
      </div>
    );
  }

  const p = PRICING[DEFAULT_CURRENCY];
  const planLabel = profile.subscriptionPlan === 'yearly'
    ? `${p.symbol}${p.yearly}/year`
    : `${p.symbol}${p.monthly}/month`;

  const trialEndDate = profile.trialStartedAt
    ? new Date(new Date(profile.trialStartedAt).getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
    : null;

  // Prefer the live Stripe reconcile (subInfo) over the cached mirror once it loads.
  const effectiveStatus = subInfo?.status ?? profile.subscriptionStatus;
  const isCancelling = subInfo?.cancelAtPeriodEnd === true;
  const accessEndsLabel = subInfo?.accessEndsAt
    ? new Date(subInfo.accessEndsAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })
    : null;

  // Prefer the live Stripe signal once it's loaded — trial_started_at alone is
  // sticky (only ever set, never cleared, by the checkout webhook), so a paid,
  // non-trial subscription that follows an earlier trial would otherwise still
  // show "Trial" based on stale data from that earlier subscription.
  const isTrialing = subInfo
    ? subInfo.isTrialing && !isCancelling
    : effectiveStatus === 'active' && Boolean(profile.trialStartedAt) && Boolean(trialEndDate) && !isCancelling;
  const badgeActive = effectiveStatus === 'active' && !isCancelling;
  const badgeLabel = isCancelling
    ? 'Cancelling'
    : isTrialing
      ? 'Trial'
      : effectiveStatus === 'active'
        ? 'Active'
        : effectiveStatus;

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '48px 24px 120px',
      maxWidth: '520px',
      margin: '0 auto',
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '50%',
        background: 'rgba(201,168,76,0.15)',
        border: '2px solid rgba(201,168,76,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px',
      }}>
        <span style={{ fontFamily: 'var(--font-dm-serif-var), serif', fontSize: '28px', color: '#C9A84C' }}>
          {profile.displayName.charAt(0).toUpperCase() || '?'}
        </span>
      </div>

      <h1 style={{
        fontFamily: 'var(--font-dm-serif-var), serif',
        fontSize: '28px',
        fontWeight: 400,
        color: '#FAF7F0',
        margin: '0 0 4px',
      }}>
        {profile.displayName || 'Your Account'}
      </h1>

      {profile.starSign && (
        <p style={{
          fontFamily: 'var(--font-dm-sans-var), sans-serif',
          fontSize: '14px',
          color: 'rgba(250,247,240,0.5)',
          margin: '0 0 16px',
          textTransform: 'capitalize',
        }}>
          {profile.starSign}
        </p>
      )}

      <Link
        href="/account/edit-profile"
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: '12px',
          border: '1.5px solid #C9A84C',
          background: 'transparent',
          color: '#C9A84C',
          fontFamily: 'var(--font-dm-sans-var), sans-serif',
          fontSize: '15px',
          fontWeight: 600,
          textAlign: 'center',
          textDecoration: 'none',
          boxSizing: 'border-box',
          marginBottom: '32px',
        }}
      >
        Edit profile
      </Link>

      <div style={{
        width: '100%',
        background: 'rgba(250,247,240,0.04)',
        border: '1px solid rgba(201,168,76,0.25)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '13px', color: 'rgba(250,247,240,0.5)', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Subscription
          </span>
          <span style={{
            fontFamily: 'var(--font-dm-sans-var), sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: '8px',
            textTransform: 'capitalize',
            background: badgeActive ? 'rgba(76,175,80,0.15)' : 'rgba(255,152,0,0.15)',
            color: badgeActive ? '#66BB6A' : '#FFA726',
          }}>
            {badgeLabel}
          </span>
        </div>

        {isCancelling && (
          <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '14px', color: 'rgba(250,247,240,0.75)', margin: '0 0 12px', lineHeight: 1.5 }}>
            Your subscription is cancelled.{accessEndsLabel ? ` You'll keep access until ${accessEndsLabel},` : ''} and you won&apos;t be charged again.
          </p>
        )}

        {!isCancelling && isTrialing && (
          <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '14px', color: 'rgba(250,247,240,0.75)', margin: '0 0 12px', lineHeight: 1.5 }}>
            Your trial ends on {trialEndDate}. You&apos;ll be charged {planLabel} after.
          </p>
        )}

        {!isCancelling && profile.subscriptionPlan && !isTrialing && (
          <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '14px', color: 'rgba(250,247,240,0.75)', margin: '0 0 12px', lineHeight: 1.5 }}>
            {profile.subscriptionPlan === 'yearly' ? 'Yearly' : 'Monthly'} plan: {planLabel}
          </p>
        )}

        <button
          onClick={handleManageSubscription}
          disabled={portalLoading}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '12px',
            border: '1.5px solid #C9A84C',
            background: 'transparent',
            color: '#C9A84C',
            fontFamily: 'var(--font-dm-sans-var), sans-serif',
            fontSize: '15px',
            fontWeight: 600,
            cursor: portalLoading ? 'wait' : 'pointer',
            opacity: portalLoading ? 0.6 : 1,
            transition: 'opacity 0.15s ease',
          }}
        >
          {portalLoading ? 'Opening...' : 'Manage subscription'}
        </button>

        {portalError && (
          <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '13px', color: '#FFA726', margin: '10px 0 0', textAlign: 'center' }}>
            {portalError}
          </p>
        )}
      </div>

      <button
        onClick={handleSignOut}
        disabled={signingOut}
        style={{
          marginTop: '24px',
          padding: '12px 24px',
          borderRadius: '10px',
          border: 'none',
          background: 'rgba(250,247,240,0.06)',
          color: 'rgba(250,247,240,0.5)',
          fontFamily: 'var(--font-dm-sans-var), sans-serif',
          fontSize: '14px',
          fontWeight: 500,
          cursor: signingOut ? 'wait' : 'pointer',
        }}
      >
        {signingOut ? 'Signing out...' : 'Sign out'}
      </button>

      {!showDeleteConfirm ? (
        <button
          onClick={() => setShowDeleteConfirm(true)}
          style={{
            marginTop: '32px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-dm-sans-var), sans-serif',
            fontSize: '13px',
            color: 'rgba(250,247,240,0.3)',
            textDecoration: 'underline',
            padding: 0,
          }}
        >
          Delete account
        </button>
      ) : (
        <div style={{
          marginTop: '32px',
          width: '100%',
          background: 'rgba(220,53,69,0.07)',
          border: '1px solid rgba(220,53,69,0.25)',
          borderRadius: '14px',
          padding: '20px',
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: 'var(--font-dm-sans-var), sans-serif',
            fontSize: '14px',
            color: 'rgba(250,247,240,0.8)',
            margin: '0 0 16px',
            lineHeight: 1.5,
          }}>
            This permanently deletes your account and cancels your subscription. Are you sure?
          </p>
          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            style={{
              width: '100%',
              padding: '13px',
              borderRadius: '10px',
              border: '1px solid rgba(220,53,69,0.35)',
              background: 'rgba(220,53,69,0.12)',
              color: '#FAF7F0',
              fontFamily: 'var(--font-dm-sans-var), sans-serif',
              fontSize: '14px',
              fontWeight: 600,
              cursor: deleting ? 'wait' : 'pointer',
              opacity: deleting ? 0.6 : 1,
              marginBottom: '10px',
              transition: 'opacity 0.15s ease',
            }}
          >
            {deleting ? 'Deleting...' : 'Yes, delete my account'}
          </button>
          <button
            onClick={() => setShowDeleteConfirm(false)}
            disabled={deleting}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-dm-sans-var), sans-serif',
              fontSize: '13px',
              color: 'rgba(250,247,240,0.45)',
              padding: 0,
            }}
          >
            Cancel
          </button>
          {deleteError && (
            <p style={{ fontFamily: 'var(--font-dm-sans-var), sans-serif', fontSize: '13px', color: '#FF8A80', margin: '12px 0 0', lineHeight: 1.5 }}>
              {deleteError}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
