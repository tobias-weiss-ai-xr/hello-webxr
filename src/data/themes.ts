import type {
  Theme,
  ParticleConfig,
  WallPatternType,
  FloorPatternType,
  LightingStyleType,
  InfoPanelStyleType,
  ExperimentType,
  ParticleType,
} from '../types/index.js';
import { Color3 } from '@babylonjs/core/Maths/math.color.js';

/* ──────────────────────────────────────────────────────────────
 * Theme TEMPLATING
 *
 * Every element carries a `theme` field in data/elements.ts (e.g. 'cosmic',
 * 'solar', 'nuclear', 'technology'…). Scenes are generated from a small set
 * of template parameters via `makeTheme` instead of 100+ hand-written
 * objects — that is the templating layer. Elements that share a theme
 * automatically share a scene; adding a new element scene means adding one
 * `makeTheme` entry, not touching any room code.
 *
 * The registry is keyed by the EXACT `element.theme` string so
 * `getThemeForElement` can resolve `THEMES[element.theme]` directly. Group
 * themes (NOBLE_GASES, ALKALI_METALS, …) are kept as fallbacks for any
 * element without a specific theme, and NEUTRAL is the ultimate default.
 * ────────────────────────────────────────────────────────────── */

type RGB = [number, number, number];

interface ThemeSpec {
  name: string;
  base: RGB; // room base color, 0–1
  accent: RGB; // accent / light tint, 0–1
  wall?: WallPatternType;
  floor?: FloorPatternType;
  particles?: {
    type?: ParticleType;
    density?: number;
    color?: RGB; // 0–255
    enabled?: boolean;
  };
  lighting?: LightingStyleType;
  sound?: string;
  interactions?: string[];
  infoPanel?: InfoPanelStyleType;
  experiments?: ExperimentType[];
  curated?: string[];
}

function createParticleConfig(
  enabled: boolean,
  type: ParticleType,
  density: number,
  r: number,
  g: number,
  b: number
): ParticleConfig {
  return { enabled, type, density, color: new Color3(r / 255, g / 255, b / 255) };
}

const PARTICLE_DEFAULTS: Record<string, { type: ParticleType; color: RGB }> = {
  stars: { type: 'stars', color: [210, 225, 255] },
  energy: { type: 'energy', color: [120, 200, 255] },
  sparks: { type: 'sparks', color: [255, 170, 80] },
  bubbles: { type: 'bubbles', color: [150, 200, 255] },
  radiation: { type: 'radiation', color: [120, 200, 60] },
};

function makeTheme(key: string, spec: ThemeSpec): Theme {
  const p = spec.particles ?? {};
  const ptype: ParticleType = p.type ?? PARTICLE_DEFAULTS.energy.type ?? 'energy';
  const pcolor: RGB = p.color ?? PARTICLE_DEFAULTS[ptype]?.color ?? [200, 220, 255];
  return {
    id: key.toUpperCase(),
    name: spec.name,
    baseColor: new Color3(spec.base[0], spec.base[1], spec.base[2]),
    accentColor: new Color3(spec.accent[0], spec.accent[1], spec.accent[2]),
    wallPattern: spec.wall ?? 'smooth',
    floorPattern: spec.floor ?? 'solid',
    ambientParticles: createParticleConfig(
      p.enabled ?? false,
      ptype,
      p.density ?? 0.4,
      pcolor[0],
      pcolor[1],
      pcolor[2]
    ),
    lightingStyle: spec.lighting ?? 'standard',
    ambientSound: spec.sound ?? 'ambient_hum',
    interactionSounds: spec.interactions ?? ['soft_click'],
    infoPanelStyle: spec.infoPanel ?? 'detailed',
    experimentTypes: spec.experiments ?? ['display', 'simulation'],
    curatedElements: spec.curated ?? [],
  };
}

