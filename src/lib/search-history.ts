const STORAGE_KEY = "rootora-recent-searches";
const MAX_RECENT = 8;
const EVENT = "rootora-recent-searches";

const EMPTY: string[] = [];
let cachedSnapshot: string[] = EMPTY;
let cachedRaw: string | null = null;

function notify() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(EVENT));
  }
}

export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cachedSnapshot;
    cachedRaw = raw;
    if (!raw) {
      cachedSnapshot = EMPTY;
      return cachedSnapshot;
    }
    const parsed = JSON.parse(raw) as unknown;
    const next = Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : EMPTY;
    if (
      next.length === cachedSnapshot.length &&
      next.every((term, i) => term === cachedSnapshot[i])
    ) {
      return cachedSnapshot;
    }
    cachedSnapshot = next.length === 0 ? EMPTY : next;
    return cachedSnapshot;
  } catch {
    cachedRaw = null;
    cachedSnapshot = EMPTY;
    return cachedSnapshot;
  }
}

export function addRecentSearch(term: string) {
  const trimmed = term.trim();
  if (!trimmed || typeof window === "undefined") return;

  const existing = getRecentSearches().filter(
    (item) => item.toLowerCase() !== trimmed.toLowerCase()
  );
  const next = [trimmed, ...existing].slice(0, MAX_RECENT);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  cachedRaw = null;
  notify();
}

export function clearRecentSearches() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  cachedRaw = null;
  cachedSnapshot = EMPTY;
  notify();
}

export function subscribeRecentSearches(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(EVENT, onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(EVENT, onStoreChange);
  };
}
