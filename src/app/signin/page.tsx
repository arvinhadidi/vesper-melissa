'use client';

import { useState } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

export default function SignInPage() {
  const [loading, setLoading] = useState(false);

  async function handleGoogleSignIn() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    // No need to setLoading(false) — browser will navigate away
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px 40px',
      maxWidth: '520px',
      margin: '0 auto',
    }}>
      {/* Main content block — vertically centred */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0',
        width: '100%',
      }}>
        {/* Melissa avatar */}
        <Image
          src="/melissa/melissa-default.png"
          alt="Melissa"
          width={100}
          height={100}
          style={{ borderRadius: '50%', objectFit: 'cover', marginBottom: '28px' }}
        />

        {/* Wordmark */}
        <p style={{
          fontFamily: 'var(--font-dm-sans-var), sans-serif',
          fontSize: '13px',
          letterSpacing: '4px',
          textTransform: 'uppercase',
          color: '#C9A84C',
          margin: '0 0 14px',
        }}>
          Vesper
        </p>

        <h1 style={{
          fontFamily: 'var(--font-dm-serif-var), serif',
          fontSize: '42px',
          fontWeight: 400,
          color: '#FAF7F0',
          margin: '0 0 52px',
          textAlign: 'center',
          lineHeight: 1.1,
        }}>
          Welcome back.
        </h1>

        {/* Google button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{
            width: '100%',
            maxWidth: '360px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '16px 24px',
            background: '#FAF7F0',
            border: 'none',
            borderRadius: '14px',
            fontFamily: 'var(--font-dm-sans-var), sans-serif',
            fontSize: '16px',
            fontWeight: 500,
            color: '#1E1256',
            cursor: loading ? 'default' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'opacity 0.15s ease',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {loading ? 'Signing in...' : 'Continue with Google'}
        </button>

        <p style={{
          fontFamily: 'var(--font-dm-sans-var), sans-serif',
          fontSize: '13px',
          color: 'rgba(250,247,240,0.45)',
          marginTop: '18px',
          textAlign: 'center',
        }}>
          By continuing you agree to our Terms of Service.
        </p>
      </div>

      {/* Entertainment disclaimer — pinned to bottom */}
      <p style={{
        fontFamily: 'var(--font-dm-sans-var), sans-serif',
        fontSize: '11px',
        color: 'rgba(250,247,240,0.3)',
        marginTop: 'auto',
        paddingTop: '40px',
        textAlign: 'center',
        maxWidth: '300px',
        lineHeight: 1.55,
      }}>
        Vesper is for entertainment purposes only. Not a substitute for professional advice.
      </p>
    </div>
  );
}
