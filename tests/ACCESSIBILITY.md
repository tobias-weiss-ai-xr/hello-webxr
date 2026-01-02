# Accessibility Tests

This directory contains automated accessibility tests for the Arachnophobia WebXR experience using [axe-core](https://www.deque.com/axe/) and [Playwright](https://playwright.dev/).

## Running Tests Locally

### Run all accessibility tests:
```bash
npm run test:a11y
```

### Run accessibility tests in headed mode (with browser window):
```bash
npm run test:a11y:headed
```

### Run with Playwright UI:
```bash
npm run test:ui tests/accessibility.spec.ts
```

## Test Coverage

The accessibility test suite (`accessibility.spec.ts`) covers the following areas:

### 1. **Automated Accessibility Scans**
- Full page scans using axe-core
- WCAG 2.1 AA compliance checks
- Identifies common accessibility issues

### 2. **Header Accessibility**
- Proper heading structure (h1)
- Color contrast verification (black background, white text)
- Semantic HTML structure

### 3. **Loading Screen**
- Readable loading text
- Visual accessibility
- ARIA attributes (when applicable)

### 4. **Control Links**
- Accessible controller selection links
- Discernible link text
- Keyboard accessibility
- Proper href attributes

### 5. **Canvas Element**
- WebGL canvas fallback content
- ARIA labels for screen readers
- Alternative text considerations

### 6. **Page Structure**
- Single h1 per page
- Proper heading hierarchy
- Semantic HTML elements

### 7. **Meta Tags**
- Viewport configuration (responsive design)
- Page title
- Language attribute

### 8. **Keyboard Navigation**
- Tab key navigation
- Focusable elements identification
- Focus management

### 9. **Image Accessibility**
- Alt text for images
- Icon accessibility (using emoji/text)

### 10. **Color Contrast**
- Header contrast (WCAG AAA compliant)
- Help overlay contrast
- Link text visibility

### 11. **Focus Management**
- Focus indicator visibility
- No keyboard traps
- Proper focus order

### 12. **Semantic HTML**
- Use of semantic elements over divs
- Landmark regions
- Proper document structure

### 13. **Critical Violations**
- No critical or serious accessibility issues
- Full WCAG 2.2 AA compliance
- axe-core comprehensive scan

## WCAG Compliance Levels

The tests verify compliance against:
- **WCAG 2.0 Level A** (wcag2a)
- **WCAG 2.0 Level AA** (wcag2aa)
- **WCAG 2.1 Level AA** (wcag21aa)
- **WCAG 2.2 Level AA** (wcag22aa)

## CI/CD Integration

Accessibility tests run automatically in GitHub Actions on:
- Push to `spider-room-only` branch
- Pull requests to `spider-room-only` branch
- Manual workflow dispatch

Test results are uploaded as artifacts for 7 days.

## Known Limitations

### WebXR-Specific Considerations:

1. **Canvas Element**: WebXR applications rely heavily on WebGL canvas, which presents accessibility challenges. The tests document the current state and recommend improvements.

2. **3D Content Accessibility**: Automated tools cannot fully test 3D VR content accessibility. Manual testing with VR headsets and screen readers is recommended.

3. **Dynamic Content**: The loading screen is removed from DOM when content loads (good practice), but this is difficult to test automatically.

### Recommended Improvements:

1. Add `lang="en"` attribute to `<html>` tag
2. Add `aria-label` to the canvas element
3. Consider adding a skip-to-content link
4. Add landmark regions (`<main>`, `<nav>`)
5. Provide alternative content for VR-only features

## Debugging Failed Tests

When a test fails:

1. **View Screenshots**: Check `test-results/` directory for screenshots
2. **View Trace**: Playwright creates trace files in `playwright-report/`
3. **Run Headed**: Use `npm run test:a11y:headed` to see the browser
4. **Check Logs**: Console logs are included in test output

## Resources

- [WCAG 2.2 Quick Reference](https://www.w3.org/WAI/WCAG22/quickref/)
- [axe-core Documentation](https://www.deque.com/axe/)
- [Playwright Accessibility](https://playwright.dev/docs/accessibility-testing)
- [WebXR Accessibility](https://www.w3.org/TR/webxr/#accessibility)

## Contributing

When adding new features, please ensure:
1. Run accessibility tests before committing
2. Fix any critical or serious violations
3. Document any minor violations with comments
4. Test with keyboard navigation
5. Test with screen reader software (optional)

## License

MIT
