/**
 * RoomThemeManager - Centralized theme registry for VR rooms
 * Maps element themes to visual configurations
 */

// Default theme configuration
const DEFAULT_THEME = {
  name: 'default',
  backgroundColor: 0x0a0a14,
  particleColor: 0x4444ff,
  lightingPreset: {
    ambient: { color: 0x404060, intensity: 0.4 },
    pointLights: [
      { position: [0, 5, 0], color: 0xffffff, intensity: 0.8, distance: 20 }
    ]
  },
  floorColor: 0x1a1a2e,
  ambientSound: null
};

// Theme registry with 8 primary slots
const themeRegistry = {
  cosmic: {
    name: 'cosmic',
    backgroundColor: 0x050510,
    particleColor: 0x8844ff,
    lightingPreset: {
      ambient: { color: 0x1a0a2e, intensity: 0.3 },
      pointLights: [
        { position: [0, 5, 0], color: 0x8844ff, intensity: 0.6, distance: 25 },
        { position: [-5, 3, -5], color: 0x4488ff, intensity: 0.4, distance: 15 }
      ]
    },
    floorColor: 0x0a0a20,
    ambientSound: 'cosmic_ambient'
  },

  energy: {
    name: 'energy',
    backgroundColor: 0x0f1a0a,
    particleColor: 0x44ff44,
    lightingPreset: {
      ambient: { color: 0x102010, intensity: 0.4 },
      pointLights: [
        { position: [0, 5, 0], color: 0x44ff44, intensity: 0.7, distance: 20 },
        { position: [3, 2, 3], color: 0x88ff88, intensity: 0.3, distance: 12 }
      ]
    },
    floorColor: 0x0a1a0a,
    ambientSound: 'energy_ambient'
  },

  life: {
    name: 'life',
    backgroundColor: 0x0a0f0a,
    particleColor: 0x44ff88,
    lightingPreset: {
      ambient: { color: 0x102810, intensity: 0.5 },
      pointLights: [
        { position: [0, 4, 0], color: 0x44ff88, intensity: 0.6, distance: 18 },
        { position: [-4, 2, 4], color: 0x88ffaa, intensity: 0.4, distance: 15 }
      ]
    },
    floorColor: 0x0a1a0f,
    ambientSound: 'life_ambient'
  },

  forge: {
    name: 'forge',
    backgroundColor: 0x140808,
    particleColor: 0xff6622,
    lightingPreset: {
      ambient: { color: 0x201010, intensity: 0.3 },
      pointLights: [
        { position: [0, 3, 0], color: 0xff4422, intensity: 0.9, distance: 15 },
        { position: [2, 1, 2], color: 0xff8800, intensity: 0.5, distance: 10 }
      ]
    },
    floorColor: 0x1a0a0a,
    ambientSound: 'forge_ambient'
  },

  electric: {
    name: 'electric',
    backgroundColor: 0x080818,
    particleColor: 0x00ccff,
    lightingPreset: {
      ambient: { color: 0x081828, intensity: 0.35 },
      pointLights: [
        { position: [0, 5, 0], color: 0x00ddff, intensity: 0.8, distance: 22 },
        { position: [4, 3, -4], color: 0x44aaff, intensity: 0.5, distance: 18 }
      ]
    },
    floorColor: 0x0a0a1a,
    ambientSound: 'electric_ambient'
  },

  treasure: {
    name: 'treasure',
    backgroundColor: 0x12100a,
    particleColor: 0xffdd44,
    lightingPreset: {
      ambient: { color: 0x201810, intensity: 0.4 },
      pointLights: [
        { position: [0, 4, 0], color: 0xffcc00, intensity: 0.7, distance: 20 },
        { position: [-3, 2, 3], color: 0xffee88, intensity: 0.4, distance: 14 }
      ]
    },
    floorColor: 0x1a1810,
    ambientSound: 'treasure_ambient'
  },

  nuclear: {
    name: 'nuclear',
    backgroundColor: 0x0a140a,
    particleColor: 0x44ff44,
    lightingPreset: {
      ambient: { color: 0x102010, intensity: 0.25 },
      pointLights: [
        { position: [0, 5, 0], color: 0x22ff22, intensity: 0.9, distance: 25 }
      ]
    },
    floorColor: 0x0f1a0f,
    ambientSound: 'nuclear_ambient'
  },

  default: DEFAULT_THEME
};

