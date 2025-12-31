import { test, expect } from '@playwright/test';

test.describe('Hello WebXR - 3D Content Loading', () => {
  test('should load the main page', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load and verify it has content
    await page.waitForLoadState('networkidle');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);

    // Check that we're on the hello-webxr path (not main site)
    const url = page.url();
    expect(url).toContain('/hello-webxr');
  });

  test('should load 3D assets successfully', async ({ page }) => {
    // Track network requests for 3D assets
    const assetRequests: string[] = [];
    page.on('request', request => {
      const url = request.url();
      if (url.includes('/assets/')) {
        assetRequests.push(url);
      }
    });

    // Track failed responses
    const failedAssets: string[] = [];
    page.on('response', response => {
      if (response.url().includes('/assets/') && response.status() === 404) {
        failedAssets.push(response.url());
      }
    });

    await page.goto('/');

    // Wait for initial load
    await page.waitForTimeout(5000);

    // Check that key 3D assets were requested
    const expectedAssets = [
      'hall.glb',
      'generic_controller.glb'
    ];

    for (const asset of expectedAssets) {
      expect(assetRequests.some(req => req.includes(asset))).toBeTruthy();
    }

    // Check no 404s for assets
    expect(failedAssets.length).toBe(0);
  });

  test('should load vendor transcoders', async ({ page }) => {
    const transcoderLoaded = page.waitForResponse(response =>
      response.url().includes('basis_transcoder.wasm') && response.ok()
    );

    await page.goto('/');

    // Wait for transcoder to load
    const response = await Promise.race([
      transcoderLoaded,
      page.waitForTimeout(10000).then(() => null)
    ]);

    expect(response).toBeTruthy();
  });

  test('should initialize WebGL context', async ({ page }) => {
    await page.goto('/');

    // Wait for WebGL to initialize
    await page.waitForTimeout(3000);

    // Check for WebGL canvas
    const canvas = page.locator('canvas');
    await expect(canvas.first()).toBeVisible();

    // Check that WebGL context is created (no errors in console)
    const webglErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        webglErrors.push(msg.text());
      }
    });

    await page.waitForTimeout(2000);

    // Filter out non-critical WebGL extension warnings
    const criticalErrors = webglErrors.filter(err =>
      !err.includes('WEBGL_compressed_texture') &&
      !err.includes('Removing intrinsics') &&
      !err.includes('Removing unpermitted')
    );

    expect(criticalErrors.length).toBe(0);
  });

  test('should take visual screenshot of loaded scene', async ({ page }) => {
    await page.goto('/');

    // Wait for 3D scene to load
    await page.waitForTimeout(8000);

    // Take screenshot for visual verification
    await page.screenshot({
      path: 'test-results/3d-scene.png',
      fullPage: true
    });
  });
});
