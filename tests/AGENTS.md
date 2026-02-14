# tests - Playwright E2E Tests

End-to-end tests for VR interaction and room navigation.

---

## WHERE TO LOOK
| Task | Location |
|------|----------|
| Navigation tests | `tests/*.spec.ts` |
| Accessibility tests | `tests/accessibility.spec.ts` |
| Test runner | `npm test` / `npx playwright` |
| Test UI | `npm run test:ui` |

---

## TEST PATTERNS

Tests inspect `window.context` for runtime state:

```javascript
test('navigate to room', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Inspect context
  const room = await page.evaluate(() => window.context.room);
  expect(room).toBeDefined();

  // Trigger navigation
  await page.evaluate(() => window.context.goto = 1);
  await page.waitForLoadState('networkidle');

  const newRoom = await page.evaluate(() => window.context.room);
  expect(newRoom).toBe(1);
});
```

---

## CONVENTIONS

- Test files: `*.spec.ts` (Playwright TypeScript convention)
- Network idle: Always wait after navigation (`page.waitForLoadState('networkidle')`)
- Screenshots: Auto-captured in `test-results/` on failure

---

## RUNNING TESTS

```bash
# All tests
npm test

# Single file
npx playwright test tests/navigation.spec.ts

# Specific test
npx playwright test -g "test name"

# UI mode
npm run test:ui

# Headed mode (debug)
npm run test:headed

# Accessibility tests
npm run test:a11y
npm run test:a11y:headed
```

---

## NOTES

- VR headless mode: Use `npm test` (default)
- VR headed mode: Use `npm run test:headed` for debugging
- Accessibility support: Includes `@axe-core/playwright` for a11y tests