// Clears all Vesper-scoped browser storage (localStorage + sessionStorage).
//
// Called on sign-out and account deletion. Without this, one account's cached data
// bleeds into the next account signed in on the same device — most visibly the journal
// warm cache (`vesper_journal`), which fetchJournalEntries() merges on top of the DB
// results, so a deleted account's readings keep reappearing for the next user.
export function clearVesperLocalData(): void {
  if (typeof window === 'undefined') return;
  for (const store of [window.localStorage, window.sessionStorage]) {
    try {
      const toRemove: string[] = [];
      for (let i = 0; i < store.length; i++) {
        const key = store.key(i);
        if (key && key.startsWith('vesper')) toRemove.push(key);
      }
      toRemove.forEach(key => store.removeItem(key));
    } catch {
      // Storage unavailable (private mode / disabled) — nothing to clear.
    }
  }
}

const LAST_USER_KEY = 'vesper_last_user_id';

// Sign-out doesn't always happen explicitly (closed tab, expired session, different
// Google account picked on a shared device), so clearVesperLocalData() alone isn't
// enough to stop one account's cached data bleeding into the next sign-in. This
// detects an account switch (by comparing the signed-in user id to the one last
// seen on this device) and wipes the cache before anything else reads it.
//
// Memoized to a single shared promise so every caller (LocalDataUserGuard,
// OnboardingMigration) awaits the *same* check — otherwise a synchronous
// localStorage read elsewhere could race ahead of this async user lookup and
// read/upload the previous account's stale data before it gets cleared.
let guardPromise: Promise<void> | null = null;

export function ensureLocalDataMatchesUser(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (guardPromise) return guardPromise;

  guardPromise = (async () => {
    const { createClient } = await import('@/lib/supabase/client');
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const lastUserId = localStorage.getItem(LAST_USER_KEY);
    if (lastUserId && lastUserId !== user.id) {
      clearVesperLocalData();
    }
    localStorage.setItem(LAST_USER_KEY, user.id);
  })();

  return guardPromise;
}
