export type RecentlyViewedProduct = {
  id: string;
  name: string;
  slug: string;
  image: string;
  price: number;
};

const STORAGE_KEY = "rootora-recently-viewed";
const MAX_ITEMS = 8;
const EVENT = "rootora-recently-viewed";

const EMPTY: RecentlyViewedProduct[] = [];
let cachedSnapshot: RecentlyViewedProduct[] = EMPTY;
let cachedRaw: string | null = null;

function notify() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(EVENT));
  }
}

function sameItems(
  a: RecentlyViewedProduct[],
  b: RecentlyViewedProduct[]
) {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  return a.every(
    (item, index) =>
      item.id === b[index]?.id &&
      item.slug === b[index]?.slug &&
      item.image === b[index]?.image &&
      item.price === b[index]?.price &&
      item.name === b[index]?.name
  );
}

/**
 * Snapshot for useSyncExternalStore — must return a stable reference
 * when the underlying data has not changed.
 */
export function getRecentlyViewed(): RecentlyViewedProduct[] {
  if (typeof window === "undefined") return EMPTY;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cachedSnapshot;
    cachedRaw = raw;

    if (!raw) {
      cachedSnapshot = EMPTY;
      return cachedSnapshot;
    }

    const parsed = JSON.parse(raw) as RecentlyViewedProduct[];
    const next = Array.isArray(parsed) ? parsed.slice(0, MAX_ITEMS) : EMPTY;

    if (sameItems(next, cachedSnapshot)) {
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

export function addRecentlyViewed(product: RecentlyViewedProduct) {
  if (typeof window === "undefined") return;
  const current = getRecentlyViewed().filter((item) => item.id !== product.id);
  const next = [product, ...current].slice(0, MAX_ITEMS);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  cachedRaw = null; // force snapshot refresh on next get
  notify();
}

export function subscribeRecentlyViewed(onChange: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}
