import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

/**
 * I18nManager - Singleton for internationalization
 * Handles locale detection and translation lookup
 */
class I18nManager {
  constructor() {
    this.initialized = false;
  }

  /**
   * Initialize i18next with browser language detection
   * @returns {Promise<void>}
   */
  async init() {
    if (this.initialized) {
      return;
    }

    await i18next.use(LanguageDetector).init({
      fallbackLng: 'en',
      debug: false,
      resources: {}, // Will be populated by Task 5
      interpolation: {
        escapeValue: false
      },
      detection: {
        order: ['navigator', 'htmlTag', 'localStorage'],
        caches: ['localStorage']
      }
    });

    this.initialized = true;
  }

  /**
   * Get translated string for key
   * @param {string} key - Translation key
   * @param {object} options - Optional interpolation options
   * @returns {string} Translated string (or key if not found)
   */
  t(key, options = {}) {
    // Return key if not initialized (defensive fallback)
    if (!i18next.isInitialized) {
      console.warn('[I18nManager] t() called before init() - returning key:', key);
      return key;
    }
    return i18next.t(key, options);
  }

  /**
   * Get current language code
   * @returns {string} Language code (e.g., 'en', 'de')
   */
  getLanguage() {
    return i18next.language || 'en';
  }

  /**
   * Check if i18n has been initialized
   * @returns {boolean}
   */
  isInitialized() {
    return this.initialized;
  }
}

// Export singleton instance
export const i18nManager = new I18nManager();
export default i18nManager;
