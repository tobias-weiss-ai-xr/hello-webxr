import * as THREE from 'three';

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
    var aliasKey = themeName && themeName.toLowerCase();
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
   * Apply theme to a Three.js scene
   * @param {THREE.Scene} scene - Three.js scene to theme
   * @param {string} themeName - Theme to apply
   * @param {Object} elementData - Optional element data for customization
   * @returns {Object} { theme, cleanup } - Applied theme and cleanup function
   */
  applyTheme(scene, themeName, elementData) {
    const theme = this.getTheme(themeName);
    var addedObjects = [];
    
    // Set scene background
    scene.background = new THREE.Color(theme.backgroundColor);
    
    // Optional: Add depth fog based on element group
    if (elementData) {
      const fogDensity = this.calculateFogDensity(elementData);
      if (fogDensity > 0) {
        scene.fog = new THREE.FogExp2(theme.backgroundColor, fogDensity);
        addedObjects.fog = true;
      }
    }
    
    // Add ambient light
    var ambientConfig = theme.lightingPreset.ambient;
    var ambientLight = new THREE.AmbientLight(
      ambientConfig.color,
      ambientConfig.intensity
    );
    scene.add(ambientLight);
    addedObjects.push(ambientLight);
    
    // Add point lights from preset
    var pointLights = theme.lightingPreset.pointLights || [];
    for (var i = 0; i < pointLights.length; i++) {
      var lightConfig = pointLights[i];
      var pointLight = new THREE.PointLight(
        lightConfig.color,
        lightConfig.intensity,
        lightConfig.distance
      );
      pointLight.position.set(
        lightConfig.position[0],
        lightConfig.position[1],
        lightConfig.position[2]
      );
      scene.add(pointLight);
      addedObjects.push(pointLight);
    }
    
    // Create themed background particles
    var particles = this.createParticles(theme, elementData);
    if (particles) {
      scene.add(particles);
      addedObjects.push(particles);
    }
    
    // Create element-specific particles
    var elementParticles = this.createElementParticles(theme, elementData);
    if (elementParticles) {
      scene.add(elementParticles);
      addedObjects.push(elementParticles);
    }
    
    console.log('[RoomThemeManager] Theme "' + theme.name + '" applied');
    if (elementData) {
      console.log('[RoomThemeManager] Element: ' + (elementData.symbol || 'unknown'));
    }
    
    // Return theme, cleanup function, and particle objects
    var self = this;
    return {
      theme: theme,
      particles: particles,
      elementParticles: elementParticles,
      cleanup: function() {
        for (var j = 0; j < addedObjects.length; j++) {
          scene.remove(addedObjects[j]);
          if (addedObjects[j].geometry) {
            addedObjects[j].geometry.dispose();
          }
          if (addedObjects[j].material) {
            addedObjects[j].material.dispose();
          }
        }
        // Dispose fog if present
        if (scene.fog) {
          scene.fog = null;
        }
        addedObjects = [];
      }
    };
  }
  
  /**
   * Create themed particles for background atmosphere
   * Performance: Reduced from 200 to 150 particles per room for VR optimization
   * @param {Object} theme - Theme configuration
   * @param {Object} elementData - Optional element data for color override
   * @returns {THREE.Points} Particle system
   */
  createParticles(theme, elementData) {
    // Performance: Reduced particle count for VR (150 instead of 200)
    var particleCount = 150;
    var geometry = new THREE.BufferGeometry();
    var positions = new Float32Array(particleCount * 3);
    
    for (var i = 0; i < particleCount; i++) {
      var i3 = i * 3;
      var radius = 3 + Math.random() * 7;
      var theta = Math.random() * Math.PI * 2;
      var y = 0.5 + Math.random() * 4;
      
      positions[i3] = Math.cos(theta) * radius;
      positions[i3 + 1] = y;
      positions[i3 + 2] = Math.sin(theta) * radius;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // Use element color if available, otherwise theme particle color
    var particleColor = theme.particleColor;
    if (elementData && elementData.color) {
      particleColor = elementData.color;
    }
    
    var material = new THREE.PointsMaterial({
      size: 0.04,
      color: particleColor,
      transparent: true,
      opacity: 0.5
    });
    
    return new THREE.Points(geometry, material);
  }
  
  /**
   * Create element-specific particle effects
   * @param {Object} theme - Theme configuration
   * @param {Object} elementData - Element data for customization
   * @returns {THREE.Points|null} Element particle system or null
   */
   createElementParticles(theme, elementData) {
     if (!elementData) return null;
     
     const elementGroup = elementData.group;
     const atomicNumber = elementData.atomicNumber;
     
     // Element-specific particle behaviors
     if (elementGroup === 'alkali' || elementGroup === 'alkalineEarth') {
       // Reactive metals: explosive, fast-moving particles
       return this.createExplosiveParticles(elementData);
     } else if (elementGroup === 'nobleGas') {
       // Noble gases: calm, floating particles
       return this.createCalmFloatingParticles(elementData);
     } else if (elementGroup === 'halogen') {
       // Halogens: swirling, gas-like particles
       return this.createGaseousParticles(elementData);
     } else if (elementGroup === 'transition') {
       // Transition metals: dense, metallic particles
       return this.createMetallicParticles(elementData);
     } else if (elementGroup === 'lanthanide' || elementGroup === 'actinide') {
       // Rare earths: mysterious, glowing particles + radioactivity
       return this.createMysticalParticles(elementData);
     } else if (elementGroup === 'nonmetal' || elementGroup === 'metalloid') {
       // Non-metals: organic, flowing particles
       return this.createOrganicParticles(elementData);
     }
     
     return null;
   }
  
   // Alkali metals: explosive particle effect
   createExplosiveParticles(elementData) {
     const particleCount = 50;
     const geometry = new THREE.BufferGeometry();
     const positions = new Float32Array(particleCount * 3);
     const velocities = [];
     
     for (let i = 0; i < particleCount; i++) {
       const i3 = i * 3;
       // Start from center outward
       const radius = Math.random() * 2;
       const theta = Math.random() * Math.PI * 2;
       
       positions[i3] = Math.cos(theta) * radius;
       positions[i3 + 1] = (Math.random() - 0.5) * 2;
       positions[i3 + 2] = Math.sin(theta) * radius;
       
       velocities.push({
         x: (Math.random() - 0.5) * 0.2,
         y: (Math.random() - 0.5) * 0.2,
         z: (Math.random() - 0.5) * 0.2
       });
     }
     
     geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
     geometry.userData.velocities = velocities;
     
     const particleColor = new THREE.Color(elementData.color);
     const material = new THREE.PointsMaterial({
       size: 0.06,
       color: particleColor,
       transparent: true,
       opacity: 0.7,
       blending: THREE.AdditiveBlending
     });
     
     const particles = new THREE.Points(geometry, material);
     return particles;
   }
  
   // Noble gases: calm floating particles
   createCalmFloatingParticles(elementData) {
     const particleCount = 80;
     const geometry = new THREE.BufferGeometry();
     const positions = new Float32Array(particleCount * 3);
     const drift = [];
     
     for (let i = 0; i < particleCount; i++) {
       const i3 = i * 3;
       const radius = 3 + Math.random() * 5;
       const theta = Math.random() * Math.PI * 2;
       const y = -2 + Math.random() * 4;
       
       positions[i3] = Math.cos(theta) * radius;
       positions[i3 + 1] = y;
       positions[i3 + 2] = Math.sin(theta) * radius;
       
       drift.push({
         x: (Math.random() - 0.5) * 0.005,
         y: (Math.random() - 0.5) * 0.002,
         z: (Math.random() - 0.5) * 0.005
       });
     }
     
     geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
     geometry.userData.drift = drift;
     
     const material = new THREE.PointsMaterial({
       size: 0.03,
       color: elementData.color,
       transparent: true,
       opacity: 0.4,
       blending: THREE.AdditiveBlending
     });
     
     const particles = new THREE.Points(geometry, material);
     return particles;
   }
  
   // Halogens: swirling gaseous particles
   createGaseousParticles(elementData) {
     const particleCount = 100;
     const geometry = new THREE.BufferGeometry();
     const positions = new Float32Array(particleCount * 3);
     const swirls = [];
     
     for (let i = 0; i < particleCount; i++) {
       const i3 = i * 3;
       const radius = 2 + Math.random() * 3;
       const theta = (i / particleCount) * Math.PI * 2;
       const y = (Math.random() - 0.5) * 3;
       const swirlAngle = (i / particleCount) * Math.PI * 4;
       
       positions[i3] = Math.cos(theta + swirlAngle) * radius;
       positions[i3 + 1] = y + Math.sin(theta * 5) * 0.5;
       positions[i3 + 2] = Math.sin(theta + swirlAngle) * radius;
       
       swirls.push({
         angle: theta,
         speed: 0.5 + Math.random() * 0.5,
         radius: radius
       });
     }
     
     geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
     geometry.userData.swirls = swirls;
     
     const material = new THREE.PointsMaterial({
       size: 0.04,
       color: elementData.color,
       transparent: true,
       opacity: 0.5,
        blending: THREE.AdditiveBlending
     });
     
     const particles = new THREE.Points(geometry, material);
     return particles;
   }
  
   // Transition metals: dense metallic particles
   createMetallicParticles(elementData) {
     const particleCount = 60;
     const geometry = new THREE.BufferGeometry();
     const positions = new Float32Array(particleCount * 3);
     
     for (let i = 0; i < particleCount; i++) {
       const i3 = i * 3;
       const radius = 2 + Math.random() * 4;
       const theta = Math.random() * Math.PI * 2;
       const y = (Math.random() - 0.5) * 2;
       
       positions[i3] = Math.cos(theta) * radius;
       positions[i3 + 1] = y;
       positions[i3 + 2] = Math.sin(theta) * radius;
     }
     
     geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
     
     const material = new THREE.PointsMaterial({
       size: 0.05,
       color: elementData.color,
       transparent: true,
       opacity: 0.6,
       metalness: 0.8,
       roughness: 0.2
     });
     
     const particles = new THREE.Points(geometry, material);
     return particles;
   }
  
   // Mystical particles for rare earths and actinides
   createMysticalParticles(elementData) {
     const particleCount = 90;
     const geometry = new THREE.BufferGeometry();
     const positions = new Float32Array(particleCount * 3);
     const pulses = [];
     
     for (let i = 0; i < particleCount; i++) {
       const i3 = i * 3;
       const radius = 1.5 + Math.random() * 3.5;
       const theta = Math.random() * Math.PI * 2;
       const phi = Math.acos(2 * Math.random() - 1);
       const r = Math.cbrt(Math.random()) * radius;
       
       const x = r * Math.sin(phi) * Math.cos(theta);
       const y = r * Math.sin(phi) * Math.sin(theta);
       const z = r * Math.cos(phi);
       
       positions[i3] = x;
       positions[i3 + 1] = y;
       positions[i3 + 2] = z;
       
       pulses.push({
         startTime: Math.random() * 10,
         duration: 2 + Math.random() * 3
       });
     }
     
     geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
     geometry.userData.pulses = pulses;
     
     const material = new THREE.PointsMaterial({
       size: 0.04,
       color: 0x88ff88,
       transparent: true,
       opacity: 0.6,
       blending: THREE.AdditiveBlending
     });
     
     const particles = new THREE.Points(geometry, material);
     return particles;
   }
  
   // Organic particles for non-metals
   createOrganicParticles(elementData) {
     const particleCount = 70;
     const geometry = new THREE.BufferGeometry();
     const positions = new Float32Array(particleCount * 3);
     const curves = [];
     
     for (let i = 0; i < particleCount; i++) {
       const i3 = i * 3;
       const curveProgress = i / particleCount;
       const radius = 2 + Math.sin(curveProgress * Math.PI * 4) * 1.5;
       const theta = curveProgress * Math.PI * 2 * 3;
       const y = Math.sin(curveProgress * Math.PI * 2) * 1.5;
       
       positions[i3] = Math.cos(theta) * radius;
       positions[i3 + 1] = y;
       positions[i3 + 2] = Math.sin(theta) * radius;
       
       curves.push({
         phase: curveProgress * Math.PI * 2,
         speed: 0.01 + Math.random() * 0.01
       });
     }
     
     geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
     geometry.userData.curves = curves;
     
     const material = new THREE.PointsMaterial({
       size: 0.045,
       color: elementData.color,
       transparent: true,
       opacity: 0.55,
       blending: THREE.NormalBlending
     });
     
     const particles = new THREE.Points(geometry, material);
     return particles;
   }

  /**
   * Calculate fog density based on element properties
   * @param {Object} elementData - Element data
   * @returns {number} Fog density value
   */
  calculateFogDensity(elementData) {
    const elementGroup = elementData.group;
    const atomicNumber = elementData.atomicNumber;
    
    // Elements with higher atomic numbers get more intense fog (atmospheric depth feel)
    let baseDensity = 0.005 + (atomicNumber * 0.0001);
    
    // Group-specific modifications
    switch (elementGroup) {
      case 'nobleGas':
        // Noble gases: thin, wispy fog
        baseDensity *= 0.5;
        break;
      case 'halogen':
        // Halogens: slightly denser
        baseDensity *= 1.5;
        break;
      case 'alkali':
      case 'alkalineEarth':
        // Reactive metals: visible reaction atmosphere
        baseDensity *= 1.8;
        break;
      case 'actinide':
      case 'lanthanide':
        // Rare/actinide elements: mysterious dark fog
        baseDensity = 0.02 + (Math.random() * 0.005);
        break;
      case 'transition':
        // Transition metals: moderate density
        baseDensity *= 1.2;
        break;
      default:
        break;
    }
    
    // Cap at reasonable maximum
    return Math.min(baseDensity, 0.05);
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
