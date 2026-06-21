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
