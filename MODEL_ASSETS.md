# 3D Models and Assets - Structure Guide

## Directory Structure

```
assets/
├── elements/              # Individual element 3D models
│   ├── hydrogen.glb       # H - simplest element
│   ├── helium.glb         # He - noble gas
│   ├── lithium.glb         # Li - alkali metal
│   ├── beryllium.glb      # Be - alkaline earth
│   ├── boron.glb          # B - metalloid
│   ├── carbon.glb          # C - diamond/graphite
│   ├── nitrogen.glb         # N - atmospheric gas
│   ├── oxygen.glb          # O - life gas
│   ├── fluorine.glb        # F - most reactive
│   ├── neon.glb            # Ne - glowing gas
│   ├── sodium.glb          # Na - salt metal
│   ├── magnesium.glb        # Mg - flammable
│   ├── aluminum.glb         # Al - lightweight
│   ├── silicon.glb          # Si - semiconductor
│   ├── phosphorus.glb       # P - fire
│   ├── sulfur.glb          # S - volcano
│   ├── chlorine.glb         # Cl - toxic gas
│   ├── argon.glb           # Ar - welding
│   ├── potassium.glb        # K - biological
│   ├── calcium.glb          # Ca - bones
│   ├── iron.glb            # Fe - forge
│   ├── copper.glb           # Cu - electric
│   ├── gold.glb            # Au - treasure
│   └── uranium.glb          # U - nuclear
│
├── molecules/            # Compound molecular models
│   ├── water.glb          # H2O - essential
│   ├── carbon_dioxide.glb  # CO2 - climate
│   ├── methane.glb         # CH4 - fuel
│   ├── salt.glb            # NaCl - ionic
│   ├── oxygen.glb          # O2 - breath
│   ├── nitrogen.glb         # N2 - air
│   ├── glucose.glb         # C6H12O6 - energy
│   ├── dna.glb             # DNA - life code
│   └── ammonia.glb          # NH3 - fertilizer
│
├── compounds/            # Material compounds
│   ├── steel.glb           # Fe + C alloy
│   ├── bronze.glb           # Cu + Sn alloy
│   ├── brass.glb            # Cu + Zn alloy
│   ├── quartz.glb           # SiO2 crystal
│   ├── diamond.glb          # C crystal structure
│   └── graphite.glb         # C layered structure
│
└── experimental/         # Specialized experiment models
    ├── bunsen_burner.glb      # Reactions
    ├── beaker.glb               # Chemical reactions
    ├── test_tube.glb            # Mixtures
    ├── battery_cell.glb          # Electrochemical
    ├── solar_panel.glb           # Energy
    ├── magnet.glb               # Physics
    ├── dna_double_helix.glb      # Organic
    ├── crystal_lattice.glb       # Solids
    └── particle_emitter.glb      # Reactions
```

## Model Specifications

### Element Models
- **Format**: GLB (binary GLTF preferred for VR)
- **Poly count**: <10,000 triangles per model
- **Scale**: Unit sphere ~0.5m diameter
- **Origin**: Center at (0,0,0)
- **Texture**: 512x512 or 1024x1024 max
- **LODs**: Optional (2-3 levels)

### Molecule Models
- **Format**: GLB
- **Poly count**: <5,000 triangles
- **Scale**: Bond length ~0.5m
- **Atoms**: Separate meshes with proper colors
- **Bonds**: Cylinders with proper thickness (~0.05m)
- **Animations**: Optional bond rotation

### Compound Models
- **Format**: GLB
- **Poly count**: <8,000 triangles
- **Scale**: 1-2m total dimension
- **Detail**: Macro structure visible
- **Materials**: Metallic or crystalline as appropriate

## Procedural Fallbacks

When model files are missing, the system falls back to procedual generation:

| Element Type | Procedural Style |
|-------------|------------------|
| **H** | Small sphere with glow (cosmic) |
| **He, Ne, Ar, Kr, Xe, Rn** | Glowing gas bubbles with noble gas colors |
| **Alkali metals (Li, Na, K, etc.)** | Shiny metallic spheres with high metalness |
| **Alkaline earth (Be, Mg, Ca, etc.)** | Slightly larger metallic spheres |
| **Transition metals (Fe, Cu, Au, etc.)** | Icosahedral crystals with metallic shine |
| **Metalloids (B, Si, Ge, etc.)** | Octahedral or crystalline shapes |
| **Nonmetals (C, N, O, etc.)** | Simple spheres with varying roughness |
| **Halogens (F, Cl, Br, I, At)** | Colored spheres with slight transparency |
| **Lanthanides (La-Lu)** | Icosahedral crystals with purple glow |
| **Actinides (Ac-No)** | Radioactive glow with green emissions |