/* ── Per-element themes (keyed by data/elements.ts `theme`) ── */
export const THEMES: Record<string, Theme> = {
  // ── H / He ──
  cosmic: makeTheme('cosmic', {
    name: 'Kosmos',
    base: [0.05, 0.07, 0.18],
    accent: [0.45, 0.7, 1.0],
    wall: 'cosmic',
    floor: 'cosmic',
    particles: { type: 'stars', density: 0.8, color: [205, 222, 255], enabled: true },
    lighting: 'cool',
    sound: 'cosmic_ambience',
    interactions: ['fusion_click', 'energy_burst'],
    infoPanel: 'interactive',
    experiments: ['simulation', 'interaction', 'display'],
    curated: ['H'],
  }),
  solar: makeTheme('solar', {
    name: 'Sonne',
    base: [0.16, 0.09, 0.03],
    accent: [1.0, 0.7, 0.25],
    wall: 'cosmic',
    floor: 'cosmic',
    particles: { type: 'energy', density: 0.6, color: [255, 200, 90], enabled: true },
    lighting: 'solar',
    sound: 'solar_ambience',
    interactions: ['fusion_click', 'energy_burst'],
    infoPanel: 'interactive',
    experiments: ['simulation', 'display'],
    curated: ['He'],
  }),

  // ── Energy & light ──
  energy: makeTheme('energy', {
    name: 'Energie',
    base: [0.04, 0.08, 0.18],
    accent: [0.3, 0.8, 1.0],
    particles: { type: 'energy', density: 0.6, color: [120, 200, 255], enabled: true },
    lighting: 'neon',
    sound: 'energy_hum',
    interactions: ['spark', 'energy_flow'],
  }),
  electric: makeTheme('electric', {
    name: 'Elektrik',
    base: [0.04, 0.07, 0.16],
    accent: [0.4, 0.9, 1.0],
    particles: { type: 'energy', density: 0.7, color: [120, 200, 255], enabled: true },
    lighting: 'neon',
    sound: 'electric_hum',
    interactions: ['spark', 'arc'],
  }),
  electronics: makeTheme('electronics', {
    name: 'Elektronik',
    base: [0.05, 0.08, 0.12],
    accent: [0.3, 0.9, 0.5],
    wall: 'geometric',
    floor: 'circuit',
    lighting: 'standard',
    sound: 'electronic_hum',
    interactions: ['circuit_click', 'energy_flow'],
  }),
  lights: makeTheme('lights', {
    name: 'Licht',
    base: [0.10, 0.10, 0.08],
    accent: [1.0, 0.88, 0.55],
    lighting: 'warm',
    sound: 'ambient_hum',
    interactions: ['soft_click'],
  }),
  light: makeTheme('light', {
    name: 'Licht',
    base: [0.10, 0.10, 0.12],
    accent: [1.0, 0.95, 0.8],
    lighting: 'warm',
    sound: 'ambient_hum',
    interactions: ['soft_click'],
  }),
  lighting: makeTheme('lighting', {
    name: 'Beleuchtung',
    base: [0.10, 0.10, 0.12],
    accent: [0.95, 0.9, 0.72],
    lighting: 'warm',
    sound: 'ambient_hum',
  }),
  fire: makeTheme('fire', {
    name: 'Feuer',
    base: [0.14, 0.05, 0.03],
    accent: [1.0, 0.5, 0.15],
    particles: { type: 'sparks', density: 0.6, color: [255, 120, 40], enabled: true },
    lighting: 'warm',
    sound: 'fire_crackle',
    interactions: ['spark', 'reaction_hiss'],
    experiments: ['reaction', 'display'],
  }),
  forge: makeTheme('forge', {
    name: 'Schmiede',
    base: [0.13, 0.06, 0.03],
    accent: [1.0, 0.55, 0.1],
    particles: { type: 'sparks', density: 0.5, color: [255, 140, 50], enabled: true },
    lighting: 'warm',
    sound: 'forge_clang',
    interactions: ['metal_clink', 'spark'],
    experiments: ['reaction', 'display'],
  }),
  welding: makeTheme('welding', {
    name: 'Schweißen',
    base: [0.06, 0.08, 0.12],
    accent: [0.7, 0.9, 1.0],
    particles: { type: 'sparks', density: 0.7, color: [200, 230, 255], enabled: true },
    lighting: 'neon',
    sound: 'weld_buzz',
    interactions: ['spark', 'arc'],
  }),
  pyrotechnics: makeTheme('pyrotechnics', {
    name: 'Pyrotechnik',
    base: [0.10, 0.06, 0.14],
    accent: [1.0, 0.6, 0.2],
    particles: { type: 'sparks', density: 0.8, color: [255, 150, 60], enabled: true },
    lighting: 'warm',
    sound: 'firework_boom',
    interactions: ['spark', 'burst'],
    experiments: ['reaction', 'display'],
  }),

  // ── Materials & earth ──
  gem: makeTheme('gem', {
    name: 'Edelstein',
    base: [0.12, 0.06, 0.16],
    accent: [0.8, 0.4, 1.0],
    wall: 'crystalline',
    floor: 'crystal',
    lighting: 'standard',
    sound: 'crystal_resonance',
    interactions: ['chime', 'energy_flow'],
  }),
  desert: makeTheme('desert', {
    name: 'Wüste',
    base: [0.18, 0.13, 0.07],
    accent: [0.9, 0.7, 0.4],
    wall: 'textured',
    floor: 'solid',
    lighting: 'warm',
    sound: 'desert_wind',
    interactions: ['soft_click'],
  }),
  volcano: makeTheme('volcano', {
    name: 'Vulkan',
    base: [0.12, 0.05, 0.04],
    accent: [1.0, 0.4, 0.1],
    particles: { type: 'sparks', density: 0.6, color: [255, 100, 40], enabled: true },
    lighting: 'warm',
    sound: 'rumble',
    interactions: ['spark', 'reaction_hiss'],
    experiments: ['reaction', 'display'],
  }),
  silicon: makeTheme('silicon', {
    name: 'Silizium',
    base: [0.10, 0.11, 0.13],
    accent: [0.5, 0.6, 0.7],
    wall: 'crystalline',
    floor: 'circuit',
    lighting: 'standard',
    sound: 'electronic_hum',
    interactions: ['circuit_click'],
  }),
  semiconductor: makeTheme('semiconductor', {
    name: 'Halbleiter',
    base: [0.06, 0.10, 0.14],
    accent: [0.3, 0.7, 0.9],
    wall: 'geometric',
    floor: 'circuit',
    lighting: 'cool',
    sound: 'electronic_hum',
    interactions: ['circuit_click', 'energy_flow'],
  }),
  industry: makeTheme('industry', {
    name: 'Industrie',
    base: [0.10, 0.11, 0.13],
    accent: [0.6, 0.7, 0.8],
    wall: 'textured',
    floor: 'grid',
    lighting: 'standard',
    sound: 'factory_ambience',
    interactions: ['metal_clink'],
    experiments: ['simulation', 'display'],
  }),
  precious: makeTheme('precious', {
    name: 'Edelmetall',
    base: [0.12, 0.10, 0.05],
    accent: [0.95, 0.8, 0.3],
    wall: 'smooth',
    floor: 'solid',
    lighting: 'warm',
    sound: 'resonant_purity',
    interactions: ['chime', 'coin_ring'],
    infoPanel: 'interactive',
    experiments: ['display', 'simulation'],
  }),
  treasure: makeTheme('treasure', {
    name: 'Schatz',
    base: [0.10, 0.09, 0.06],
    accent: [0.9, 0.75, 0.3],
    lighting: 'warm',
    sound: 'resonant_purity',
    interactions: ['chime', 'coin_ring'],
  }),
  precision: makeTheme('precision', {
    name: 'Präzision',
    base: [0.08, 0.09, 0.11],
    accent: [0.6, 0.7, 0.85],
    wall: 'smooth',
    floor: 'grid',
    lighting: 'standard',
    sound: 'ambient_hum',
    interactions: ['soft_click'],
  }),
  kitchen: makeTheme('kitchen', {
    name: 'Küche',
    base: [0.12, 0.10, 0.08],
    accent: [0.9, 0.7, 0.4],
    lighting: 'warm',
    sound: 'kitchen_ambience',
    interactions: ['soft_click'],
  }),
  security: makeTheme('security', {
    name: 'Sicherheit',
    base: [0.07, 0.09, 0.12],
    accent: [0.5, 0.65, 0.85],
    wall: 'textured',
    floor: 'grid',
    lighting: 'standard',
    sound: 'secure_hum',
    interactions: ['soft_click'],
  }),

  // ── Life & nature ──
  life: makeTheme('life', {
    name: 'Leben',
    base: [0.06, 0.14, 0.08],
    accent: [0.4, 0.9, 0.4],
    wall: 'organic',
    floor: 'solid',
    lighting: 'standard',
    sound: 'natural_ambience',
    interactions: ['soft_click', 'nature_sound'],
  }),
  biological: makeTheme('biological', {
    name: 'Biologie',
    base: [0.07, 0.13, 0.09],
    accent: [0.5, 0.85, 0.5],
    wall: 'organic',
    floor: 'solid',
    lighting: 'standard',
    sound: 'natural_ambience',
    interactions: ['soft_click'],
    experiments: ['display', 'simulation'],
  }),
  skeleton: makeTheme('skeleton', {
    name: 'Skelett',
    base: [0.10, 0.10, 0.11],
    accent: [0.92, 0.92, 0.86],
    wall: 'smooth',
    floor: 'solid',
    lighting: 'standard',
    sound: 'ambient_hum',
    interactions: ['soft_click'],
  }),
  atmosphere: makeTheme('atmosphere', {
    name: 'Atmosphäre',
    base: [0.06, 0.12, 0.20],
    accent: [0.5, 0.8, 1.0],
    particles: { type: 'bubbles', density: 0.4, color: [150, 200, 255], enabled: true },
    lighting: 'cool',
    sound: 'wind_ambience',
    interactions: ['soft_click'],
  }),
  breath: makeTheme('breath', {
    name: 'Atem',
    base: [0.05, 0.14, 0.16],
    accent: [0.4, 0.9, 0.9],
    particles: { type: 'bubbles', density: 0.4, color: [120, 220, 230], enabled: true },
    lighting: 'cool',
    sound: 'breath_ambience',
    interactions: ['soft_click'],
  }),
  swimming: makeTheme('swimming', {
    name: 'Schwimmen',
    base: [0.04, 0.10, 0.16],
    accent: [0.3, 0.7, 1.0],
    particles: { type: 'bubbles', density: 0.5, color: [120, 200, 255], enabled: true },
    lighting: 'cool',
    sound: 'water_ambience',
    interactions: ['soft_click'],
  }),
  liquid: makeTheme('liquid', {
    name: 'Flüssigkeit',
    base: [0.05, 0.10, 0.15],
    accent: [0.4, 0.75, 1.0],
    particles: { type: 'bubbles', density: 0.4, color: [120, 200, 255], enabled: true },
    lighting: 'cool',
    sound: 'liquid_ambience',
    interactions: ['soft_click'],
  }),

  // ── Space & flight ──
  space: makeTheme('space', {
    name: 'Weltraum',
    base: [0.03, 0.04, 0.12],
    accent: [0.5, 0.6, 1.0],
    wall: 'cosmic',
    floor: 'cosmic',
    particles: { type: 'stars', density: 0.8, color: [200, 210, 255], enabled: true },
    lighting: 'cool',
    sound: 'cosmic_ambience',
    interactions: ['energy_burst'],
    experiments: ['simulation', 'display'],
  }),
  aerospace: makeTheme('aerospace', {
    name: 'Luft- & Raumfahrt',
    base: [0.05, 0.08, 0.16],
    accent: [0.6, 0.8, 1.0],
    wall: 'smooth',
    floor: 'grid',
    lighting: 'cool',
    sound: 'aero_ambience',
    interactions: ['soft_click'],
    experiments: ['simulation', 'display'],
  }),

  // ── Science & knowledge ──
  science: makeTheme('science', {
    name: 'Wissenschaft',
    base: [0.06, 0.10, 0.14],
    accent: [0.5, 0.8, 0.95],
    wall: 'smooth',
    floor: 'grid',
    lighting: 'cool',
    sound: 'lab_ambience',
    interactions: ['soft_click'],
    experiments: ['display', 'simulation'],
  }),
  research: makeTheme('research', {
    name: 'Forschung',
    base: [0.07, 0.09, 0.13],
    accent: [0.4, 0.7, 0.9],
    wall: 'smooth',
    floor: 'grid',
    lighting: 'standard',
    sound: 'lab_ambience',
    interactions: ['soft_click'],
    experiments: ['display', 'simulation'],
  }),
  technology: makeTheme('technology', {
    name: 'Technologie',
    base: [0.05, 0.09, 0.15],
    accent: [0.3, 0.8, 1.0],
    wall: 'geometric',
    floor: 'circuit',
    particles: { type: 'energy', density: 0.4, color: [100, 200, 255], enabled: true },
    lighting: 'cool',
    sound: 'electronic_hum',
    interactions: ['circuit_click', 'energy_flow'],
    experiments: ['simulation', 'display'],
  }),
  discovery: makeTheme('discovery', {
    name: 'Entdeckung',
    base: [0.10, 0.09, 0.14],
    accent: [0.85, 0.7, 0.4],
    wall: 'textured',
    floor: 'solid',
    lighting: 'warm',
    sound: 'ambient_hum',
    interactions: ['soft_click'],
  }),
  history: makeTheme('history', {
    name: 'Geschichte',
    base: [0.11, 0.09, 0.07],
    accent: [0.8, 0.65, 0.4],
    wall: 'textured',
    floor: 'solid',
    lighting: 'warm',
    sound: 'ambient_hum',
    interactions: ['soft_click'],
    experiments: ['display'],
  }),
  historical: makeTheme('historical', {
    name: 'Historisch',
    base: [0.11, 0.09, 0.07],
    accent: [0.85, 0.7, 0.45],
    wall: 'textured',
    floor: 'solid',
    lighting: 'warm',
    sound: 'ambient_hum',
    interactions: ['soft_click'],
    experiments: ['display'],
  }),
  theoretical: makeTheme('theoretical', {
    name: 'Theoretisch',
    base: [0.08, 0.06, 0.14],
    accent: [0.7, 0.5, 1.0],
    wall: 'geometric',
    floor: 'grid',
    lighting: 'standard',
    sound: 'ambient_hum',
    interactions: ['soft_click'],
    experiments: ['simulation'],
  }),

  // ── Reactive / hazardous ──
  toxic: makeTheme('toxic', {
    name: 'Gift',
    base: [0.10, 0.14, 0.05],
    accent: [0.7, 0.9, 0.2],
    lighting: 'standard',
    sound: 'hazard_hiss',
    interactions: ['warning_alarm', 'soft_click'],
    experiments: ['display'],
  }),
  radiation: makeTheme('radiation', {
    name: 'Strahlung',
    base: [0.10, 0.12, 0.05],
    accent: [0.7, 0.9, 0.2],
    particles: { type: 'radiation', density: 0.4, color: [120, 200, 60], enabled: true },
    lighting: 'cool',
    sound: 'geiger_click',
    interactions: ['geiger_click', 'energy_pulse'],
    experiments: ['display', 'simulation'],
  }),
  nuclear: makeTheme('nuclear', {
    name: 'Kern',
    base: [0.08, 0.12, 0.06],
    accent: [0.6, 0.9, 0.3],
    particles: { type: 'radiation', density: 0.5, color: [120, 200, 60], enabled: true },
    lighting: 'cool',
    sound: 'low_frequency_hum',
    interactions: ['geiger_click', 'energy_pulse'],
    experiments: ['display', 'simulation'],
  }),
  medical: makeTheme('medical', {
    name: 'Medizin',
    base: [0.05, 0.12, 0.12],
    accent: [0.5, 0.9, 0.85],
    wall: 'smooth',
    floor: 'solid',
    lighting: 'cool',
    sound: 'clinical_ambience',
    interactions: ['soft_click'],
    experiments: ['display', 'simulation'],
  }),
  protection: makeTheme('protection', {
    name: 'Schutz',
    base: [0.07, 0.10, 0.16],
    accent: [0.5, 0.7, 0.95],
    wall: 'textured',
    floor: 'grid',
    lighting: 'standard',
    sound: 'secure_hum',
    interactions: ['soft_click'],
  }),

  /* ── Group themes — FALLBACKS when an element has no specific `theme` ── */
  NOBLE_GASES: makeTheme('NOBLE_GASES', {
    name: 'Edelgase',
    base: [0.2, 0.25, 0.3],
    accent: [0.4, 0.5, 0.6],
    particles: { type: 'bubbles', density: 0.5, color: [100, 130, 140], enabled: true },
    lighting: 'cool',
    sound: 'noble_gas_ambience',
    interactions: ['bubble_pop', 'gas_hiss'],
    experiments: ['display', 'simulation'],
    curated: ['He', 'Ne', 'Ar', 'Kr', 'Xe', 'Rn'],
  }),
  ALKALI_METALS: makeTheme('ALKALI_METALS', {
    name: 'Alkalimetalle',
    base: [0.3, 0.2, 0.35],
    accent: [0.8, 0.4, 0.3],
    particles: { type: 'sparks', density: 0.7, color: [255, 107, 107], enabled: true },
    lighting: 'warm',
    sound: 'energy_hum',
    interactions: ['spark', 'reaction_hiss'],
    experiments: ['reaction', 'simulation'],
    curated: ['Li', 'Na', 'K', 'Rb', 'Cs', 'Fr'],
  }),
  HALOGENS: makeTheme('HALOGENS', {
    name: 'Halogene',
    base: [0.35, 0.3, 0.2],
    accent: [0.9, 0.8, 0.1],
    wall: 'geometric',
    floor: 'grid',
    particles: { type: 'energy', density: 0.6, color: [255, 217, 0], enabled: true },
    lighting: 'neon',
    sound: 'pressurized_gas',
    interactions: ['gas_release', 'warning_alarm'],
    experiments: ['reaction', 'display'],
    curated: ['F', 'Cl', 'Br', 'I', 'At'],
  }),
  TRANSITION_METALS: makeTheme('TRANSITION_METALS', {
    name: 'Übergangsmetalle',
    base: [0.25, 0.25, 0.3],
    accent: [0.3, 0.4, 0.5],
    wall: 'crystalline',
    floor: 'grid',
    lighting: 'standard',
    sound: 'metallic_resonance',
    interactions: ['metal_clink', 'magnetic_hum'],
    experiments: ['simulation', 'interaction', 'display'],
  }),
  METALLOIDS: makeTheme('METALLOIDS', {
    name: 'Metalloide',
    base: [0.2, 0.25, 0.3],
    accent: [0.1, 0.4, 0.4],
    wall: 'geometric',
    floor: 'circuit',
    particles: { type: 'energy', density: 0.2, color: [0, 100, 120], enabled: true },
    lighting: 'standard',
    sound: 'electronic_hum',
    interactions: ['circuit_click', 'energy_flow'],
    experiments: ['simulation', 'display'],
    curated: ['B', 'Si', 'Ge', 'As', 'Sb', 'Te', 'Po'],
  }),
  NONMETALS: makeTheme('NONMETALS', {
    name: 'Nichtmetalle',
    base: [0.25, 0.35, 0.3],
    accent: [0.3, 0.5, 0.35],
    wall: 'organic',
    floor: 'solid',
    lighting: 'standard',
    sound: 'natural_ambience',
    interactions: ['soft_click', 'nature_sound'],
    experiments: ['display', 'simulation'],
  }),
  LANTHANIDES: makeTheme('LANTHANIDES', {
    name: 'Lanthanoide',
    base: [0.2, 0.3, 0.25],
    accent: [0.2, 0.6, 0.2],
    wall: 'crystalline',
    floor: 'crystal',
    particles: { type: 'radiation', density: 0.3, color: [50, 150, 50], enabled: true },
    lighting: 'cool',
    sound: 'low_frequency_hum',
    interactions: ['geiger_click', 'energy_pulse'],
    experiments: ['display', 'simulation'],
  }),
  ACTINIDES: makeTheme('ACTINIDES', {
    name: 'Actinoide',
    base: [0.2, 0.3, 0.25],
    accent: [0.3, 0.5, 0.3],
    wall: 'crystalline',
    floor: 'crystal',
    particles: { type: 'radiation', density: 0.4, color: [80, 180, 80], enabled: true },
    lighting: 'cool',
    sound: 'low_frequency_hum',
    interactions: ['geiger_click_fast', 'energy_pulse_strong'],
    experiments: ['display', 'simulation'],
  }),
  NOBLE_METALS: makeTheme('NOBLE_METALS', {
    name: 'Edelmetalle',
    base: [0.25, 0.22, 0.2],
    accent: [0.8, 0.65, 0.1],
    wall: 'smooth',
    floor: 'solid',
    lighting: 'standard',
    sound: 'resonant_purity',
    interactions: ['chime', 'coin_ring'],
    infoPanel: 'interactive',
    experiments: ['display', 'simulation'],
    curated: ['Au', 'Ag', 'Pt', 'Pd'],
  }),
  ALKALINE_EARTH: makeTheme('ALKALINE_EARTH', {
    name: 'Erdalkalimetalle',
    base: [0.25, 0.22, 0.3],
    accent: [0.6, 0.4, 0.5],
    wall: 'textured',
    floor: 'grid',
    lighting: 'warm',
    sound: 'earth_tones',
    interactions: ['soft_click', 'mineral_sound'],
    experiments: ['reaction', 'display'],
    curated: ['Be', 'Mg', 'Ca', 'Sr', 'Ba', 'Ra'],
  }),
  METAL: makeTheme('METAL', {
    name: 'Metalle',
    base: [0.22, 0.24, 0.27],
    accent: [0.45, 0.5, 0.55],
    wall: 'smooth',
    floor: 'grid',
    lighting: 'standard',
    sound: 'metallic_resonance',
    interactions: ['metal_clink'],
    experiments: ['simulation', 'display'],
  }),

  /* ── Ultimate default ── */
  NEUTRAL: makeTheme('NEUTRAL', {
    name: 'Neutral',
    base: [0.15, 0.17, 0.20],
    accent: [0.4, 0.45, 0.55],
    wall: 'smooth',
    floor: 'solid',
    lighting: 'standard',
    sound: 'ambient_hum',
    interactions: ['soft_click'],
    experiments: ['display', 'simulation'],
  }),
};

// Resolve a theme for an element.
// 1) Specific per-element scene from data/elements.ts `theme` field.
// 2) Group-based fallback (covers elements without a specific theme).
// 3) NEUTRAL default.
export function getThemeByElement(elementSymbol: string, themeField?: string): Theme {
  if (themeField && THEMES[themeField]) return THEMES[themeField];
  // Group-based fallbacks (kept for elements without a `theme` value).
  switch (elementSymbol) {
    case 'H':
      return THEMES.cosmic;
    case 'He':
      return THEMES.solar;
    case 'Au':
    case 'Ag':
    case 'Pt':
    case 'Pd':
      return THEMES.NOBLE_METALS;
  }
  return THEMES.NEUTRAL;
}

export default THEMES;
