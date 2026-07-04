"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { track } from "@/lib/analytics";
import styles from "./landing.module.css";

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Returning-user login: go straight to the Google account chooser instead of
  // replaying onboarding. /auth/callback sends already-onboarded users to /main and
  // the middleware routes lapsed subscriptions to the paywall.
  async function handleSignIn() {
    if (signingIn) return;
    setSigningIn(true);
    track("signin_google_clicked");
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: "select_account" },
      },
    });
  }

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.navScrolled : ""}`}>
      <div className={styles.navInner}>
        <a href="/onboarding" className={styles.navLogo}>
          VESPER
        </a>
        <div className={styles.navRight}>
          <button
            type="button"
            onClick={handleSignIn}
            disabled={signingIn}
            className={styles.navSignin}
          >
            {signingIn ? "Opening…" : "Sign in"}
          </button>
          <a
            href="/onboarding"
            className={styles.navCta}
            onClick={() => track("landing_cta_clicked", { location: "nav" })}
          >
            Start free trial
          </a>
        </div>
        <button
          type="button"
          className={styles.navHamburger}
          aria-label="Menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        {menuOpen && (
          <div className={styles.navMenu}>
            <button
              type="button"
              onClick={handleSignIn}
              disabled={signingIn}
              className={styles.navMenuItem}
            >
              {signingIn ? "Opening…" : "Sign in"}
            </button>
            <a
              href="/onboarding"
              className={styles.navMenuCta}
              onClick={() => track("landing_cta_clicked", { location: "nav" })}
            >
              Start free trial
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}
