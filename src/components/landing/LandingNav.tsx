"use client";

import { useEffect, useState } from "react";
import styles from "./landing.module.css";

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.navScrolled : ""}`}>
      <div className={styles.navInner}>
        <a href="/signin" className={styles.navLogo}>
          VESPER
        </a>
        <div className={styles.navRight}>
          <a href="/signin" className={styles.navSignin}>
            Sign in
          </a>
          <a href="/signin" className={styles.navCta}>
            Start free trial
          </a>
        </div>
        <button
          type="button"
          className={styles.navHamburger}
          aria-label="Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
}
