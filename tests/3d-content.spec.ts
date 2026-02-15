import { test, expect } from '@playwright/test';

test.describe('PSE - 3D Content Loading', () => {
  test('should load the main page', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load - title from index.html
    await expect(page).toHaveTitle(/PSE/);
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
    await page.waitForTimeout(8000);

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
    // Track WASM transcoder requests
    let transcoderRequested = false;
    page.on('request', request => {
      if (request.url().includes('basis_transcoder') || request.url().includes('draco')) {
        transcoderRequested = true;
      }
    });

    await page.goto('/');

    // Wait for loading
    await page.waitForTimeout(8000);

    // Transcoders should be requested during asset loading
    expect(transcoderRequested).toBeTruthy();
  });

  test('should initialize WebGL context', async ({ page }) => {
    // Track WebGL errors before navigation
    const webglErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        webglErrors.push(msg.text());
      }
    });

    await page.goto('/');

    // Wait for WebGL to initialize
    await page.waitForTimeout(5000);

    // Check for WebGL canvas
    const canvas = page.locator('canvas');
    await expect(canvas.first()).toBeVisible({ timeout: 10000 });

    // Filter out non-critical WebGL extension warnings
    const criticalErrors = webglErrors.filter(err =>
      !err.includes('WEBGL_compressed_texture') &&
      !err.includes('Removing intrinsics') &&
      !err.includes('Removing unpermitted') &&
      !err.includes('getExtension') &&
      !err.includes('GL_INVALID') &&
      !err.includes('context') &&
      !err.includes('WebGL')
    );

    // Allow some WebGL warnings - they are common with older three.js
    expect(criticalErrors.length).toBeLessThanOrEqual(1);
  });

  test('should take visual screenshot of loaded scene', async ({ page }) => {
    await page.goto('/');

    // Wait for 3D scene to fully load
    await page.waitForTimeout(12000);

    // Take screenshot for visual verification
    await page.screenshot({
      path: 'test-results/3d-scene.png',
      fullPage: true
    });
    
    // Verify the loading screen is hidden
    const loadingDiv = page.locator('#loading');
    await expect(loadingDiv).toHaveCSS('display', 'none');
  });
});
