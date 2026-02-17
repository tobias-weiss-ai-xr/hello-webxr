/**
 * Example test to verify Vitest configuration
 * Tests for experiment modules will be added alongside source files
 */

describe('Vitest Configuration', () => {
  it('should run basic assertions', () => {
    expect(1 + 1).toBe(2);
  });

  it('should have jsdom environment available', () => {
    expect(typeof window).toBe('object');
  });
});
