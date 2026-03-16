// Periodic Table Element Data
// PSE in VR - Virtuelles Periodensystem

// Element Group Colors
export const GROUP_COLORS = {
  alkali: 0xFF6B6B,           // Alkalimetalle
  alkalineEarth: 0xFFA94D,    // Erdalkalimetalle
  transition: 0x74B9FF,       // Übergangsmetalle
  lanthanide: 0xD63384,       // Lanthanoide
  actinide: 0x4A69BD,         // Actinoide
  metal: 0x20C997,             // Metalle (13-16)
  metalloid: 0x17A2B8,          // Metalloide
  nonmetal: 0xFFC107,           // Nichtmetalle
  halogen: 0x00D9FF,           // Halogene
  nobleGas: 0xFFFFFF            // Edelgase (use specific gas colors)
};

// Noble gas discharge colors
export const NOBLE_GAS_COLORS = {
  He: 0xFFE4E1,  // Helium - pale pink/white
  Ne: 0xFF6B00,  // Neon - orange-red
  Ar: 0x7B68EE,  // Argon - purple
  Kr: 0x00CED1,  // Krypton - cyan
  Xe: 0x4169E1,  // Xenon - blue
  Rn: 0xE0FFFF   // Radon - light blue
};

// Element definitions (partial for MVP - Phase 1)
export const ELEMENTS = [
  // Hydrogen
  {
    symbol: 'H',
    name: 'Wasserstoff',
    atomicNumber: 1,
    mass: 1.008,
    group: 'nonmetal',
    period: 1,
    block: 's',
    groupNumber: 1,
    color: 0xFFC107,
    description: 'Das häufigste Element im Universum. Bildet 75% der Masse der Sonne.',
    theme: 'cosmic',
    experiments: ['knallgas', 'fusion', 'fuelcell', 'waterformation', 'organicbond'],
    electronConfiguration: [1]
  },

  // Helium
  {
    symbol: 'He',
    name: 'Helium',
    atomicNumber: 2,
    mass: 4.003,
    group: 'nobleGas',
    period: 1,
    block: 's',
    groupNumber: 18,
    color: NOBLE_GAS_COLORS.He,
    description: 'Das zweithäufigste Element im Universum. Wurde zuerst im Sonnenspektrum entdeckt.',
    theme: 'solar',
    experiments: ['superfluid', 'voiceshift', 'balloonlift', 'cryogenic', 'spectroscopy'],
    electronConfiguration: [2]
  },

  // Lithium
  {
    symbol: 'Li',
    name: 'Lithium',
    atomicNumber: 3,
    mass: 6.941,
    group: 'alkali',
    period: 2,
    block: 's',
    groupNumber: 1,
    color: GROUP_COLORS.alkali,
    description: 'Das leichteste Metall. Wichtiger Bestandteil von Lithium-Ionen-Batterien.',
    theme: 'energy',
    experiments: ['waterReaction', 'battery', 'thermalexpansion', 'rockweathering', 'neuropsychology'],
    electronConfiguration: [2, 1]
  },

  // Beryllium
  {
    symbol: 'Be',
    name: 'Beryllium',
    atomicNumber: 4,
    mass: 9.012,
    group: 'alkalineEarth',
    period: 2,
    block: 's',
    groupNumber: 2,
    color: GROUP_COLORS.alkalineEarth,
    description: 'Hochgiftiges Metall mit niedriger Dichte. Verwendet in der Weltraumtechnik.',
    theme: 'gem',
    experiments: ['crystal', 'toxicity'],
    electronConfiguration: [2, 2]
  },

  // Bor
  {
    symbol: 'B',
    name: 'Bor',
    atomicNumber: 5,
    mass: 10.81,
    group: 'metalloid',
    period: 2,
    block: 'p',
    groupNumber: 13,
    color: GROUP_COLORS.metalloid,
    description: 'Hartes Material für Glasfasern. Kommt in Wüstensalzen vor.',
    theme: 'desert',
    experiments: ['borax', 'fiberglass'],
    electronConfiguration: [2, 3]
  },

  // Carbon
  {
    symbol: 'C',
    name: 'Kohlenstoff',
    atomicNumber: 6,
    mass: 12.011,
    group: 'nonmetal',
    period: 2,
    block: 'p',
    groupNumber: 14,
    color: 0xFFC107,
    description: 'Das Element des Lebens. Grundbaustein aller organischen Verbindungen.',
    theme: 'life',
    experiments: ['diamond', 'graphite', 'dna', 'carbonation', 'coalformation', 'graphene', 'fullerene'],
    electronConfiguration: [2, 4]
  },

  // Nitrogen
  {
    symbol: 'N',
    name: 'Stickstoff',
    atomicNumber: 7,
    mass: 14.007,
    group: 'nonmetal',
    period: 2,
    block: 'p',
    groupNumber: 15,
    color: 0xFFC107,
    description: 'Macht 78% der Atmosphäre aus. Essentiell für Proteine und DNA.',
    theme: 'atmosphere',
    experiments: ['liquid', 'haberbosch', 'fertilizer', 'explosives', 'n2o', 'ammonia'],
    electronConfiguration: [2, 5]
  },

  // Oxygen
  {
    symbol: 'O',
    name: 'Sauerstoff',
    atomicNumber: 8,
    mass: 15.999,
    group: 'nonmetal',
    period: 2,
    block: 'p',
    groupNumber: 16,
    color: 0xFFC107,
    description: 'Zweithäufigstes Element im Universum. Notwendig für Atmung und Verbrennung.',
    theme: 'breath',
    experiments: ['combustion', 'ozone', 'photosynthesis', 'hypoxia', 'oxidation', 'peroxide'],
    electronConfiguration: [2, 6]
  },

  // Fluorine
  {
    symbol: 'F',
    name: 'Fluor',
    atomicNumber: 9,
    mass: 18.998,
    group: 'halogen',
    period: 2,
    block: 'p',
    groupNumber: 17,
    color: GROUP_COLORS.halogen,
    description: 'Reaktivstes aller Elemente. Wird in Teflon und Zahncreme verwendet.',
    theme: 'protection',
    experiments: ['reaction', 'teflon', 'dental', 'uranium', 'cryogenic', 'plasma'],
    electronConfiguration: [2, 7]
  },

  // Neon
  {
    symbol: 'Ne',
    name: 'Neon',
    atomicNumber: 10,
    mass: 20.180,
    group: 'nobleGas',
    period: 2,
    block: 'p',
    groupNumber: 18,
    color: NOBLE_GAS_COLORS.Ne,
    description: 'Leuchtet bei elektrischer Entladung orange-rot. Symbol der Stadtbeleuchtung.',
    theme: 'lights',
    experiments: ['neon', 'laser', 'ionthruster', 'cryogenic', 'coolant', 'spectroscopy'],
    electronConfiguration: [2, 8]
  },

  // Sodium
  {
    symbol: 'Na',
    name: 'Natrium',
    atomicNumber: 11,
    mass: 22.990,
    group: 'alkali',
    period: 3,
    block: 's',
    groupNumber: 1,
    color: GROUP_COLORS.alkali,
    description: 'Silberglänzendes Metall, butterweich. Basis für Speisesalz (NaCl).',
    theme: 'kitchen',
    experiments: ['water', 'flame', 'saltcrystal', 'neuralsignals', 'oilrefining', 'heattransfer'],
    electronConfiguration: [2, 8, 1]
  },

  // Magnesium
  {
    symbol: 'Mg',
    name: 'Magnesium',
    atomicNumber: 12,
    mass: 24.305,
    group: 'alkalineEarth',
    period: 3,
    block: 's',
    groupNumber: 2,
    color: GROUP_COLORS.alkalineEarth,
    description: 'Blendend weißes Licht beim Verbrennen. Kommt in Chlorophyll vor.',
    theme: 'light',
    experiments: ['flash', 'chlorophyll', 'alloy', 'antacid', 'airbag', 'photosynthesis'],
    electronConfiguration: [2, 8, 2]
  },

  // Aluminum
  {
    symbol: 'Al',
    name: 'Aluminium',
    atomicNumber: 13,
    mass: 26.982,
    group: 'metal',
    period: 3,
    block: 'p',
    groupNumber: 13,
    color: GROUP_COLORS.metal,
    description: 'Das häufigste Metall der Erdkruste. Leicht und korrosionsbeständig.',
    theme: 'industry',
    experiments: ['hallheroult', 'thermit', 'foil', 'aircraft', 'cans', 'anodizing'],
    electronConfiguration: [2, 8, 3]
  },

  // Silicon
  {
    symbol: 'Si',
    name: 'Silizium',
    atomicNumber: 14,
    mass: 28.086,
    group: 'metalloid',
    period: 3,
    block: 'p',
    groupNumber: 14,
    color: GROUP_COLORS.metalloid,
    description: 'Zweithäufigstes Element der Erdkruste. Basis aller modernen Elektronik.',
    theme: 'silicon',
    experiments: ['transistor', 'solar', 'sand', 'chipmanufacturing', 'silicone', 'semiconductor', 'photoetching'],
    electronConfiguration: [2, 8, 4]
  },

  // Phosphorus
  {
    symbol: 'P',
    name: 'Phosphor',
    atomicNumber: 15,
    mass: 30.974,
    group: 'nonmetal',
    period: 3,
    block: 'p',
    groupNumber: 15,
    color: 0xFFC107,
    description: 'Glüht weiß im Dunkeln. Wichtiger Bestandteil von DNA und ATP.',
    theme: 'fire',
    experiments: ['white', 'red', 'match', 'fertilizer', 'dna', 'matchhead'],
    electronConfiguration: [2, 8, 5]
  },

  // Sulfur
  {
    symbol: 'S',
    name: 'Schwefel',
    atomicNumber: 16,
    mass: 32.065,
    group: 'nonmetal',
    period: 3,
    block: 'p',
    groupNumber: 16,
    color: 0xFFC107,
    description: 'Gelbes Element mit charakteristischem Geruch. Kommt in Vulkanen vor.',
    theme: 'volcano',
    experiments: ['burning', 'gunpowder', 'bromo', 'acidrain', 'vulcano', 'sulfation'],
    electronConfiguration: [2, 8, 6]
  },

  // Chlorine
  {
    symbol: 'Cl',
    name: 'Chlor',
    atomicNumber: 17,
    mass: 35.453,
    group: 'halogen',
    period: 3,
    block: 'p',
    groupNumber: 17,
    color: GROUP_COLORS.halogen,
    description: 'Grün-gelbes Giftgas. Wird zur Wasserdesinfektion verwendet.',
    theme: 'swimming',
    experiments: ['disinfection', 'salt', 'gas', 'bleach', 'plastics', 'toxicology'],
    electronConfiguration: [2, 8, 7]
  },

  // Argon
  {
    symbol: 'Ar',
    name: 'Argon',
    atomicNumber: 18,
    mass: 39.948,
    group: 'nobleGas',
    period: 3,
    block: 'p',
    groupNumber: 18,
    color: NOBLE_GAS_COLORS.Ar,
    description: 'Häufigstes Edelgas (1% Atmosphäre). Wird für WIG-Schweißen verwendet.',
    theme: 'welding',
    experiments: ['plasma', 'inert', 'lightbulb', 'deepsea', 'star'],
    electronConfiguration: [2, 8, 8]
  },

  // Calcium
  {
    symbol: 'Ca',
    name: 'Calcium',
    atomicNumber: 20,
    mass: 40.078,
    group: 'alkalineEarth',
    period: 4,
    block: 's',
    groupNumber: 2,
    color: GROUP_COLORS.alkalineEarth,
    description: 'Bauknochen des Lebens. Fünft-häufigstes Element der Erdkruste.',
    theme: 'skeleton',
    experiments: ['burning', 'bones', 'limestone', 'teeth', 'bloodclot', 'limemaking'],
    electronConfiguration: [2, 8, 8, 2]
  },

  // Iron
  {
    symbol: 'Fe',
    name: 'Eisen',
    atomicNumber: 26,
    mass: 55.845,
    group: 'transition',
    period: 4,
    block: 'd',
    groupNumber: 8,
    color: GROUP_COLORS.transition,
    description: 'Wichtigstes Metall der Menschheit. Grundbaustein von Stahl und Hämoglobin.',
    theme: 'forge',
    experiments: ['magnet', 'rust', 'steel', 'bloodoxygen', 'coreplanet', 'meteorite', 'hemoglobin'],
    electronConfiguration: [2, 8, 14, 2]
  },

  // Copper
  {
    symbol: 'Cu',
    name: 'Kupfer',
    atomicNumber: 29,
    mass: 63.546,
    group: 'transition',
    period: 4,
    block: 'd',
    groupNumber: 11,
    color: GROUP_COLORS.transition,
    description: 'Erstes Metall der Menschheit. Exzellenter elektrischer Leiter.',
    theme: 'electric',
    experiments: ['conductivity', 'patina', 'bronze'],
    electronConfiguration: [2, 8, 18, 1]
  },

  // Gold
  {
    symbol: 'Au',
    name: 'Gold',
    atomicNumber: 79,
    mass: 196.967,
    group: 'transition',
    period: 6,
    block: 'd',
    groupNumber: 11,
    color: GROUP_COLORS.transition,
    description: 'Edelstes Metall. Einziges gelbes Metall (relativistische Effekte).',
    theme: 'treasure',
    experiments: ['ductility', 'alloys', 'electroplating', 'electronics', 'dentistry', 'cathodeparticles', 'relativistic'],
    electronConfiguration: [2, 8, 18, 32, 18, 1]
  },

  // Uranium
  {
    symbol: 'U',
    name: 'Uran',
    atomicNumber: 92,
    mass: 238.029,
    group: 'actinide',
    period: 7,
    block: 'f',
    groupNumber: 3,
    color: GROUP_COLORS.actinide,
    description: 'Schwerstes häufiges natürliches Element. Basis für Kernenergie.',
    theme: 'nuclear',
    experiments: ['fission', 'decay', 'fluorescence', 'enrichment', 'uraniumglass', 'radiation', 'breederreactor'],
    electronConfiguration: [2, 8, 18, 32, 21, 9, 2]
  },

  {
    symbol: 'K',
    name: 'Kalium',
    atomicNumber: 19,
    mass: 39.098,
    group: 'alkali',
    period: 4,
    block: 's',
    groupNumber: 1,
    color: GROUP_COLORS.alkali,
    description: 'Reaktiv Metall, in der Natur oft als Ion. Wesentlich für biologische Prozesse.',
    theme: 'biological',
    experiments: ['water', 'flame', 'banane', 'neuralsignals', 'fertilizer', 'explosives'],
    electronConfiguration: [2, 8, 8, 1]
  },

  {
    symbol: 'Ca',
    name: 'Calcium',
    atomicNumber: 20,
    mass: 40.078,
    group: 'alkalineEarth',
    period: 4,
    block: 's',
    groupNumber: 2,
    color: GROUP_COLORS.alkalineEarth,
    description: 'Fünft-häufigstes Element der Erdkruste. Fünft-häufigstes Element im menschlichen Körper.',
    theme: 'biological',
    experiments: ['burning', 'knochen', 'kalkstein'],
    electronConfiguration: [2, 8, 8, 2]
  },

  {
    symbol: 'Sc',
    name: 'Scandium',
    atomicNumber: 21,
    mass: 44.956,
    group: 'transition',
    period: 4,
    block: 'd',
    groupNumber: 3,
    color: GROUP_COLORS.transition,
    description: 'Seltenes Übergangsmetall. Wird in Sportgeräten und Hochleistungslegierungen verwendet.',
    theme: 'aerospace',
    experiments: ['alloy', 'magnetic', 'sport', 'aerospace', 'lightweight', 'uvfilter'],
    electronConfiguration: [2, 8, 9, 2]
  },

  {
    symbol: 'Ti',
    name: 'Titan',
    atomicNumber: 22,
    mass: 47.867,
    group: 'transition',
    period: 4,
    block: 'd',
    groupNumber: 4,
    color: GROUP_COLORS.transition,
    description: 'Korrosionsbeständiges Metall mit hohem Schmelzpunkt. Für Luft- und Raumfahrtindustrie.',
    theme: 'aerospace',
    experiments: ['biokompatibilität', 'legierung', 'oxid', 'aircraft', 'medical', 'pigment'],
    electronConfiguration: [2, 8, 10, 2]
  },

  {
    symbol: 'V',
    name: 'Vanadium',
    atomicNumber: 23,
    mass: 50.942,
    group: 'transition',
    period: 4,
    block: 'd',
    groupNumber: 5,
    color: GROUP_COLORS.transition,
    description: 'Hartes, grau-weißes Metall. Für Werkzeugstahl und Titanlegierungen.',
    theme: 'industry',
    experiments: ['stahl', 'legierung', 'katalysator', 'battery', 'corrosion', 'steel'],
    electronConfiguration: [2, 8, 11, 2]
  },

  {
    symbol: 'Cr',
    name: 'Chrom',
    atomicNumber: 24,
    mass: 51.996,
    group: 'transition',
    period: 4,
    block: 'd',
    groupNumber: 6,
    color: GROUP_COLORS.transition,
    description: 'Glänzendes, korrosionsbeständiges Metall. Basis von Edelstahl und Verchromung.',
    theme: 'industry',
    experiments: ['edelstahl', 'verchromung', 'pigment', 'stainless', 'chrome', 'cancer'],
    electronConfiguration: [2, 8, 13, 1]
  },

  {
    symbol: 'Mn',
    name: 'Mangan',
    atomicNumber: 25,
    mass: 54.938,
    group: 'transition',
    period: 4,
    block: 'd',
    groupNumber: 7,
    color: GROUP_COLORS.transition,
    description: 'Schweres, graues Metall. Wichtig für Stahlhärte und生物学.',
    theme: 'industry',
    experiments: ['härten', 'stahl', 'manganes', 'battery', 'photosynthesis', 'alloy'],
    electronConfiguration: [2, 8, 13, 2]
  },

  {
    symbol: 'Co',
    name: 'Kobalt',
    atomicNumber: 27,
    mass: 58.933,
    group: 'transition',
    period: 4,
    block: 'd',
    groupNumber: 9,
    color: GROUP_COLORS.transition,
    description: 'Blau-graues, ferromagnetisches Metall. Für Supraleger, Magnete und Lithium-Ionen-Batterien.',
    theme: 'technology',
    experiments: ['magnet', 'batterie', 'legierung', 'pigment', 'vitamin', 'recycling'],
    electronConfiguration: [2, 8, 15, 2]
  },

  {
    symbol: 'Ni',
    name: 'Nickel',
    atomicNumber: 28,
    mass: 58.693,
    group: 'transition',
    period: 4,
    block: 'd',
    groupNumber: 10,
    color: GROUP_COLORS.transition,
    description: 'Silbrig-weißes, korrosionsbeständiges Metall. Münzmetall und für Legierungen.',
    theme: 'technology',
    experiments: ['münzen', 'legierung', 'katalysator', 'alloy', 'battery', 'plating'],
    electronConfiguration: [2, 8, 16, 2]
  },

  {
    symbol: 'Zn',
    name: 'Zink',
    atomicNumber: 30,
    mass: 65.38,
    group: 'transition',
    period: 4,
    block: 'd',
    groupNumber: 12,
    color: GROUP_COLORS.transition,
    description: 'Reaktionsfreies Metall. Für galvanische Zellen, Verzinkung und Zink-Legierungen.',
    theme: 'technology',
    experiments: ['galvanik', 'verzinkung', 'batterie', 'immune', 'antiseptic', 'alloy'],
    electronConfiguration: [2, 8, 18, 2]
  },

  {
    symbol: 'Ga',
    name: 'Gallium',
    atomicNumber: 31,
    mass: 69.723,
    group: 'metal',
    period: 4,
    block: 'p',
    groupNumber: 13,
    color: GROUP_COLORS.metal,
    description: 'Schmilzt in der Hand bei Raumtemperatur. Für Halbleiter und Hochtemperaturthermometer.',
    theme: 'semiconductor',
    experiments: ['schmelzen', 'halbleiter', 'thermometer', 'led', 'solar', 'highvacuum'],
    electronConfiguration: [2, 8, 18, 3]
  },

  {
    symbol: 'Ge',
    name: 'Germanium',
    atomicNumber: 32,
    mass: 72.630,
    group: 'metalloid',
    period: 4,
    block: 'p',
    groupNumber: 14,
    color: GROUP_COLORS.metalloid,
    description: 'Halbleiter für Transistoren und Optoelektronik. Silizium-Alternative.',
    theme: 'semiconductor',
    experiments: ['halbleiter', 'transistor', 'faser', 'infrared', 'fiber', 'solar'],
    electronConfiguration: [2, 8, 18, 4]
  },

  {
    symbol: 'As',
    name: 'Arsen',
    atomicNumber: 33,
    mass: 74.922,
    group: 'metalloid',
    period: 4,
    block: 'p',
    groupNumber: 15,
    color: GROUP_COLORS.metalloid,
    description: 'Sehr giftiges Halbmetall. Historisch in Tapeten und Farben verwendet.',
    theme: 'toxic',
    experiments: ['gift', 'historisch', 'semiconductor', 'pesticide', 'medicine', 'photovoltaic'],
    electronConfiguration: [2, 8, 18, 5]
  },

  {
    symbol: 'Se',
    name: 'Selen',
    atomicNumber: 34,
    mass: 78.96,
    group: 'nonmetal',
    period: 4,
    block: 'p',
    groupNumber: 16,
    color: GROUP_COLORS.nonmetal,
    description: 'Wichtiges Spurenelement. Halbleiter und für Glühbirren.',
    theme: 'semiconductor',
    experiments: ['glühbirne', 'photovoltaik', 'toxisch', 'antioxidant', 'photography', 'solar'],
    electronConfiguration: [2, 8, 18, 6]
  },

  {
    symbol: 'Br',
    name: 'Brom',
    atomicNumber: 35,
    mass: 79.904,
    group: 'halogen',
    period: 4,
    block: 'p',
    groupNumber: 17,
    color: GROUP_COLORS.halogen,
    description: 'Einziges flüssige Nichtmetall bei Raumtemperatur. Rote Farbe, stechender Geruch.',
    theme: 'liquid',
    experiments: ['flüssig', 'flammmittel', 'giftig', 'bromide', 'medicinal', 'drilling'],
    electronConfiguration: [2, 8, 18, 7]
  },

  {
    symbol: 'Kr',
    name: 'Krypton',
    atomicNumber: 36,
    mass: 83.798,
    group: 'nobleGas',
    period: 4,
    block: 'p',
    groupNumber: 18,
    color: NOBLE_GAS_COLORS.Kr,
    description: 'Edelgas mit hoher Dichte. Für Blitzlichtlampen und Laser.',
    theme: 'lighting',
    experiments: ['laser', 'neon', 'isoliert', 'illuminator', 'planetary', 'deepfreeze'],
    electronConfiguration: [2, 8, 18, 8]
  },

  {
    symbol: 'Rb',
    name: 'Rubidium',
    atomicNumber: 37,
    mass: 85.468,
    group: 'alkali',
    period: 5,
    block: 's',
    groupNumber: 1,
    color: GROUP_COLORS.alkali,
    description: 'Weiches, hochreaktives Metall. Für Atomuhren und Feuerwerk.',
    theme: 'pyrotechnics',
    experiments: ['atomuhr', 'feuerwerk', 'reaktion', 'photodetector', 'ionthruster', 'vacuum'],
    electronConfiguration: [2, 8, 18, 8, 1]
  },

  {
    symbol: 'Sr',
    name: 'Strontium',
    atomicNumber: 38,
    mass: 87.62,
    group: 'alkalineEarth',
    period: 5,
    block: 's',
    groupNumber: 2,
    color: GROUP_COLORS.alkalineEarth,
    description: 'Für rote Feuerwerke und Magnete. Radioaktiv (Strontium-90).',
    theme: 'pyrotechnics',
    experiments: ['feuerwerk', 'magnet', 'radioaktiv', 'cathoderay', 'glow', 'glass'],
    electronConfiguration: [2, 8, 18, 8, 2]
  },

  {
    symbol: 'Y',
    name: 'Yttrium',
    atomicNumber: 39,
    mass: 88.906,
    group: 'transition',
    period: 5,
    block: 'd',
    groupNumber: 3,
    color: GROUP_COLORS.transition,
    description: 'Seltenes Erdelement. Für LEDs, Supraleiter und Laser.',
    theme: 'technology',
    experiments: ['led', 'laser', 'supraleiter', 'phosphor', 'magnet', 'ceramic'],
    electronConfiguration: [2, 8, 18, 9, 2]
  },

  {
    symbol: 'Zr',
    name: 'Zirkonium',
    atomicNumber: 40,
    mass: 91.224,
    group: 'transition',
    period: 5,
    block: 'd',
    groupNumber: 4,
    color: GROUP_COLORS.transition,
    description: 'Korrosionsbeständiges Metall. Für Kernelemente und medizinische Implantate.',
    theme: 'nuclear',
    experiments: ['kernelement', 'implantat', 'keramik', 'fuelcladding', 'alloy', 'biomedical'],
    electronConfiguration: [2, 8, 18, 10, 2]
  },

  {
    symbol: 'Nb',
    name: 'Niob',
    atomicNumber: 41,
    mass: 92.906,
    group: 'transition',
    period: 5,
    block: 'd',
    groupNumber: 5,
    color: GROUP_COLORS.transition,
    description: 'Supraleiter bei niedrigen Temperaturen. Für Beschleunigermagnete und Hochspannungstechnik.',
    theme: 'technology',
    experiments: ['supraleiter', 'magnet', 'hochspannung', 'alloy', 'catalyst', 'electronics'],
    electronConfiguration: [2, 8, 18, 12, 1]
  },

  {
    symbol: 'Mo',
    name: 'Molybdän',
    atomicNumber: 42,
    mass: 95.95,
    group: 'transition',
    period: 5,
    block: 'd',
    groupNumber: 6,
    color: GROUP_COLORS.transition,
    description: 'Extrem hartes Metall. Für Hochtemperaturanwendungen und Schmierstoffe.',
    theme: 'industry',
    experiments: ['hochtemperatur', 'schmiermittel', 'stahl', 'catalyst', 'alloy', 'nuclear'],
    electronConfiguration: [2, 8, 18, 13, 1]
  },

  {
    symbol: 'Tc',
    name: 'Technetium',
    atomicNumber: 43,
    mass: 98,
    group: 'transition',
    period: 5,
    block: 'd',
    groupNumber: 7,
    color: GROUP_COLORS.transition,
    description: 'Erstes künstliche Element. Radioaktiv. In der medizinischen Bildgebung verwendet.',
    theme: 'nuclear',
    experiments: ['künstlich', 'medizin', 'radioaktiv', 'imaging', 'cancer', 'detector'],
    electronConfiguration: [2, 8, 18, 13, 2]
  },

  {
    symbol: 'Ru',
    name: 'Ruthenium',
    atomicNumber: 44,
    mass: 101.07,
    group: 'transition',
    period: 5,
    block: 'd',
    groupNumber: 8,
    color: GROUP_COLORS.transition,
    description: 'Seltenes, aber wichtiges Metall. Für Elektronikkontakte und Katalysatoren.',
    theme: 'technology',
    experiments: ['katalysator', 'kontakte', 'legierung', 'disc', 'nuclear', 'alloy'],
    electronConfiguration: [2, 8, 18, 15, 1]
  },

  {
    symbol: 'Rh',
    name: 'Rhodium',
    atomicNumber: 45,
    mass: 102.91,
    group: 'transition',
    period: 5,
    block: 'd',
    groupNumber: 9,
    color: GROUP_COLORS.transition,
    description: 'Sehr wertvolles Übergangsmetall. Für Katalysatoren, Schmuck und Thermoelemente.',
    theme: 'technology',
    experiments: ['katalysator', 'schmuck', 'thermo', 'mirror', 'coating', 'alloy'],
    electronConfiguration: [2, 8, 18, 16, 1]
  },

  {
    symbol: 'Pd',
    name: 'Palladium',
    atomicNumber: 46,
    mass: 106.42,
    group: 'transition',
    period: 5,
    block: 'd',
    groupNumber: 10,
    color: GROUP_COLORS.transition,
    description: 'Wertvolles Platin-Metall. Für Katalysatoren, Schmuck und Wasserstofffilter.',
    theme: 'technology',
    experiments: ['katalysator', 'schmuck', 'wasserstoff', 'hydrogen', 'electronics', 'medical'],
    electronConfiguration: [2, 8, 18, 18]
  },

  {
    symbol: 'Ag',
    name: 'Silber',
    atomicNumber: 47,
    mass: 107.87,
    group: 'transition',
    period: 5,
    block: 'd',
    groupNumber: 11,
    color: GROUP_COLORS.transition,
    description: 'Bester elektrischer Leiter aller Metalle. Für Schmuck, Elektronik und Fotografie.',
    theme: 'precious',
    experiments: ['elektrisch', 'schmuck', 'fotografie', 'antibacterial', 'mirror', 'electronics'],
    electronConfiguration: [2, 8, 18, 18, 1]
  },

  {
    symbol: 'Cd',
    name: 'Cadmium',
    atomicNumber: 48,
    mass: 112.41,
    group: 'transition',
    period: 5,
    block: 'd',
    groupNumber: 12,
    color: GROUP_COLORS.transition,
    description: 'Giftiges Metall. Für NiCd-Batterien, Pigmente und galvanische Elemente.',
    theme: 'toxic',
    experiments: ['batterie', 'pigment', 'toxisch', 'solar', 'led', 'corrosion'],
    electronConfiguration: [2, 8, 18, 18, 2]
  },

  {
    symbol: 'In',
    name: 'Indium',
    atomicNumber: 49,
    mass: 114.82,
    group: 'metal',
    period: 5,
    block: 'p',
    groupNumber: 13,
    color: GROUP_COLORS.metal,
    description: 'Weiches Metall. Für ITO-Schichten (Touchscreens), Transistoren und Lötzinn.',
    theme: 'semiconductor',
    experiments: ['touchscreen', 'lötinn', 'halbleiter', 'solar', 'led', 'transparent'],
    electronConfiguration: [2, 8, 18, 18, 3]
  },

  {
    symbol: 'Sn',
    name: 'Zinn',
    atomicNumber: 50,
    mass: 118.71,
    group: 'metal',
    period: 5,
    block: 'p',
    groupNumber: 14,
    color: GROUP_COLORS.metal,
    description: 'Historisch wichtiges Metall. Für Lötlegierungen, Bronze und Konservendosen.',
    theme: 'history',
    experiments: ['löten', 'bronze', 'konserven', 'alloy', 'coating', 'nanomaterial'],
    electronConfiguration: [2, 8, 18, 18, 4]
  },

  {
    symbol: 'Sb',
    name: 'Antimon',
    atomicNumber: 51,
    mass: 121.76,
    group: 'metalloid',
    period: 5,
    block: 'p',
    groupNumber: 15,
    color: GROUP_COLORS.metalloid,
    description: 'Halbmetall mit ungewöhnlichen Eigenschaften. Für Flammhemmer und Legierungen.',
    theme: 'industry',
    experiments: ['flammhemmer', 'legierung', 'halbleiter', 'fireproof', 'polymer', 'electronics'],
    electronConfiguration: [2, 8, 18, 18, 5]
  },

  {
    symbol: 'Te',
    name: 'Tellur',
    atomicNumber: 52,
    mass: 127.60,
    group: 'metalloid',
    period: 5,
    block: 'p',
    groupNumber: 16,
    color: GROUP_COLORS.metalloid,
    description: 'Seltenes, seltenes Halbmetall. Für Solarzellen und Legierungen.',
    theme: 'semiconductor',
    experiments: ['solarzelle', 'legierung', 'cdte', 'infrared', 'thermoelectric', 'phasechange'],
    electronConfiguration: [2, 8, 18, 18, 6]
  },

  {
    symbol: 'I',
    name: 'Jod',
    atomicNumber: 53,
    mass: 126.90,
    group: 'halogen',
    period: 5,
    block: 'p',
    groupNumber: 17,
    color: GROUP_COLORS.halogen,
    description: 'Wichtigstes Spurenelement für Schilddrüse. Dunkle Substanz mit charakteristischem Geruch.',
    theme: 'biological',
    experiments: ['schilddrüse', 'antiseptik', 'sublimation', 'medical', 'contrast', 'nutrition'],
    electronConfiguration: [2, 8, 18, 18, 7]
  },

  {
    symbol: 'Xe',
    name: 'Xenon',
    atomicNumber: 54,
    mass: 131.29,
    group: 'nobleGas',
    period: 5,
    block: 'p',
    groupNumber: 18,
    color: NOBLE_GAS_COLORS.Xe,
    description: 'Schweres Edelgas. Für Ionentriebwerke, Narkose und Blitzlichtlampen.',
    theme: 'space',
    experiments: ['ionentrieb', 'narkose', 'laser', 'deepsea', 'flash', 'medical'],
    electronConfiguration: [2, 8, 18, 18, 8]
  },

  {
    symbol: 'Cs',
    name: 'Cäsium',
    atomicNumber: 55,
    mass: 132.91,
    group: 'alkali',
    period: 6,
    block: 's',
    groupNumber: 1,
    color: GROUP_COLORS.alkali,
    description: 'Weiches, hochreaktives Metall. Schmilzt in der Hand. Präzisesste Zeitnormal.',
    theme: 'precision',
    experiments: ['schmelzen', 'atomuhr', 'explosion', 'photoelectric', 'ionthruster', 'nightvision'],
    electronConfiguration: [2, 8, 18, 18, 8, 1]
  },

  {
    symbol: 'Ba',
    name: 'Barium',
    atomicNumber: 56,
    mass: 137.33,
    group: 'alkalineEarth',
    period: 6,
    block: 's',
    groupNumber: 2,
    color: GROUP_COLORS.alkalineEarth,
    description: 'Für medizinische Kontrastmittel und grüne Feuerwerke. Schwerkresistent.',
    theme: 'medical',
    experiments: ['kontrastmittel', 'feuerwerk', 'magnet', 'glass', 'detector', 'catalyst'],
    electronConfiguration: [2, 8, 18, 18, 8, 2]
  },

  {
    symbol: 'La',
    name: 'Lanthan',
    atomicNumber: 57,
    mass: 138.91,
    group: 'lanthanide',
    period: 6,
    block: 'f',
    groupNumber: 3,
    color: GROUP_COLORS.lanthanide,
    description: 'Weiches, duktils Metall. Für Hybridauto-Batterien und Zündsteine.',
    theme: 'technology',
    experiments: ['batterie', 'zündsteine', 'optik', 'catalyst', 'glass', 'magnet'],
    electronConfiguration: [2, 8, 18, 18, 9, 2]
  },

  {
    symbol: 'Ce',
    name: 'Cer',
    atomicNumber: 58,
    mass: 140.12,
    group: 'lanthanide',
    period: 6,
    block: 'f',
    groupNumber: 3,
    color: GROUP_COLORS.lanthanide,
    description: 'Häufigstes Lanthanoid. Für Ferrocer-Feuerzeuge und Autokatalysatoren.',
    theme: 'technology',
    experiments: ['feuerzeuge', 'katalysator', 'selbstreinigend', 'glass', 'battery', 'polish'],
    electronConfiguration: [2, 8, 18, 19, 9, 2]
  },

  {
    symbol: 'Pr',
    name: 'Praseodym',
    atomicNumber: 59,
    mass: 140.91,
    group: 'lanthanide',
    period: 6,
    block: 'f',
    groupNumber: 3,
    color: GROUP_COLORS.lanthanide,
    description: 'Für Magnetlegierungen und Grüne Farbe. Wichtig für Hightech-Legierungen.',
    theme: 'technology',
    experiments: ['magnet', 'grün', 'legierung', 'alloy', 'glass', 'laser'],
    electronConfiguration: [2, 8, 18, 21, 8, 2]
  },

  {
    symbol: 'Nd',
    name: 'Neodym',
    atomicNumber: 60,
    mass: 144.24,
    group: 'lanthanide',
    period: 6,
    block: 'f',
    groupNumber: 3,
    color: GROUP_COLORS.lanthanide,
    description: 'Für starke Magnete und Lasertechnologie. Wichtiger Bestandteil moderner Technologien.',
    theme: 'technology',
    experiments: ['magnet', 'laser', 'audiophile', 'windturbine', 'speakers', 'alloy'],
    electronConfiguration: [2, 8, 18, 22, 8, 2]
  },

  {
    symbol: 'Pm',
    name: 'Promethium',
    atomicNumber: 61,
    mass: 145,
    group: 'lanthanide',
    period: 6,
    block: 'f',
    groupNumber: 3,
    color: GROUP_COLORS.lanthanide,
    description: 'Künstliches, radioaktives Element. Für Kernbatterien in Raumfahrzeugen.',
    theme: 'space',
    experiments: ['künstlich', 'kernbatterie', 'radioaktiv', 'luminescent', 'spacecraft', 'power'],
    electronConfiguration: [2, 8, 18, 23, 8, 2]
  },

  {
    symbol: 'Sm',
    name: 'Samarium',
    atomicNumber: 62,
    mass: 150.36,
    group: 'lanthanide',
    period: 6,
    block: 'f',
    groupNumber: 3,
    color: GROUP_COLORS.lanthanide,
    description: 'Für Permanentmagnete und Kernreaktor-Steuerstäbe.',
    theme: 'nuclear',
    experiments: ['magnet', 'reaktor', 'absorber', 'coke', 'laser', 'alloy'],
    electronConfiguration: [2, 8, 18, 24, 8, 2]
  },

  {
    symbol: 'Eu',
    name: 'Europium',
    atomicNumber: 63,
    mass: 151.96,
    group: 'lanthanide',
    period: 6,
    block: 'f',
    groupNumber: 3,
    color: GROUP_COLORS.lanthanide,
    description: 'Rot phosphoreszierend in Euro-Scheinen. Für Sicherheit und Lasermaterialien.',
    theme: 'security',
    experiments: ['phosphoreszenz', 'euro', 'laser', 'display', 'magnet', 'glass'],
    electronConfiguration: [2, 8, 18, 25, 8, 2]
  },

  {
    symbol: 'Gd',
    name: 'Gadolinium',
    atomicNumber: 64,
    mass: 157.25,
    group: 'lanthanide',
    period: 6,
    block: 'f',
    groupNumber: 3,
    color: GROUP_COLORS.lanthanide,
    description: 'Höchste Neutronenabsorption. Für MRT-Kontrastmittel und Kernreaktorsteuerung.',
    theme: 'medical',
    experiments: ['mrt', 'reaktor', 'absorber', 'cooling', 'encryption', 'magnet'],
    electronConfiguration: [2, 8, 18, 25, 9, 2]
  },

  {
    symbol: 'Tb',
    name: 'Terbium',
    atomicNumber: 65,
    mass: 158.93,
    group: 'lanthanide',
    period: 6,
    block: 'f',
    groupNumber: 3,
    color: GROUP_COLORS.lanthanide,
    description: 'Weiches Lanthanoid. Für Phosphorleuchtstoffe und Elektromotore.',
    theme: 'technology',
    experiments: ['phosphor', 'magnet', 'motor', 'display', 'alloy', 'fuelcell'],
    electronConfiguration: [2, 8, 18, 27, 8, 2]
  },

  {
    symbol: 'Dy',
    name: 'Dysprosium',
    atomicNumber: 66,
    mass: 162.50,
    group: 'lanthanide',
    period: 6,
    block: 'f',
    groupNumber: 3,
    color: GROUP_COLORS.lanthanide,
    description: 'Für Permanentmagnete und Natrium-Dampflampen. Wichtig für grüne Technik.',
    theme: 'technology',
    experiments: ['magnet', 'lampe', 'nuklear', 'windturbine', 'laser', 'alloy'],
    electronConfiguration: [2, 8, 18, 28, 8, 2]
  },

  {
    symbol: 'Ho',
    name: 'Holmium',
    atomicNumber: 67,
    mass: 164.93,
    group: 'lanthanide',
    period: 6,
    block: 'f',
    groupNumber: 3,
    color: GROUP_COLORS.lanthanide,
    description: 'Besitzt höchstes magnetisches Moment aller Elemente. Für Laser und Hochleistungsmagnete.',
    theme: 'technology',
    experiments: ['laser', 'magnet', 'hochleistung', 'nuclear', 'medical', 'alloy'],
    electronConfiguration: [2, 8, 18, 29, 8, 2]
  },

  {
    symbol: 'Er',
    name: 'Erbium',
    atomicNumber: 68,
    mass: 167.26,
    group: 'lanthanide',
    period: 6,
    block: 'f',
    groupNumber: 3,
    color: GROUP_COLORS.lanthanide,
    description: 'Für Glasfaser-Verstärker und optische Verstärker. Rosarotes Leuchten.',
    theme: 'technology',
    experiments: ['glasfaser', 'optik', 'laser', 'telecom', 'amplifier', 'medical'],
    electronConfiguration: [2, 8, 18, 30, 8, 2]
  },

  {
    symbol: 'Tm',
    name: 'Thulium',
    atomicNumber: 69,
    mass: 168.93,
    group: 'lanthanide',
    period: 6,
    block: 'f',
    groupNumber: 3,
    color: GROUP_COLORS.lanthanide,
    description: 'Für medizinische Röntgenanlagen. Röntgen-Kontrastmittel.',
    theme: 'medical',
    experiments: ['röntgen', 'medizin', 'laser', 'portable', 'xray', 'alloy'],
    electronConfiguration: [2, 8, 18, 31, 8, 2]
  },

  {
    symbol: 'Yb',
    name: 'Ytterbium',
    atomicNumber: 70,
    mass: 173.05,
    group: 'lanthanide',
    period: 6,
    block: 'f',
    groupNumber: 3,
    color: GROUP_COLORS.lanthanide,
    description: 'Für Stahllegierungen und Röntgenanlagen. Rote Lumineszenz.',
    theme: 'industry',
    experiments: ['legierung', 'röntgen', 'luminiszenz', 'atomicclock', 'steel', 'nuclear'],
    electronConfiguration: [2, 8, 18, 32, 8, 2]
  },

  {
    symbol: 'Lu',
    name: 'Lutetium',
    atomicNumber: 71,
    mass: 174.97,
    group: 'lanthanide',
    period: 6,
    block: 'f',
    groupNumber: 3,
    color: GROUP_COLORS.lanthanide,
    description: 'Letztes natürliches Lanthanoid. Für PET-Scanner und Katalysatoren.',
    theme: 'technology',
    experiments: ['scanner', 'katalysator', 'spektrometer'],
    electronConfiguration: [2, 8, 18, 32, 9, 2]
  },

  {
    symbol: 'Hf',
    name: 'Hafnium',
    atomicNumber: 72,
    mass: 178.49,
    group: 'transition',
    period: 6,
    block: 'd',
    groupNumber: 4,
    color: GROUP_COLORS.transition,
    description: 'Korrosionsbeständiges Metall. Für Reaktordruckbehälter und Kernenergieanwendungen.',
    theme: 'nuclear',
    experiments: ['reaktor', 'kernenergie', 'legierung'],
    electronConfiguration: [2, 8, 18, 32, 10, 2]
  },

  {
    symbol: 'Ta',
    name: 'Tantal',
    atomicNumber: 73,
    mass: 180.95,
    group: 'transition',
    period: 6,
    block: 'd',
    groupNumber: 5,
    color: GROUP_COLORS.transition,
    description: 'Extrem korrosionsbeständig. Für Kondensatoren und elektronische Bauteile.',
    theme: 'electronics',
    experiments: ['kondensator', 'elektronik', 'korrosion'],
    electronConfiguration: [2, 8, 18, 32, 11, 2]
  },

  {
    symbol: 'W',
    name: 'Wolfram',
    atomicNumber: 74,
    mass: 183.84,
    group: 'transition',
    period: 6,
    block: 'd',
    groupNumber: 6,
    color: GROUP_COLORS.transition,
    description: 'Höchster Schmelzpunkt aller Elemente. Für Glühbirnen und Wolframbearbeitung.',
    theme: 'technology',
    experiments: ['glühbirne', 'bearbeitung', 'legierung'],
    electronConfiguration: [2, 8, 18, 32, 12, 2]
  },

  {
    symbol: 'Re',
    name: 'Rhenium',
    atomicNumber: 75,
    mass: 186.21,
    group: 'transition',
    period: 6,
    block: 'd',
    groupNumber: 7,
    color: GROUP_COLORS.transition,
    description: 'Selteneres, hochschmelzendes Metall. Für Düsenläufer und Hochtemperaturlegierungen.',
    theme: 'aerospace',
    experiments: ['düsenläufer', 'hochtemperatur', 'legierung'],
    electronConfiguration: [2, 8, 18, 32, 13, 2]
  },

  {
    symbol: 'Os',
    name: 'Osmium',
    atomicNumber: 76,
    mass: 190.23,
    group: 'transition',
    period: 6,
    block: 'd',
    groupNumber: 8,
    color: GROUP_COLORS.transition,
    description: 'Dichtestes natürliches Element. Für Schreibspitzen und Implantate.',
    theme: 'technology',
    experiments: ['schreibspitzen', 'implantat', 'legierung'],
    electronConfiguration: [2, 8, 18, 32, 14, 2]
  },

  {
    symbol: 'Ir',
    name: 'Iridium',
    atomicNumber: 77,
    mass: 192.22,
    group: 'transition',
    period: 6,
    block: 'd',
    groupNumber: 9,
    color: GROUP_COLORS.transition,
    description: 'Extrem korrosionsbeständiges Metall. Für Zündkerzen und Elektroden.',
    theme: 'technology',
    experiments: ['zündkerzen', 'elektroden', 'legierung'],
    electronConfiguration: [2, 8, 18, 32, 15, 2]
  },

  {
    symbol: 'Pt',
    name: 'Platin',
    atomicNumber: 78,
    mass: 195.08,
    group: 'transition',
    period: 6,
    block: 'd',
    groupNumber: 10,
    color: GROUP_COLORS.transition,
    description: 'Edelmetall für Katalysatoren, Schmuck und Katalysatoren. Beständiger als Gold.',
    theme: 'precious',
    experiments: ['katalysator', 'schmuck', 'legierung'],
    electronConfiguration: [2, 8, 18, 32, 17, 1]
  },

  {
    symbol: 'Au',
    name: 'Gold',
    atomicNumber: 79,
    mass: 196.97,
    group: 'transition',
    period: 6,
    block: 'd',
    groupNumber: 11,
    color: GROUP_COLORS.transition,
    description: 'Edelstes Metall, einziges gelbes Metall (relativistische Effekte). Für Elektronik und Schmuck.',
    theme: 'treasure',
    experiments: ['ductilität', 'legierungen', 'elektroplattierung'],
    electronConfiguration: [2, 8, 18, 32, 18, 1]
  },

  {
    symbol: 'Hg',
    name: 'Quecksilber',
    atomicNumber: 80,
    mass: 200.59,
    group: 'transition',
    period: 6,
    block: 'd',
    groupNumber: 12,
    color: GROUP_COLORS.transition,
    description: 'Einziges flüssiges Metall bei Raumtemperatur. Für Thermometer und Alchemiehistorie.',
    theme: 'historical',
    experiments: ['flüssig', 'thermometer', 'alchemie'],
    electronConfiguration: [2, 8, 18, 32, 18, 2]
  },

  {
    symbol: 'Tl',
    name: 'Thallium',
    atomicNumber: 81,
    mass: 204.38,
    group: 'metal',
    period: 6,
    block: 'p',
    groupNumber: 13,
    color: GROUP_COLORS.metal,
    description: 'Giftiges, weiches Metall. Historisch in Mordfällen verwendet. Für Glasherstellung.',
    theme: 'toxic',
    experiments: ['gift', 'glasherstellung', 'temperatur'],
    electronConfiguration: [2, 8, 18, 32, 18, 3]
  },

  {
    symbol: 'Pb',
    name: 'Blei',
    atomicNumber: 82,
    mass: 207.2,
    group: 'metal',
    period: 6,
    block: 'p',
    groupNumber: 14,
    color: GROUP_COLORS.metal,
    description: 'Schwerstes stabiles Element. Für Akkus und Röntgenschutz. Römisches Erbe.',
    theme: 'history',
    experiments: ['akkus', 'röntgen', 'blei'],
    electronConfiguration: [2, 8, 18, 32, 18, 4]
  },

  {
    symbol: 'Bi',
    name: 'Wismut',
    atomicNumber: 83,
    mass: 208.98,
    group: 'metalloid',
    period: 6,
    block: 'p',
    groupNumber: 15,
    color: GROUP_COLORS.metalloid,
    description: 'Dichtes, schmelzendes Metall. Für Kosmetika, Schmiermittel und Röntgenkontrast.',
    theme: 'medical',
    experiments: ['kosmetika', 'schmiermittel', 'röntgen'],
    electronConfiguration: [2, 8, 18, 32, 18, 5]
  },

  {
    symbol: 'Po',
    name: 'Polonium',
    atomicNumber: 84,
    mass: 209,
    group: 'metalloid',
    period: 6,
    block: 'p',
    groupNumber: 16,
    color: GROUP_COLORS.metalloid,
    description: 'Hochradioaktiv, starkes Metall. Historisch berühmt (Curie). Für Alphastrahler.',
    theme: 'nuclear',
    experiments: ['alphastrahler', 'radioaktiv', 'wärmequelle'],
    electronConfiguration: [2, 8, 18, 32, 18, 6]
  },

  {
    symbol: 'At',
    name: 'Astatin',
    atomicNumber: 85,
    mass: 210,
    group: 'halogen',
    period: 6,
    block: 'p',
    groupNumber: 17,
    color: GROUP_COLORS.halogen,
    description: 'Seltenstes natürliches Element. Halbwertszeit ~8 Stunden. Für Forschung.',
    theme: 'research',
    experiments: ['forschung', 'halbwertszeit', 'instabil'],
    electronConfiguration: [2, 8, 18, 32, 18, 7]
  },

  {
    symbol: 'Rn',
    name: 'Radon',
    atomicNumber: 86,
    mass: 222,
    group: 'nobleGas',
    period: 6,
    block: 'p',
    groupNumber: 18,
    color: NOBLE_GAS_COLORS.Rn,
    description: 'Radionuklid, zweithäufigste Lungenkrebsursache. Für Radonmessung und Schutz.',
    theme: 'radiation',
    experiments: ['radonmessung', 'schutz', 'zerfall'],
    electronConfiguration: [2, 8, 18, 32, 18, 8]
  },

  {
    symbol: 'Fr',
    name: 'Francium',
    atomicNumber: 87,
    mass: 223,
    group: 'alkali',
    period: 7,
    block: 's',
    groupNumber: 1,
    color: GROUP_COLORS.alkali,
    description: 'Instabil, radioaktiv. Nie makroskopisch beobachtet. Hypothetische Wasserreaktion.',
    theme: 'theoretical',
    experiments: ['instabil', 'halbwertszeit', 'theoretisch', 'decay', 'detection', 'synthesis'],
    electronConfiguration: [2, 8, 18, 32, 18, 8, 1]
  },

  {
    symbol: 'Ra',
    name: 'Radium',
    atomicNumber: 88,
    mass: 226,
    group: 'alkalineEarth',
    period: 7,
    block: 's',
    groupNumber: 2,
    color: GROUP_COLORS.alkalineEarth,
    description: 'Hochradioaktiv, luminiszierendes Metall. Leuchtet im Dunkeln. Für historische Lampen.',
    theme: 'historical',
    experiments: ['leuchten', 'historisch', 'radioaktiv', 'cancer', 'luminiscent', 'medical'],
    electronConfiguration: [2, 8, 18, 32, 18, 8, 2]
  },

  {
    symbol: 'Ac',
    name: 'Actinium',
    atomicNumber: 89,
    mass: 227,
    group: 'actinide',
    period: 7,
    block: 'f',
    groupNumber: 3,
    color: GROUP_COLORS.actinide,
    description: 'Namensgeber der Actinoide. Radioaktiv. Ausgangsstoff für Urananreicherung.',
    theme: 'nuclear',
    experiments: ['urananreicherung', 'strahlung', 'zerfall', 'detector', 'medical', 'nuclear'],
    electronConfiguration: [2, 8, 18, 32, 18, 9, 2]
  },

  {
    symbol: 'Th',
    name: 'Thorium',
    atomicNumber: 90,
    mass: 232.04,
    group: 'actinide',
    period: 7,
    block: 'f',
    groupNumber: 3,
    color: GROUP_COLORS.actinide,
    description: 'Für Flüssigsalzreaktoren. Sicherer und abundanter als Uran. Mythologisch benannt.',
    theme: 'nuclear',
    experiments: ['flüssigsalzreaktor', 'sicherheit', 'kernenergie', 'waste', 'mining', 'fuel'],
    electronConfiguration: [2, 8, 18, 32, 18, 10, 2]
  },

  {
    symbol: 'Pa',
    name: 'Protactinium',
    atomicNumber: 91,
    mass: 231.04,
    group: 'actinide',
    period: 7,
    block: 'f',
    groupNumber: 3,
    color: GROUP_COLORS.actinide,
    description: 'Selteneres, radioaktives Element. Für Kernreaktor-Forschung.',
    theme: 'research',
    experiments: ['forschung', 'kernreaktor', 'urananreicherung', 'detector', 'dating', 'waste'],
    electronConfiguration: [2, 8, 18, 32, 20, 9, 2]
  },

  {
    symbol: 'Np',
    name: 'Neptunium',
    atomicNumber: 93,
    mass: 237,
    group: 'actinide',
    period: 7,
    block: 'f',
    groupNumber: 3,
    color: GROUP_COLORS.actinide,
    description: 'Künstliches Element. Erste in Atomversuchen produziert. Für Plutonium-Herstellung.',
    theme: 'nuclear',
    experiments: ['künstlich', 'plutonium', 'reaktor', 'detector', 'space', 'fuelcycle'],
    electronConfiguration: [2, 8, 18, 32, 22, 9, 2]
  },

  {
    symbol: 'Pu',
    name: 'Plutonium',
    atomicNumber: 94,
    mass: 244,
    group: 'actinide',
    period: 7,
    block: 'f',
    groupNumber: 3,
    color: GROUP_COLORS.actinide,
    description: 'Tödlichste Substanz. Mikrogramm können töten. Für Kernwaffen und Raumfahrt-RTGs.',
    theme: 'nuclear',
    experiments: ['kernwaffen', 'raumfahrt', 'gefahr', 'rtg', 'breeder', 'isotope'],
    electronConfiguration: [2, 8, 18, 32, 24, 8, 2]
  },

  {
    symbol: 'Am',
    name: 'Americium',
    atomicNumber: 95,
    mass: 243,
    group: 'actinide',
    period: 7,
    block: 'f',
    groupNumber: 3,
    color: GROUP_COLORS.actinide,
    description: 'Künstliches Element. Entdeckt in H-Bomben-Fallout (Ivy Mike 1952). Für Rauchdetektoren.',
    theme: 'space',
    experiments: ['rauchdetektor', 'h-bombe', 'spuren', 'detector', 'smoke', 'spacecraft'],
    electronConfiguration: [2, 8, 18, 32, 25, 8, 2]
  },

  {
    symbol: 'Cm',
    name: 'Curium',
    atomicNumber: 96,
    mass: 247,
    group: 'actinide',
    period: 7,
    block: 'f',
    groupNumber: 3,
    color: GROUP_COLORS.actinide,
    description: 'Künstliches Element. Namensgeber: Pierre und Marie Curie. Für Raumschiff-RTGs.',
    theme: 'space',
    experiments: ['raumfahrt', 'curie', 'kernenergie', 'rtg', 'spacecraft', 'detector'],
    electronConfiguration: [2, 8, 18, 32, 25, 9, 2]
  },

  {
    symbol: 'Bk',
    name: 'Berkelium',
    atomicNumber: 97,
    mass: 247,
    group: 'actinide',
    period: 7,
    block: 'f',
    groupNumber: 3,
    color: GROUP_COLORS.actinide,
    description: 'Künstliches Element. Sehr kurzlebig. Für wissenschaftliche Forschung.',
    theme: 'research',
    experiments: ['forschung', 'kernchemie', 'instabil', 'synthesis', 'detector', 'isotope'],
    electronConfiguration: [2, 8, 18, 32, 27, 8, 2]
  },

  {
    symbol: 'Cf',
    name: 'Californium',
    atomicNumber: 98,
    mass: 251,
    group: 'actinide',
    period: 7,
    block: 'f',
    groupNumber: 3,
    color: GROUP_COLORS.actinide,
    description: 'Künstliches Element. Für Neutronenquellen und Elementsynthese.',
    theme: 'nuclear',
    experiments: ['neutronenquelle', 'synthese', 'zerfall', 'detector', 'nuclear', 'superheavy'],
    electronConfiguration: [2, 8, 18, 32, 28, 8, 2]
  },

  {
    symbol: 'Es',
    name: 'Einsteinium',
    atomicNumber: 99,
    mass: 252,
    group: 'actinide',
    period: 7,
    block: 'f',
    groupNumber: 3,
    color: GROUP_COLORS.actinide,
    description: 'Künstliches Element. Entdeckt 1952 im Fallout der H-Bombe Ivy Mike. In Gedenken an Einstein.',
    theme: 'history',
    experiments: ['historisch', 'h-bombe', 'memorial', 'isotope', 'synthesis', 'research'],
    electronConfiguration: [2, 8, 18, 32, 29, 8, 2]
  },

  {
    symbol: 'Fm',
    name: 'Fermium',
    atomicNumber: 100,
    mass: 257,
    group: 'actinide',
    period: 7,
    block: 'f',
    groupNumber: 3,
    color: GROUP_COLORS.actinide,
    description: 'Künstliches Element. Namensgeber: Enrico Fermi. Für theoretische Kernreaktoren.',
    theme: 'research',
    experiments: ['reaktor', 'theoretisch', 'nuklearphysik', 'isotope', 'synthesis', 'detector'],
    electronConfiguration: [2, 8, 18, 32, 30, 8, 2]
  },

  {
    symbol: 'Md',
    name: 'Mendelevium',
    atomicNumber: 101,
    mass: 258,
    group: 'actinide',
    period: 7,
    block: 'f',
    groupNumber: 3,
    color: GROUP_COLORS.actinide,
    description: 'Künstliches Element. In Gedenken an Mendelejew. Ehemaliges Element 101.',
    theme: 'history',
    experiments: ['historisch', 'periodensystem', 'tradition', 'synthesis', 'isotope', 'research'],
    electronConfiguration: [2, 8, 18, 32, 31, 8, 2]
  },

  {
    symbol: 'No',
    name: 'Nobelium',
    atomicNumber: 102,
    mass: 259,
    group: 'actinide',
    period: 7,
    block: 'f',
    groupNumber: 3,
    color: GROUP_COLORS.actinide,
    description: 'Künstliches Element. Benannt nach Alfred Nobel. Für wissenschaftliche Anerkennung.',
    theme: 'history',
    experiments: ['auszeichnung', 'nobelpreis', 'forschung', 'synthesis', 'isotope', 'detection'],
    electronConfiguration: [2, 8, 18, 32, 32, 8, 2]
  },

  {
    symbol: 'Lr',
    name: 'Lawrencium',
    atomicNumber: 103,
    mass: 262,
    group: 'actinide',
    period: 7,
    block: 'f',
    groupNumber: 3,
    color: GROUP_COLORS.actinide,
    description: 'Letztes natürliches Element. Namensgeber: Ernest Lawrence. Entdeckung der Lanthanoide.',
    theme: 'discovery',
    experiments: ['entdeckung', 'synchrotron', 'teilchenbeschleuniger', 'synthesis', 'isotope', 'research'],
    electronConfiguration: [2, 8, 18, 32, 32, 8, 3]
  },

  {
    symbol: 'Rf',
    name: 'Rutherfordium',
    atomicNumber: 104,
    mass: 267,
    group: 'actinide',
    period: 7,
    block: 'd',
    groupNumber: 4,
    color: GROUP_COLORS.actinide,
    description: 'Künstliches Element. Namensgeber: Ernest Rutherford. Entdeckung des Atomkerns.',
    theme: 'research',
    experiments: ['kernphysik', 'teilchen', 'reaktor', 'synthesis', 'isotope', 'detector'],
    electronConfiguration: [2, 8, 18, 32, 32, 10, 2]
  },

  {
    symbol: 'Db',
    name: 'Dubnium',
    atomicNumber: 105,
    mass: 268,
    group: 'actinide',
    period: 7,
    block: 'd',
    groupNumber: 5,
    color: GROUP_COLORS.actinide,
    description: 'Künstliches Element. Namensgeber: Stadt Dubna. Forschungszentrum Russlands.',
    theme: 'research',
    experiments: ['forschung', 'kernchemie', 'instabil', 'synthesis', 'isotope', 'detector'],
    electronConfiguration: [2, 8, 18, 32, 32, 11, 2]
  },

  {
    symbol: 'Sg',
    name: 'Seaborgium',
    atomicNumber: 106,
    mass: 269,
    group: 'actinide',
    period: 7,
    block: 'd',
    groupNumber: 6,
    color: GROUP_COLORS.actinide,
    description: 'Künstliches Element. Namensgeber: Glenn Seaborg. Forschungszentrum USA.',
    theme: 'research',
    experiments: ['forschung', 'chemie', 'synthese', 'isotope', 'detector', 'nuclear'],
    electronConfiguration: [2, 8, 18, 32, 32, 12, 2]
  },

  {
    symbol: 'Bh',
    name: 'Bohrium',
    atomicNumber: 107,
    mass: 270,
    group: 'actinide',
    period: 7,
    block: 'd',
    groupNumber: 7,
    color: GROUP_COLORS.actinide,
    description: 'Künstliches Element. Namensgeber: Niels Bohr. Quantenmechanik-Revolution.',
    theme: 'science',
    experiments: ['quantenmechanik', 'theoretisch', 'modell', 'synthesis', 'isotope', 'physics'],
    electronConfiguration: [2, 8, 18, 32, 32, 13, 2]
  },

  {
    symbol: 'Hs',
    name: 'Hassium',
    atomicNumber: 108,
    mass: 277,
    group: 'actinide',
    period: 7,
    block: 'd',
    groupNumber: 8,
    color: GROUP_COLORS.actinide,
    description: 'Künstliches Element. Namensgeber: Hessen (Bundesland). Erste deutsche Entdeckung.',
    theme: 'discovery',
    experiments: ['entdeckung', 'deutsch', 'teilchen', 'synthesis', 'isotope', 'physics'],
    electronConfiguration: [2, 8, 18, 32, 32, 16, 2]
  },

  {
    symbol: 'Mt',
    name: 'Meitnerium',
    atomicNumber: 109,
    mass: 278,
    group: 'actinide',
    period: 7,
    block: 'd',
    groupNumber: 8,
    color: GROUP_COLORS.actinide,
    description: 'Künstliches Element. Namensgeber: Lise Meitner. Entdeckung der Kernspaltung.',
    theme: 'history',
    experiments: ['kernspaltung', 'uran', 'geschichte', 'synthesis', 'isotope', 'detector'],
    electronConfiguration: [2, 8, 18, 32, 32, 17, 2]
  },

  {
    symbol: 'Ds',
    name: 'Darmstadtium',
    atomicNumber: 110,
    mass: 281,
    group: 'actinide',
    period: 7,
    block: 'd',
    groupNumber: 8,
    color: GROUP_COLORS.actinide,
    description: 'Künstliches Element. Namensgeber: Darmstadt. GSI Teilchenbeschleuniger.',
    theme: 'research',
    experiments: ['teilchenbeschleuniger', 'schwerionen', 'synthese', 'isotope', 'detector', 'radioactive'],
    electronConfiguration: [2, 8, 18, 32, 32, 18, 2]
  },

  {
    symbol: 'Rg',
    name: 'Roentgenium',
    atomicNumber: 111,
    mass: 282,
    group: 'actinide',
    period: 7,
    block: 'd',
    groupNumber: 8,
    color: GROUP_COLORS.actinide,
    description: 'Künstliches Element. Namensgeber: Wilhelm Röntgen. Für medizinische Bildgebung.',
    theme: 'medical',
    experiments: ['röntgen', 'medizin', 'synthese', 'isotope', 'detector', 'imaging'],
    electronConfiguration: [2, 8, 18, 32, 32, 19, 2]
  },

  {
    symbol: 'Cn',
    name: 'Copernicium',
    atomicNumber: 112,
    mass: 285,
    group: 'actinide',
    period: 7,
    block: 'd',
    groupNumber: 8,
    color: GROUP_COLORS.actinide,
    description: 'Künstliches Element. Namensgeber: Nikolaus Kopernikus. Revolution des Weltbilds.',
    theme: 'history',
    experiments: ['astronomie', 'revolution', 'universum', 'synthesis', 'isotope', 'physics'],
    electronConfiguration: [2, 8, 18, 32, 32, 20, 2]
  },

  {
    symbol: 'Nh',
    name: 'Nihonium',
    atomicNumber: 113,
    mass: 286,
    group: 'actinide',
    period: 7,
    block: 'd',
    groupNumber: 8,
    color: GROUP_COLORS.actinide,
    description: 'Künstliches Element. Namensgeber: Japan. Für Elementsynthese-Forschung.',
    theme: 'research',
    experiments: ['synthese', 'element', 'forschung', 'isotope', 'detector', 'physics'],
    electronConfiguration: [2, 8, 18, 32, 32, 21, 2]
  },

  {
    symbol: 'Fl',
    name: 'Flerovium',
    atomicNumber: 114,
    mass: 289,
    group: 'actinide',
    period: 7,
    block: 'd',
    groupNumber: 8,
    color: GROUP_COLORS.actinide,
    description: 'Künstliches Element. Namensgeber: Georgij Flerow. Für theoretische Physik.',
    theme: 'science',
    experiments: ['theoretisch', 'modell', 'stabilität', 'synthesis', 'isotope', 'island'],
    electronConfiguration: [2, 8, 18, 32, 32, 22, 2]
  },

  {
    symbol: 'Mc',
    name: 'Moscovium',
    atomicNumber: 115,
    mass: 290,
    group: 'actinide',
    period: 7,
    block: 'd',
    groupNumber: 8,
    color: GROUP_COLORS.actinide,
    description: 'Künstliches Element. Namensgeber: Moskau. Dubiose Entdeckungsgeschichte.',
    theme: 'history',
    experiments: ['dubios', 'synthese', 'wissenschaft', 'isotope', 'detector', 'superheavy'],
    electronConfiguration: [2, 8, 18, 32, 32, 23, 2]
  },

  {
    symbol: 'Lv',
    name: 'Livermorium',
    atomicNumber: 116,
    mass: 293,
    group: 'actinide',
    period: 7,
    block: 'd',
    groupNumber: 8,
    color: GROUP_COLORS.actinide,
    description: 'Künstliches Element. Namensgeber: Lawrence Livermore National Laboratory. Element 116.',
    theme: 'research',
    experiments: ['element116', 'kernreaktor', 'synthese', 'isotope', 'detector', 'superheavy'],
    electronConfiguration: [2, 8, 18, 32, 32, 24, 2]
  },

  {
    symbol: 'Ts',
    name: 'Tennessin',
    atomicNumber: 117,
    mass: 294,
    group: 'actinide',
    period: 7,
    block: 'd',
    groupNumber: 8,
    color: GROUP_COLORS.actinide,
    description: 'Künstliches Element. Namensgeber: Tennessee (USA). Superheavy-Elemente-Forschung.',
    theme: 'research',
    experiments: ['superheavy', 'inselfstabilität', 'synthese', 'isotope', 'detector', 'halogenanalogue'],
    electronConfiguration: [2, 8, 18, 32, 32, 25, 2]
  },

  {
    symbol: 'Og',
    name: 'Oganesson',
    atomicNumber: 118,
    mass: 294,
    group: 'actinide',
    period: 7,
    block: 'd',
    groupNumber: 8,
    color: GROUP_COLORS.actinide,
    description: 'Schwerstes natürliches Element. Namensgeber: Yuri Oganessian. Insel der Stabilität gesucht.',
    theme: 'discovery',
    experiments: ['inselfstabilität', 'insel', 'theoretisch', 'synthesis', 'isotope', 'noblelike'],
    electronConfiguration: [2, 8, 18, 32, 32, 26, 2]
  }
];

