/**
 * In-app theme admin (activated via the `?admin` URL param).
 *
 * Lets an admin pick a scene theme per element at runtime. The choice is
 * persisted in localStorage via lib/themeOverrides and applied live to the
 * active room (no reload). This is the self-contained admin surface; it can
 * later be replaced/augmented by a backend-backed dashboard without touching
 * the room or theme code.
 */
import { THEMES } from '../data/themes.js';
import { setThemeOverride, setAdminApiKey } from '../lib/themeOverrides.js';
import * as ElementRoom from '../rooms/ElementRoom.js';

export function initThemeAdmin(): void {
  const params = new URLSearchParams(window.location.search);
  if (!params.has('admin')) return;

  const themeKeys = Object.keys(THEMES).sort((a, b) =>
    (THEMES[a].name || a).localeCompare(THEMES[b].name || b)
  );

  const panel = document.createElement('div');
  panel.id = 'theme-admin-panel';
  Object.assign(panel.style, {
    position: 'fixed',
    top: '12px',
    right: '12px',
    zIndex: '9999',
    background: 'rgba(12,14,20,0.92)',
    color: '#e8ecf4',
    font: '13px/1.4 system-ui, sans-serif',
    padding: '12px',
    borderRadius: '10px',
    border: '1px solid rgba(120,140,180,0.4)',
    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
    width: '232px',
  });

  const title = document.createElement('div');
  title.textContent = 'Theme Admin';
  Object.assign(title.style, { fontWeight: '700', marginBottom: '8px', fontSize: '14px' });
  panel.appendChild(title);

  const elLabel = document.createElement('div');
  Object.assign(elLabel.style, { opacity: '0.8', marginBottom: '6px' });
  panel.appendChild(elLabel);

  const select = document.createElement('select');
  select.id = 'theme-admin-select';
  Object.assign(select.style, {
    width: '100%',
    padding: '6px',
    borderRadius: '6px',
    border: '1px solid #2a3142',
    background: '#1a1f2b',
    color: '#e8ecf4',
    marginBottom: '8px',
  });
  for (const key of themeKeys) {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = `${THEMES[key].name} (${key})`;
    select.appendChild(opt);
  }
  panel.appendChild(select);

  const keyInput = document.createElement('input');
  keyInput.type = 'password';
  keyInput.placeholder = 'Admin-API-Key (Backend-Sync)';
  keyInput.id = 'theme-admin-key';
  Object.assign(keyInput.style, {
    width: '100%',
    padding: '6px',
    borderRadius: '6px',
    border: '1px solid #2a3142',
    background: '#1a1f2b',
    color: '#e8ecf4',
    marginBottom: '8px',
  });
  keyInput.addEventListener('input', () => setAdminApiKey(keyInput.value.trim()));
  panel.appendChild(keyInput);

  const btnRow = document.createElement('div');
  Object.assign(btnRow.style, { display: 'flex', gap: '6px' });
  const applyBtn = document.createElement('button');
  applyBtn.textContent = 'Anwenden';
  const resetBtn = document.createElement('button');
  resetBtn.textContent = 'Zurücksetzen';
  for (const b of [applyBtn, resetBtn]) {
    Object.assign(b.style, {
      flex: '1',
      padding: '6px',
      borderRadius: '6px',
      cursor: 'pointer',
      border: '1px solid #2a3142',
      background: '#243049',
      color: '#e8ecf4',
    });
  }
  btnRow.appendChild(applyBtn);
  btnRow.appendChild(resetBtn);
  panel.appendChild(btnRow);

  const hint = document.createElement('div');
  const endpoint =
    (window as unknown as { THEME_OVERRIDES_API?: string }).THEME_OVERRIDES_API ||
    new URLSearchParams(window.location.search).get('themeApi');
  hint.textContent = endpoint
    ? `Sync: ${endpoint} (Key nötig für Backend)`
    : '?admin — lokal gespeichert. Mit ?themeApi=<url> Backend-Sync.';
  Object.assign(hint.style, { opacity: '0.55', marginTop: '8px', fontSize: '11px' });
  panel.appendChild(hint);

  document.body.appendChild(panel);

  function refresh(): void {
    const symbol = ElementRoom.getCurrentElementSymbol();
    if (!symbol) {
      elLabel.textContent = 'Kein Element aktiv';
      return;
    }
    elLabel.textContent = `Element: ${symbol}`;
    select.value = ElementRoom.getEffectiveThemeKey(symbol);
  }

  applyBtn.addEventListener('click', () => {
    const symbol = ElementRoom.getCurrentElementSymbol();
    if (!symbol) return;
    setThemeOverride(symbol, select.value);
    ElementRoom.rethemeCurrentRoom();
  });

  resetBtn.addEventListener('click', () => {
    const symbol = ElementRoom.getCurrentElementSymbol();
    if (!symbol) return;
    setThemeOverride(symbol, null);
    refresh();
    ElementRoom.rethemeCurrentRoom();
  });

  window.addEventListener('pse:room', () => refresh());
  refresh();
}