## Loading System

### Asset Paths (in `src/lib/modelLoader.js`)

```javascript
const ASSET_PATHS = {
  elementModels: {
    'H': 'assets/elements/hydrogen.glb',
    'C': 'assets/elements/carbon.glb',
    // ... more elements
  },
  moleculeModels: {
    'H2O': 'assets/molecules/water.glb',
    'CO2': 'assets/molecules/carbon_dioxide.glb',
    // ... more molecules
  },
  compoundModels: {
    'steel': 'assets/compounds/steel.glb',
    'bronze': 'assets/compounds/bronze.glb',
    // ... more compounds
  }
};
```

### Usage

```javascript
import { createElementDisplay, loadElementModel, loadMoleculeModel } from '../lib/modelLoader.js';

// Auto-detect themed display based on element.theme property
const display = createElementDisplay(element, element.theme);

// Or load specific GLB model
loadElementModel(element, (model, error) => {
  if (!error) {
    scene.add(model);
  }
});

// Load molecule visualization
loadMoleculeModel('H2O', ELEMENTS, (model, error) => {
  if (!error) {
    scene.add(model);
  }
});
```

## Performance Guidelines

### Optimization
1. **LOD Levels**: 3 levels (high/medium/low)
2. **Texture Compression**: Use compressed formats where possible
3. **Draw Calls**: Merge geometries when possible
4. **Material Count**: Reuse materials across similar objects

### VR Considerations
1. **Polygon Budget**: 50,000-100,000 triangles per scene max
2. **Texture Budget**: <256MB total textures
3. **Frame Rate Target**: 72 FPS minimum, 90 FPS preferred
4. **Distance Culling**: Enable/disable objects based on camera distance

## Creating Models

### Recommended Tools
- **Blender** (Free, Open Source)
  - Export as GLB
  - Apply `glTF 2.0` exporter settings
  - Include -DRACO compression
- **Maya** (Commercial)
- **3ds Max** (Commercial)

### Export Settings (Blender)
```
Format: glTF 2.0 (.glb)
Include: Selected Objects
- Mesh
- Apply Modifiers
  ✓
Transform:
- Forward: +Z Forward
- Up: +Y Up
Apply:
  Scale: All
Geometry:
- Tangents
- Normals
Mesh:
- UVs
  ✓
- Apply Modifiers
  ✓
Compression:
- Draco Compression
  ✓
Compression Level: 6
```

### Texture Guidelines
- **Format**: PNG or JPEG (compressed)
- **Size**: 512x512 for normal props, 1024x1024 for hero elements
- **Color Space**: sRGB
- **Normal Maps**: DirectX format (+Y up)
- **Metalness/Roughness**: Packed if possible (RGB = OMR)

## Animation Support

Element displays can include animations:

1. **Idle Animations**:
   - Gentle rotation
   - Subtle bobbing
   - Glow pulsing (for radioactive/luminous elements)

2. **Interaction Animations**:
   - On hover: scale up 1.2x
   - On select: flash/emit particles
   - On release: return to normal

3. **Particle Effects**:
   - Combustion flames
   - Bubbling (liquids)
   - Sparking (electrical)
   - Radiation glow (radioactive)

## Quality Assurance

### Checklist for new models
- [ ] Model loads without errors
- [ ] Scale matches other elements (~0.5m diameter)
- [ ] Materials render correctly (not all black)
- [ ] Normals face outward
- [ ] UV maps are not stretched
- [ ] Animation plays if present
- [ ] Polygon count under budget
- [ ] Triangle count <10,000 per element
- [ ] Tested in VR headset (Oculus Quest, etc.)
- [ ] Frame rate stable (>60 FPS)
- [ ] No visible artifacts (z-fighting, clipping)

## Future Expansion

As more 3D assets are created, update:
1. **ASSET_PATHS** in `src/lib/modelLoader.js`
2. **Element data** in `src/data/elements.js` with model references
3. **Asset directory** with new GLB files
4. **This documentation** with new entries

## Asset Sources

### Free Resources
- **Sketchfab**: Search for "element", "molecule", "atom"
- **Poly Haven**: Open source models
- **Kenney**: Low poly game assets
- **OpenGameArt**: Community assets

### Generation
- **ProcGen**: Use `createThemedElementDisplay()` for custom elements
- **Blender Python**: Automate model generation from chemical formulas
- **Web Services**: Use online molecule generators (PubChem, etc.)

## License Note

All assets should be compatible with project license (check LICENSE file).
Commercial assets may require attribution or separate licensing.
