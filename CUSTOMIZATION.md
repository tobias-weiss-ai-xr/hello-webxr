# Customizing Hello WebXR Scene Content

This guide explains how to modify and customize the content in the Hello WebXR experience.

## Project Structure

The scene content is organized into several key areas:

- **`src/assets.js`** - Central registry of all 3D models, textures, panoramas, and audio files
- **`src/rooms/`** - Individual room implementations (Hall, Panorama, Vertigo, etc.)
- **`src/stations/`** - Interactive elements within rooms (PanoBalls, Paintings, InfoPanels, etc.)

## Quick Start: Changing Content

### 1. Modifying Panoramas (360° Images)

The main hall displays 6 interactive panorama spheres. To change them:

**Step 1:** Add your new panorama images to the project:
- Place images in: `assets/` directory
- Supported formats: `.basis` (recommended), `.jpg`, `.png`

**Step 2:** Update `src/assets.js` (lines 27-36):
```javascript
pano2: { url: 'your-panorama-1.basis', options: { encoding: THREE.sRGBEncoding, flipY: false} },
pano3: { url: 'your-panorama-2.basis', options: { encoding: THREE.sRGBEncoding, flipY: false} },
pano4: { url: 'your-panorama-3.basis', options: { encoding: THREE.sRGBEncoding, flipY: false} },
pano5: { url: 'your-panorama-4.basis', options: { encoding: THREE.sRGBEncoding, flipY: false} },
pano6: { url: 'your-panorama-5.basis', options: { encoding: THREE.sRGBEncoding, flipY: false} },
```

**Step 3:** Rebuild the project (see "Building" section below)

### 2. Changing Paintings

The hall displays 5 paintings on the wall. To replace them:

**Step 1:** Add your painting images to `assets/paintings/`

**Step 2:** Update `src/assets.js` (lines 66-70):
```javascript
painting_seurat_tex: { url: 'paintings/your-art-1.basis', options: { encoding: THREE.sRGBEncoding, flipY: false} },
painting_sorolla_tex: { url: 'paintings/your-art-2.basis', options: { encoding: THREE.sRGBEncoding, flipY: false} },
painting_bosch_tex: { url: 'paintings/your-art-3.basis', options: { encoding: THREE.sRGBEncoding, flipY: false} },
painting_degas_tex: { url: 'paintings/your-art-4.basis', options: { encoding: THREE.sRGBEncoding, flipY: false} },
painting_rembrandt_tex: { url: 'paintings/your-art-5.basis', options: { encoding: THREE.sRGBEncoding, flipY: false} },
```

### 3. Changing Info Panel Text

Information panels throughout the experience display titles and descriptions. To modify:

**File:** `src/stations/InfoPanelsData.js`

Each panel entry looks like this:
```javascript
{
  title: '360 Panoramas',
  description: 'Photographs wrapped around spheres provide an environment, but without stereo effect nor depth.',
  offsety: 0.04
}
```

Modify the `title` and `description` fields to change what's displayed.

### 4. Replacing 3D Models

#### Main Hall Model
- **Asset key:** `hall_model`
- **File:** `assets/hall.glb`
- **Update:** `src/assets.js` line 6

```javascript
hall_model: { url: 'your-hall-model.glb' },
```

#### Vertigo Room Model
- **Asset key:** `vertigo_model`
- **File:** `assets/vertigo.glb`
- **Update:** `src/assets.js` line 43

#### Photogrammetry Object
- **Asset key:** `pg_object_model`
- **File:** `assets/angel.min.glb`
- **Update:** `src/assets.js` line 60

#### Sound Room Model
- **Asset key:** `sound_model`
- **File:** `assets/sound.glb`
- **Update:** `src/assets.js` line 49

**Important:** When replacing models, maintain the same object names in your 3D model that the code expects:
- `doorA`, `doorB`, `doorC`, `doorD` - Door meshes
- `teleport` - Teleportation floor area
- `panoball1` through `panoball6` - Panorama ball positions
- `screen` - Info panel display area

### 5. Changing Textures and Materials

