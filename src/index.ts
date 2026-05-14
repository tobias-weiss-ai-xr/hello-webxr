import { mount } from './embed/mount.js';

const existingCanvas = document.getElementById('renderCanvas') as HTMLCanvasElement;
const loadingEl = document.getElementById('loading');
const noWebGLEl = document.getElementById('no-webgl');

if (existingCanvas) {
  const container = existingCanvas.parentElement;
  if (container) {
    existingCanvas.remove();
    try {
      mount({
        container,
        locale: 'de',
        startRoom: 'lobby',
        onReady: () => {
          console.log('[PSE VR] Application ready');
          if (loadingEl) loadingEl.style.display = 'none';
        },
      });
    } catch (e) {
      console.error('Failed to initialize:', e);
      if (loadingEl) loadingEl.style.display = 'none';
      if (noWebGLEl) noWebGLEl.classList.remove('hidden');
    }
  }
}
