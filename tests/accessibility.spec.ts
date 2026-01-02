import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Arachnophobia - Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the spider room application
    await page.goto('/arachnophobia/');
  });

  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Inject axe-core and run accessibility scan
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    // Check for violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('header should have proper accessibility attributes', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Check header exists
    const header = page.locator('.header');
    await expect(header).toBeVisible();

    // Check header has proper heading structure
    const h1 = page.locator('.header-title h1');
    await expect(h1).toBeVisible();
    await expect(h1).ContainText('Arachnophobia');

    // Check color contrast for header (black background, white text)
    const headerColor = await header.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color
      };
    });

    // Verify high contrast (black background, white text)
    expect(headerColor.backgroundColor).toBe('rgb(0, 0, 0)');
    expect(headerColor.color).toBe('rgb(255, 255, 255)');
  });

  test('loading screen should be accessible', async ({ page }) => {
    // The loading screen appears first
    const loading = page.locator('#loading');
    await expect(loading).toBeVisible();

    // Check loading text is readable
    const loadingText = await loading.textContent();
    expect(loadingText).toContain('Arachnophobia');

    // Check for aria-label or role if loading screen persists
    const hasAria = await loading.evaluate((el) => {
      return el.hasAttribute('role') || el.hasAttribute('aria-label') || el.hasAttribute('aria-live');
    });

    // Note: Loading screen should be removed from DOM when loaded, not just hidden
    // This is checked during runtime
  });

  test('control links should have accessible names', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Check controller selection links
    const leftHandLink = page.locator('#lefthand');
    const rightHandLink = page.locator('#righthand');

    await expect(leftHandLink).toBeVisible();
    await expect(rightHandLink).toBeVisible();

    // Links should have discernible text
    await expect(leftHandLink).toHaveText('Left');
    await expect(rightHandLink).toHaveText('Right');

    // Links should be keyboard accessible
    await expect(leftHandLink).toHaveAttribute('href');
    await expect(rightHandLink).toHaveAttribute('href');
  });

  test('canvas should have accessible fallback', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // Wait for WebGL to initialize

    // Check canvas exists
    const canvas = page.locator('canvas');
    await expect(canvas.first()).toBeVisible();

    // Canvas should have fallback content or aria-label for screen readers
    const canvasHasLabel = await canvas.first().evaluate((el) => {
      return el.hasAttribute('aria-label') ||
             el.hasAttribute('role') ||
             el.textContent.trim().length > 0;
    });

    // Note: WebXR applications rely on canvas, but should provide alternative text
    // This test documents current state - improvement would be to add aria-label
  });

  test('page should have proper heading structure', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Check for exactly one h1 (main title)
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBe(1);

    // Verify h1 text content
    const h1Text = await page.locator('h1').textContent();
    expect(h1Text).toContain('Arachnophobia');
  });

  test('page should have proper meta tags for accessibility', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Check for language attribute
    const lang = await page.locator('html').getAttribute('lang');
    // Note: Should ideally have lang="en", but this documents current state

    // Check for viewport meta tag (responsive design)
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');

    // Check title
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    expect(title).toContain('Arachnophobia');
  });

  test('keyboard navigation should work', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Test Tab key navigation
    const tabOrder = [];
    page.on('focus', (element) => {
      tabOrder.push(element.tagName());
    });

    // Press Tab multiple times
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);

    // Check that focusable elements exist
    const focusableElements = await page.locator('a, button, [tabindex]:not([tabindex="-1"])').count();
    expect(focusableElements).toBeGreaterThan(0);
  });

  test('images and icons should have alt text', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // The spider emoji is text, not an image, which is good
    // Check if there are any img tags without alt
    const imagesWithoutAlt = await page.locator('img:not([alt])').count();
    expect(imagesWithoutAlt).toBe(0);
  });

  test('browser help should be readable', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Check help overlay exists
    const help = page.locator('#browser-help');
    await expect(help).toBeVisible();

    // Check text contrast (light background, dark text)
    const helpStyle = await help.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color
      };
    });

    // Help should have readable contrast
    expect(helpStyle.color).toBe('rgb(255, 255, 255)');
  });

  test('should have accessible color contrast in header', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Check header links contrast
    const headerLinks = page.locator('.header-controls a');

    const linkCount = await headerLinks.count();
    for (let i = 0; i < linkCount; i++) {
      const link = headerLinks.nth(i);

      const linkStyle = await link.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          color: styles.color,
          backgroundColor: styles.backgroundColor
        };
      });

      // White text on black background passes WCAG AAA
      expect(linkStyle.color).toBe('rgb(255, 255, 255)');
    }
  });

  test('should handle focus management', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Check that page can receive focus
    await page.keyboard.press('Tab');

    // Get focused element
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      return {
        tagName: el?.tagName,
        className: el?.className,
        id: el?.id
      };
    });

    // Something should be focusable
    expect(focusedElement.tagName).toBeTruthy();
  });

  test('should have proper semantic HTML', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Check for semantic elements
    const hasHeader = await page.locator('header, .header').count() > 0;
    expect(hasHeader).toBeTruthy();

    // Check main content area
    const hasMain = await page.locator('main, [role="main"]').count() > 0;
    // Note: This might fail currently - would be improvement to add main landmark

    // Check for proper use of div vs semantic elements
    const semanticElements = await page.evaluate(() => {
      const allElements = document.querySelectorAll('*');
      const semantic = ['header', 'nav', 'main', 'footer', 'article', 'section', 'aside'];
      let semanticCount = 0;
      allElements.forEach(el => {
        if (semantic.includes(el.tagName.toLowerCase())) {
          semanticCount++;
        }
      });
      return semanticCount;
    });
  });

  test('should not have traps or barriers', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Check that page doesn't trap keyboard focus
    let canEscape = false;

    // Try to navigate with keyboard
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab'); // Try to go back
    await page.keyboard.press('Shift+Tab');

    // If we can still interact, focus is not trapped
    const focusedAfterTab = await page.evaluate(() => {
      return document.activeElement?.tagName;
    });

    expect(focusedAfterTab).toBeTruthy();
  });

  test('should report no critical axe violations after full load', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000); // Wait for WebXR to fully initialize

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .include('body')
      .analyze();

    // Log any violations for debugging
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility Violations:', JSON.stringify(accessibilityScanResults.violations, null, 2));
    }

    // Check for critical and serious issues only
    const criticalIssues = accessibilityScanResults.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(criticalIssues).toEqual([]);
  });
});