// Theme alias mappings - maps element-specific themes to primary slots
const themeAliases = {
  solar: 'cosmic',
  space: 'cosmic',
  aerospace: 'cosmic',
  atmosphere: 'cosmic',
  desert: 'cosmic',
  
  battery: 'energy',
  technology: 'energy',
  industry: 'forge',
  fire: 'forge',
  volcano: 'forge',
  welding: 'forge',
  pyrotechnics: 'forge',
  
  biological: 'life',
  breath: 'life',
  medical: 'life',
  skeleton: 'life',
  swimming: 'life',
  
  electronics: 'electric',
  semiconductor: 'electric',
  silicon: 'electric',
  lights: 'electric',
  lighting: 'electric',
  light: 'electric',
  
  gem: 'treasure',
  precious: 'treasure',
  protection: 'treasure',
  security: 'treasure',
  
  radiation: 'nuclear',
  toxic: 'nuclear',
  
  discovery: 'default',
  historical: 'default',
  history: 'default',
  kitchen: 'default',
  liquid: 'default',
  precision: 'default',
  research: 'default',
  science: 'default',
  theoretical: 'default'
};

/**
 * RoomThemeManager class
 * Provides theme configuration for VR rooms
 */
class RoomThemeManager {
  constructor() {
    this.registry = { ...themeRegistry };
    this.aliases = { ...themeAliases };
  }

  /**
   * Get theme configuration by name
   * @param {string} themeName - Theme name to look up
   * @returns {Object} Theme configuration object
   */
  getTheme(themeName) {
    // Check if theme exists directly
    if (this.registry[themeName]) {
      return { ...this.registry[themeName] };
    }

    // Check aliases
    const aliasKey = themeName?.toLowerCase();
    if (this.aliases[aliasKey]) {
      const primaryTheme = this.registry[this.aliases[aliasKey]];
      return { 
        ...primaryTheme,
        aliasedFrom: themeName 
      };
    }

    // Fallback to default
    return { ...DEFAULT_THEME };
  }

  /**
   * Apply theme to a Three.js scene (placeholder implementation)
   * @param {THREE.Scene} scene - Three.js scene to theme
   * @param {string} themeName - Theme to apply
   * @param {Object} elementData - Optional element data for customization
   * @returns {Object} Applied theme configuration
   */
  applyTheme(scene, themeName, elementData = null) {
    const theme = this.getTheme(themeName);
    
    // Placeholder - actual implementation in Wave 3
    // Will set background, lights, particles, floor
    console.log(`[RoomThemeManager] Theme "${theme.name}" applied (placeholder)`);
    
    if (elementData) {
      console.log(`[RoomThemeManager] Element: ${elementData.symbol || 'unknown'}`);
    }
    
    return theme;
  }

  /**
   * Register a custom theme
   * @param {string} name - Theme name
   * @param {Object} config - Theme configuration
   * @returns {boolean} Success status
   */
  registerTheme(name, config) {
    if (!name || typeof name !== 'string') {
      console.warn('[RoomThemeManager] Invalid theme name');
      return false;
    }

    // Validate required properties
    const requiredProps = ['backgroundColor', 'particleColor', 'lightingPreset', 'floorColor'];
    const hasRequired = requiredProps.every(prop => prop in config);
    
    if (!hasRequired) {
      console.warn('[RoomThemeManager] Theme missing required properties:', requiredProps);
      return false;
    }

    this.registry[name.toLowerCase()] = {
      name: name.toLowerCase(),
      ...config
    };

    console.log(`[RoomThemeManager] Registered theme: ${name}`);
    return true;
  }

  /**
   * Register a theme alias
   * @param {string} alias - Alias name
   * @param {string} primaryTheme - Primary theme to map to
   * @returns {boolean} Success status
   */
  registerAlias(alias, primaryTheme) {
    if (!alias || !primaryTheme) {
      return false;
    }

    this.aliases[alias.toLowerCase()] = primaryTheme.toLowerCase();
    return true;
  }

  /**
   * Get all available theme names
   * @returns {string[]} Array of theme names
   */
  getAvailableThemes() {
    return Object.keys(this.registry);
  }

  /**
   * Get all registered aliases
   * @returns {Object} Alias to theme mapping
   */
  getAliases() {
    return { ...this.aliases };
  }
}

// Export singleton instance
const roomThemeManager = new RoomThemeManager();

export default roomThemeManager;
export { RoomThemeManager, themeRegistry, themeAliases, DEFAULT_THEME };
