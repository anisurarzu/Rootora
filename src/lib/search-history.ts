const STORAGE_KEY = "rootora-recent-searches";
const MAX_RECENT = 8;

export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
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
}

export function clearRecentSearches() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
