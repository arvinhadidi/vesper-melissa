import { JournalEntry } from './types';

const STORAGE_KEY = 'vesper_journal';

function readAll(): JournalEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as JournalEntry[]) : [];
  } catch {
    return [];
  }
}

function writeAll(entries: JournalEntry[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

// Most recent first.
export function getJournalEntries(): JournalEntry[] {
  return readAll().sort(
    (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
  );
}

export function getJournalEntry(id: string): JournalEntry | null {
  return readAll().find(e => e.id === id) ?? null;
}

// Tracks the in-flight POST (insert) per entry id, so a PATCH fired right after a
// save (e.g. tapping an emoji reaction immediately after "Add to journal") waits for
// the row to actually exist server-side first. Without this, the two fire-and-forget
// requests can land out of order and the PATCH silently no-ops against a row that
// hasn't been inserted yet.
const pendingSaves = new Map<string, Promise<unknown>>();

// Upsert by id — updates in-memory/localStorage and fires an async Supabase save.
export function saveJournalEntry(entry: JournalEntry): JournalEntry {
  const entries = readAll();
  const idx = entries.findIndex(e => e.id === entry.id);

  let merged: JournalEntry;
  if (idx === -1) {
    entries.push(entry);
    merged = entry;
  } else {
    const existing = entries[idx];
    merged = {
      ...existing,
      ...entry,
      savedAt: existing.savedAt,
      melissaText: entry.melissaText || existing.melissaText,
      impression: existing.impression ?? entry.impression,
      resonanceRating: existing.resonanceRating ?? entry.resonanceRating,
      emojiReaction: entry.emojiReaction ?? existing.emojiReaction,
    };
    entries[idx] = merged;
  }
  writeAll(entries);

  // Best-effort Supabase persist (fire-and-forget, no await)
  if (typeof window !== 'undefined') {
    const savePromise = fetch('/api/journal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(merged),
    }).catch(() => {/* silently fall back to localStorage-only */});

    pendingSaves.set(entry.id, savePromise);
    savePromise.finally(() => {
      if (pendingSaves.get(entry.id) === savePromise) pendingSaves.delete(entry.id);
    });
  }

  return merged;
}

export function updateJournalEntry(
  id: string,
  patch: Partial<Omit<JournalEntry, 'id'>>,
): void {
  const entries = readAll();
  const idx = entries.findIndex(e => e.id === id);
  if (idx === -1) return;
  entries[idx] = { ...entries[idx], ...patch };
  writeAll(entries);

  // Best-effort Supabase patch — wait for an in-flight save (insert) of this same
  // entry to settle first, so we never PATCH a row that doesn't exist yet.
  if (typeof window !== 'undefined') {
    const pending = pendingSaves.get(id) ?? Promise.resolve();
    pending.then(() => fetch('/api/journal', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...patch }),
    })).catch(() => {});
  }
}

export function deleteJournalEntry(id: string): void {
  writeAll(readAll().filter(e => e.id !== id));

  // Best-effort Supabase delete
  if (typeof window !== 'undefined') {
    fetch(`/api/journal?id=${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {});
  }
}

// Local-only entries older than this are presumed permanently gone server-side
// (deleted account, DB wipe, etc.) rather than still mid-sync, and are dropped
// instead of being resurrected on every fetch.
const UNSYNCED_GRACE_PERIOD_MS = 15 * 60 * 1000;

// Fetch journal entries from Supabase (for the journal page).
// Falls back to localStorage on error or when unauthenticated.
export async function fetchJournalEntries(): Promise<JournalEntry[]> {
  try {
    const res = await fetch('/api/journal');
    if (!res.ok) throw new Error('not ok');
    const remote: JournalEntry[] = await res.json();
    const local = readAll();

    // Merge: use remote as base, add only recent local entries not yet in remote
    // (still mid-sync). Older local-only entries are stale cache, not new data.
    const remoteIds = new Set(remote.map(e => e.id));
    const now = Date.now();
    const pendingLocal = local.filter(
      e => !remoteIds.has(e.id) && now - new Date(e.savedAt).getTime() < UNSYNCED_GRACE_PERIOD_MS,
    );

    // For entries present both remotely and locally, backfill any soft field
    // (melissaText/impression/resonanceRating/emojiReaction) that's still empty on
    // the remote row from the local cache. These fields only ever move from
    // null -> set in the UI (never reset back to null), so a remote-null/local-set
    // mismatch always means a PATCH was lost in flight, not an intentional clear.
    const localById = new Map(local.map(e => [e.id, e]));
    const reconciled = remote.map(r => {
      const l = localById.get(r.id);
      if (!l) return r;
      return {
        ...r,
        melissaText: r.melissaText || l.melissaText,
        impression: r.impression ?? l.impression,
        resonanceRating: r.resonanceRating ?? l.resonanceRating,
        emojiReaction: r.emojiReaction ?? l.emojiReaction,
      };
    });

    const merged = [...reconciled, ...pendingLocal];
    writeAll(merged);
    return merged.sort(
      (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
    );
  } catch {
    return getJournalEntries();
  }
}
