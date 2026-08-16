/**
 * Per-element theme overrides (admin feature).
 *
 * Themes are normally taken from data/elements.ts (`element.theme`). An admin
 * can override the scene of any element at runtime; overrides persist in
 * localStorage and take precedence over the static data. This module is the
 * single source of truth for reading/writing those overrides.
 *
 * Later this can be synced to a backend API without touching room code:
 * replace the localStorage calls in load/save with fetch() calls.
 */

const STORAGE_KEY = 'chemie-theme-overrides';

type OverrideMap = Record<string, string>;

function load(): OverrideMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as OverrideMap) : {};
  } catch {
    return {};
  }
}

function save(map: OverrideMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* storage unavailable (private mode / quota) — overrides stay in-memory only */
  }
}

/** Effective theme key for an element, or undefined if no override is set. */
export function getThemeOverride(symbol: string): string | undefined {
  return load()[symbol];
}

/**
 * Set or clear an override. Pass `themeKey = null` to remove the override and
 * fall back to the element's static theme.
 */
export function setThemeOverride(symbol: string, themeKey: string | null): void {
  const map = load();
  if (themeKey === null) {
    delete map[symbol];
  } else {
    map[symbol] = themeKey;
  }
  save(map);
}

/** All current overrides (symbol -> themeKey). */
export function getAllOverrides(): OverrideMap {
  return load();
}
