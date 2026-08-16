/**
 * Per-element theme overrides (admin feature).
 *
 * Themes are normally taken from data/elements.ts (`element.theme`). An admin
 * can override the scene of any element at runtime. Overrides are cached in
 * localStorage and — when a sync endpoint is configured — also pushed to /
 * pulled from a backend API, so curated scenes survive across devices.
 *
 * This module is the single source of truth for reading/writing overrides.
 * Room and theme code never talks to storage or the network directly.
 *
 * Configure a sync endpoint (optional) via:
 *   - URL param:  ?themeApi=https://api.example.com/theme-overrides
 *   - window global (before mount): window.THEME_OVERRIDES_API = '...'
 * Leave it unset and overrides stay purely local (no network calls).
 *
 * Endpoint contract (all admin-key protected; send the key as x-api-key):
 *   GET    <endpoint>                  -> { "H": "cosmic", "Fe": "forge", ... }
 *   PUT    <endpoint>                  -> replace the whole map (body = map)
 *   PATCH  <endpoint>/<symbol>         -> { "themeKey": "cosmic" }  (upsert one)
 *   DELETE <endpoint>/<symbol>         -> remove one key
 * Single-key edits use PATCH/DELETE so concurrent admins don't clobber.
 */

const STORAGE_KEY = 'chemie-theme-overrides';

let adminApiKey = '';

/** Set the admin API key used for backend sync (sent as the x-api-key header). */
export function setAdminApiKey(key: string): void {
  adminApiKey = key || '';
}

type OverrideMap = Record<string, string>;

/** Resolve the optional sync endpoint (URL param wins, then window global). */
function getEndpoint(): string | null {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('themeApi');
    if (fromUrl) return fromUrl;
  } catch {
    /* URLSearchParams unavailable — ignore */
  }
  const fromGlobal = (window as unknown as { THEME_OVERRIDES_API?: string }).THEME_OVERRIDES_API;
  return typeof fromGlobal === 'string' && fromGlobal.length > 0 ? fromGlobal : null;
}

function loadLocal(): OverrideMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as OverrideMap) : {};
  } catch {
    return {};
  }
}

function saveLocal(map: OverrideMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* storage unavailable (private mode / quota) — keep in memory only */
  }
}

async function loadRemote(): Promise<OverrideMap | null> {
  const endpoint = getEndpoint();
  if (!endpoint) return null;
  try {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (adminApiKey) headers['x-api-key'] = adminApiKey;
    const res = await fetch(endpoint, { headers });
    if (!res.ok) return null;
    const data = await res.json();
    return data && typeof data === 'object' ? (data as OverrideMap) : null;
  } catch {
    return null; // offline / unreachable — fall back to local cache
  }
}

/** Push a single key to the backend (PATCH to upsert, DELETE to remove). */
async function saveRemoteKey(symbol: string, themeKey: string | null): Promise<void> {
  const endpoint = getEndpoint();
  if (!endpoint) return;
  const url = `${endpoint}/${encodeURIComponent(symbol)}`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (adminApiKey) headers['x-api-key'] = adminApiKey;
  try {
    if (themeKey === null) {
      await fetch(url, { method: 'DELETE', headers });
    } else {
      await fetch(url, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ themeKey }),
      });
    }
  } catch {
    /* offline: local cache remains the source of truth */
  }
}

/** Effective theme key for an element, or undefined if no override is set. */
export function getThemeOverride(symbol: string): string | undefined {
  return loadLocal()[symbol];
}

/**
 * Set or clear an override. Pass `themeKey = null` to remove the override and
 * fall back to the element's static theme. Persists locally immediately and
 * syncs to the backend (single key) in the background.
 */
export function setThemeOverride(symbol: string, themeKey: string | null): void {
  const map = loadLocal();
  if (themeKey === null) {
    delete map[symbol];
  } else {
    map[symbol] = themeKey;
  }
  saveLocal(map);
  void saveRemoteKey(symbol, themeKey);
}

/** All current overrides (symbol -> themeKey) from the local cache. */
export function getAllOverrides(): OverrideMap {
  return loadLocal();
}

/**
 * Pull remote overrides into the local cache, merging per key (remote wins,
 * local-only keys are preserved). Call once at startup (e.g. from mount) so
 * device-independent admin edits appear without wiping local edits.
 */
export async function refreshOverridesFromRemote(): Promise<void> {
  const remote = await loadRemote();
  if (!remote) return;
  const merged = { ...loadLocal(), ...remote };
  saveLocal(merged);
}
