/**
 * Handles team persistence across reloads:
 *   - URL search param `?team=name1,name2,...` — shareable link, takes priority
 *   - localStorage key `poke-lab:team` — fallback for reload without URL param
 *
 * Items (held items) are stored only in localStorage since they'd make the URL messy.
 */

const LS_KEY = 'poke-lab:team';

export interface PersistedSlot {
  name: string;
  heldItem?: string;
}

/** Read the initial team from URL param or localStorage. URL wins. */
export function readPersistedTeam(): PersistedSlot[] {
  try {
    // 1. URL param: ?team=groudon,xerneas,salamence
    const params = new URLSearchParams(window.location.search);
    const urlTeam = params.get('team');
    if (urlTeam) {
      const names = urlTeam
        .split(',')
        .map((n) => n.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 6);

      if (names.length > 0) {
        // Try to merge held items from localStorage for the same names
        const lsSlots = readFromLocalStorage();
        return names.map((name) => ({
          name,
          heldItem: lsSlots.find((s) => s.name === name)?.heldItem,
        }));
      }
    }

    // 2. localStorage fallback
    return readFromLocalStorage();
  } catch {
    return [];
  }
}

function readFromLocalStorage(): PersistedSlot[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return (parsed as PersistedSlot[]).filter(
      (s) => typeof s === 'object' && s !== null && typeof s.name === 'string',
    );
  } catch {
    return [];
  }
}

/** Persist the current team to localStorage and update the URL param. */
export function persistTeam(slots: PersistedSlot[]): void {
  try {
    // localStorage — includes held items
    localStorage.setItem(LS_KEY, JSON.stringify(slots));

    // URL — names only, no held items
    const url = new URL(window.location.href);
    if (slots.length > 0) {
      url.searchParams.set('team', slots.map((s) => s.name).join(','));
    } else {
      url.searchParams.delete('team');
    }
    window.history.replaceState(null, '', url.toString());
  } catch {
    // localStorage may be unavailable in some contexts — fail silently
  }
}
