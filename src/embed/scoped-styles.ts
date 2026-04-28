export function injectScopedStyles(): void {
  if (document.getElementById('pse-vr-styles')) return;
  const style = document.createElement('style');
  style.id = 'pse-vr-styles';
  style.textContent = `
    #pse-vr-canvas { outline: none; touch-action: none; user-select: none; display: block; }
    .pse-vr-loading { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #888; font-family: system-ui, sans-serif; font-size: 14px; }
  `;
  document.head.appendChild(style);
}

export function removeScopedStyles(): void {
  document.getElementById('pse-vr-styles')?.remove();
}
