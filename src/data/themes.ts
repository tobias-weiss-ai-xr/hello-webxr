import type { Theme, ParticleConfig, WallPatternType, FloorPatternType, LightingStyleType, InfoPanelStyleType, ExperimentType, ParticleType } from '../types/index.js';
import { Color3 } from '@babylonjs/core/Maths/math.color.js';

function createParticleConfig(enabled: boolean, type: ParticleType, density: number, r: number, g: number, b: number): ParticleConfig {
  return { enabled, type, density, color: new Color3(r/255, g/255, b/255) };
}

export const THEMES: Record<string, Theme> = {
  NOBLE_GASES: {
    id: 'NOBLE_GASES',
    name: 'Noble Gases',
    baseColor: new Color3(0.2, 0.25, 0.3),
    accentColor: new Color3(0.4, 0.5, 0.6),
    wallPattern: 'smooth',
    floorPattern: 'solid',
    ambientParticles: createParticleConfig(true, 'bubbles', 0.5, 100, 130, 140),
    lightingStyle: 'cool',
    ambientSound: 'noble_gas_ambience',
    interactionSounds: ['bubble_pop', 'gas_hiss'],
    infoPanelStyle: 'minimal',
    experimentTypes: ['display', 'simulation'],
    curatedElements: ['He', 'Ne', 'Ar', 'Kr', 'Xe', 'Rn'],
  },

  ALKALI_METALS: {
    id: 'ALKALI_METALS',
    name: 'Alkali Metals',
    baseColor: new Color3(0.3, 0.2, 0.35),
    accentColor: new Color3(0.8, 0.4, 0.3),
    wallPattern: 'textured',
    floorPattern: 'grid',
    ambientParticles: createParticleConfig(true, 'sparks', 0.7, 255, 107, 107),
    lightingStyle: 'warm',
    ambientSound: 'energy_hum',
    interactionSounds: ['spark', 'reaction_hiss'],
    infoPanelStyle: 'detailed',
    experimentTypes: ['reaction', 'simulation'],
    curatedElements: ['Li', 'Na', 'K', 'Rb', 'Cs', 'Fr'],
  },

  HALOGENS: {
    id: 'HALOGENS',
    name: 'Halogens',
    baseColor: new Color3(0.35, 0.3, 0.2),
    accentColor: new Color3(0.9, 0.8, 0.1),
    wallPattern: 'geometric',
    floorPattern: 'grid',
    ambientParticles: createParticleConfig(true, 'energy', 0.6, 255, 217, 0),
    lightingStyle: 'neon',
    ambientSound: 'pressurized_gas',
    interactionSounds: ['gas_release', 'warning_alarm'],
    infoPanelStyle: 'detailed',
    experimentTypes: ['reaction', 'display'],
    curatedElements: ['F', 'Cl', 'Br', 'I', 'At'],
  },

  TRANSITION_METALS: {
    id: 'TRANSITION_METALS',
    name: 'Transition Metals',
    baseColor: new Color3(0.25, 0.25, 0.3),
    accentColor: new Color3(0.3, 0.4, 0.5),
    wallPattern: 'crystalline',
    floorPattern: 'grid',
    ambientParticles: createParticleConfig(false, 'none', 0, 0, 0, 0),
    lightingStyle: 'standard',
    ambientSound: 'metallic_resonance',
    interactionSounds: ['metal_clink', 'magnetic_hum'],
    infoPanelStyle: 'detailed',
    experimentTypes: ['simulation', 'interaction', 'display'],
    curatedElements: [],
  },

  METALLOIDS: {
    id: 'METALLOIDS',
    name: 'Metalloids',
    baseColor: new Color3(0.2, 0.25, 0.3),
    accentColor: new Color3(0.1, 0.4, 0.4),
    wallPattern: 'geometric',
    floorPattern: 'circuit',
    ambientParticles: createParticleConfig(true, 'energy', 0.2, 0, 100, 120),
    lightingStyle: 'standard',
    ambientSound: 'electronic_hum',
    interactionSounds: ['circuit_click', 'energy_flow'],
    infoPanelStyle: 'detailed',
    experimentTypes: ['simulation', 'display'],
    curatedElements: ['B', 'Si', 'Ge', 'As', 'Sb', 'Te', 'Po'],
  },

  NONMETALS: {
    id: 'NONMETALS',
    name: 'Nonmetals',
    baseColor: new Color3(0.25, 0.35, 0.3),
    accentColor: new Color3(0.3, 0.5, 0.35),
    wallPattern: 'organic',
    floorPattern: 'solid',
    ambientParticles: createParticleConfig(false, 'none', 0, 0, 0, 0),
    lightingStyle: 'standard',
    ambientSound: 'natural_ambience',
    interactionSounds: ['soft_click', 'nature_sound'],
    infoPanelStyle: 'minimal',
    experimentTypes: ['display', 'simulation'],
    curatedElements: [],
  },

  LANTHANIDES: {
    id: 'LANTHANIDES',
    name: 'Lanthanides',
    baseColor: new Color3(0.2, 0.3, 0.25),
    accentColor: new Color3(0.2, 0.6, 0.2),
    wallPattern: 'crystalline',
    floorPattern: 'crystal',
    ambientParticles: createParticleConfig(true, 'radiation', 0.3, 50, 150, 50),
    lightingStyle: 'cool',
    ambientSound: 'low_frequency_hum',
    interactionSounds: ['geiger_click', 'energy_pulse'],
    infoPanelStyle: 'detailed',
    experimentTypes: ['display', 'simulation'],
    curatedElements: [],
  },

  ACTINIDES: {
    id: 'ACTINIDES',
    name: 'Actinides',
    baseColor: new Color3(0.2, 0.3, 0.25),
    accentColor: new Color3(0.3, 0.5, 0.3),
    wallPattern: 'crystalline',
    floorPattern: 'crystal',
    ambientParticles: createParticleConfig(true, 'radiation', 0.4, 80, 180, 80),
    lightingStyle: 'cool',
    ambientSound: 'low_frequency_hum',
    interactionSounds: ['geiger_click_fast', 'energy_pulse_strong'],
    infoPanelStyle: 'detailed',
    experimentTypes: ['display', 'simulation'],
    curatedElements: [],
  },

  NOBLE_METALS: {
    id: 'NOBLE_METALS',
    name: 'Noble Metals',
    baseColor: new Color3(0.25, 0.22, 0.2),
    accentColor: new Color3(0.8, 0.65, 0.1),
    wallPattern: 'smooth',
    floorPattern: 'solid',
    ambientParticles: createParticleConfig(false, 'none', 0, 0, 0, 0),
    lightingStyle: 'standard',
    ambientSound: 'resonant_purity',
    interactionSounds: ['chime', 'coin_ring'],
    infoPanelStyle: 'interactive',
    experimentTypes: ['display', 'simulation'],
    curatedElements: ['Au', 'Ag', 'Pt', 'Pd'],
  },

  HYDROGEN_SPECIAL: {
    id: 'HYDROGEN_SPECIAL',
    name: 'Hydrogen',
    baseColor: new Color3(0.1, 0.1, 0.15),
    accentColor: new Color3(0.9, 0.7, 0.3),
    wallPattern: 'cosmic',
    floorPattern: 'cosmic',
    ambientParticles: createParticleConfig(true, 'stars', 0.8, 255, 255, 200),
    lightingStyle: 'solar',
    ambientSound: 'solar_ambience',
    interactionSounds: ['fusion_click', 'energy_burst'],
    infoPanelStyle: 'interactive',
    experimentTypes: ['simulation', 'interaction', 'display'],
    curatedElements: ['H'],
  },

  HELIUM_SPECIAL: {
    id: 'HELIUM_SPECIAL',
    name: 'Helium',
    baseColor: new Color3(0.15, 0.15, 0.2),
    accentColor: new Color3(0.8, 0.8, 0.9),
    wallPattern: 'cosmic',
    floorPattern: 'cosmic',
    ambientParticles: createParticleConfig(true, 'stars', 0.6, 255, 230, 200),
    lightingStyle: 'solar',
    ambientSound: 'solar_ambience_soft',
    interactionSounds: ['balloon_float', 'bubble_pop'],
    infoPanelStyle: 'interactive',
    experimentTypes: ['simulation', 'display'],
    curatedElements: ['He'],
  },

  ALKALINE_EARTH: {
    id: 'ALKALINE_EARTH',
    name: 'Alkaline Earth',
    baseColor: new Color3(0.25, 0.22, 0.3),
    accentColor: new Color3(0.6, 0.4, 0.5),
    wallPattern: 'textured',
    floorPattern: 'grid',
    ambientParticles: createParticleConfig(false, 'none', 0, 0, 0, 0),
    lightingStyle: 'warm',
    ambientSound: 'earth_tones',
    interactionSounds: ['soft_click', 'mineral_sound'],
    infoPanelStyle: 'detailed',
    experimentTypes: ['reaction', 'display'],
    curatedElements: ['Be', 'Mg', 'Ca', 'Sr', 'Ba', 'Ra'],
  },
};

// Get theme by element
export function getThemeByElement(elementSymbol: string): string {
  // Special elements
  if (elementSymbol === 'H') return 'HYDROGEN_SPECIAL';
  if (elementSymbol === 'He') return 'HELIUM_SPECIAL';
  if (['Au', 'Ag', 'Pt', 'Pd'].includes(elementSymbol)) return 'NOBLE_METALS';
  
  // These will be mapped from ELEMENTS data in the actual implementation
  // This is a fallback for data access
  return 'NONMETALS';
}