// Get element by atomic number
export function getElementByNumber(atomicNumber) {
  return ELEMENTS.find(e => e.atomicNumber === atomicNumber);
}

// Get element by symbol
export function getElementBySymbol(symbol) {
  return ELEMENTS.find(e => e.symbol === symbol);
}

// Get elements by group
export function getElementsByGroup(group) {
  return ELEMENTS.filter(e => e.group === group);
}

// Get elements by period
export function getElementsByPeriod(period) {
  return ELEMENTS.filter(e => e.period === period);
}

// Experimental Rooms
export const EXPERIMENTAL_ROOMS = [
  {
    id: 'reaction_lab',
    name: 'Reaktionslabor',
    description: 'Die Alchemistenwerkstatt',
    icon: '🧪',
    color: 0xFF6B6B,
    experiments: ['alkali_water', 'thermit', 'elefantenzahnpasta']
  },
  {
    id: 'nuclear_chamber',
    name: 'Nuklearphysik',
    description: 'Kernkraftwerk-Kontrollraum',
    icon: '☢️',
    color: 0x4A69BD,
    experiments: ['fission', 'fusion', 'decay']
  },
  {
    id: 'electrochem_lab',
    name: 'Elektrochemie',
    description: 'Batterien und Elektrolyse',
    ion: '🔋',
    color: 0x74B9FF,
    experiments: ['lion_battery', 'galvanic', 'electrolysis']
  },
  {
    id: 'organic_chem',
    name: 'Organische Chemie',
    description: 'Das Kohlenstoff-Universum',
    icon: '🧬',
    color: 0x20C997,
    experiments: ['dna', 'proteins', 'polymers']
  },
  {
    id: 'extreme_conditions',
    name: 'Extreme Bedingungen',
    description: 'Grenzen der Materie',
    icon: '🌡️',
    color: 0xFFA94D,
    experiments: ['superfluid', 'plasma', 'highpressure']
  },
  {
    id: 'industrial_apps',
    name: 'Industrielle Anwendungen',
    description: 'Großindustrie der Chemie',
    icon: '🏭',
    color: 0x74B9FF,
    experiments: ['haberbosch', 'blastfurnace', 'petrochemical']
  },
  {
    id: 'historical_lab',
    name: 'Historisches Labor',
    description: 'Meilensteine der Entdeckung',
    icon: '🏛️',
    color: 0xD63384,
    experiments: ['marie_curie', 'lavoisier', 'mendeleev']
  },
  {
    id: 'space_chem',
    name: 'Weltraumchemie',
    description: 'Chemie im Kosmos',
    icon: '🚀',
    color: 0x0A0A1A,
    experiments: ['nucleosynthesis', 'meteorites', 'interstellar']
  },
  {
    id: 'nano_world',
    name: 'Nano-Welt',
    description: 'Die atomare Perspektive',
    icon: '🔬',
    color: 0x17A2B8,
    experiments: ['crystals', 'orbitals', 'nanotubes']
  },
  {
    id: 'challenge_arena',
    name: 'Challenge-Arena',
    description: 'Quiz und Wettkampf',
    icon: '🏆',
    color: 0xFFC107,
    experiments: ['quiz', 'puzzle', 'escape_room']
  }
];
