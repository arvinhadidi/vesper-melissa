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
    fetch('/api/journal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(merged),
    }).catch(() => {/* silently fall back to localStorage-only */});
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

  // Best-effort Supabase patch
  if (typeof window !== 'undefined') {
    fetch('/api/journal', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...patch }),
    }).catch(() => {});
  }
}

export function deleteJournalEntry(id: string): void {
  writeAll(readAll().filter(e => e.id !== id));

  // Best-effort Supabase delete
  if (typeof window !== 'undefined') {
    fetch(`/api/journal?id=${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {});
  }
}

// Fetch journal entries from Supabase (for the journal page).
// Falls back to localStorage on error or when unauthenticated.
export async function fetchJournalEntries(): Promise<JournalEntry[]> {
  try {
    const res = await fetch('/api/journal');
    if (!res.ok) throw new Error('not ok');
    const data: JournalEntry[] = await res.json();
    // Keep local cache in sync so offline reads stay warm
    writeAll(data);
    return data.sort(
      (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
    );
  } catch {
    return getJournalEntries();
  }
}