#### Skybox/Background
```javascript
// src/assets.js, lines 11-12
sky_tex: { url: 'your-sky.png', options: { encoding: THREE.sRGBEncoding, flipY: false} },
clouds_tex: { url: 'your-clouds.basis', options: { encoding: THREE.sRGBEncoding, flipY: false} },
```

#### Hall Lightmap
```javascript
// src/assets.js, line 8
lightmap_tex: { url: 'your-lightmap.jpg', options: { encoding: THREE.sRGBEncoding, flipY: false} },
```

#### Door Effects
```javascript
// src/assets.js, line 10
doorfx_tex: { url: 'your-door-effect.basis', options: { wrapT: THREE.RepeatWrapping, wrapS: THREE.RepeatWrapping }},
```

### 6. Modifying Audio

Background music and sound effects are defined in `src/assets.js` (lines 72-78):

```javascript
birds_snd: { url: 'ogg/birds.ogg' },
chopin_snd: { url: 'ogg/chopin.ogg' },
forest_snd: { url: 'ogg/forest.ogg' },
wind_snd: { url: 'ogg/wind.ogg' },
teleport_a_snd: { url: 'ogg/teleport_a.ogg' },
teleport_b_snd: { url: 'ogg/teleport_b.ogg' }
```

Replace these files in `assets/ogg/` with your own audio files (OGG format recommended).

## Building the Project

After making changes to assets or code, you need to rebuild:

### Development Build
```bash
npm install
npm run build
```

This creates `bundle.js` which can be tested by opening `index.html` in a browser.

### Docker Build
```bash
docker compose build --no-cache
docker compose up -d
```

## Image Format Recommendations

For best performance and quality:

1. **Basis Universal (.basis)** - Recommended for most textures
   - Excellent compression
   - GPU-native format
   - Use [Basis Universal CLI](https://github.com/BinomialLLC/basis_universal) to convert

2. **JPEG/JPG** - Good for photographs
   - Better compression than PNG
   - No transparency support

3. **PNG** - Use when you need transparency
   - Lossless compression
   - Alpha channel support

## Room Customization

Each room has its own configuration file:

- **`src/rooms/Hall.js`** - Main hub room
- **`src/rooms/Panorama.js`** - 360° panorama viewer
- **`src/rooms/PanoramaStereo.js`** - Stereo panorama room
- **`src/rooms/Vertigo.js`** - Vertigo experience
- **`src/rooms/PhotogrammetryObject.js`** - 3D object viewer
- **`src/rooms/Sound.js`** - Audio room

To modify a specific room's behavior, edit the corresponding file.

## Station Customization

Interactive stations (the "toys" in the main hall):

- **`src/stations/PanoBalls.js`** - Floating panorama spheres
- **`src/stations/Paintings.js`** - Wall paintings
- **`src/stations/InfoPanels.js`** - Information displays
- **`src/stations/Xylophone.js`** - Musical instrument
- **`src/stations/Graffiti.js`** - Drawing tool
- **`src/stations/NewsTicker.js`** - Scrolling text

## Common Tasks

### Add a New Panorama
1. Add image file to `assets/`
2. Add entry in `src/assets.js`
3. Update `NUM_PANOBALLS` in `src/stations/PanoBalls.js` if adding more than 6
4. Rebuild

### Remove a Room
1. Edit `src/index.js` lines 46-51
2. Remove the room from the `rooms` array:
```javascript
var rooms = [
  roomHall,
  roomSound,
  // roomPhotogrammetryObject,  // Comment out to remove
  roomVertigo,
  roomPanorama,
  roomPanoramaStereo,
];
```

### Change Starting Room
1. Edit `src/index.js` line 46
2. Reorder the `rooms` array - the first room is the starting point

## Tips

- Keep model file sizes under 10MB for web performance
- Use `.basis` format for textures to reduce download size
- Test changes in a browser before deploying
- The browser console will show loading errors if assets are missing
- For texture conversion: `basisu -q 255 input.png -output output.basis`

## Further Reading

- [Three.js Documentation](https://threejs.org/docs/)
- [WebXR Specification](https://immersive-web.github.io/webxr/)
- [Basis Universal Tools](https://github.com/BinomialLLC/basis_universal/wiki)
- [glTF Format](https://www.khronos.org/gltf/)
