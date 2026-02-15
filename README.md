# PSE - Periodic Table VR Experience

![screenshot](assets/sshot.jpg)

An immersive WebXR educational visualization for exploring the Periodic Table of Elements in Virtual Reality.

## Features

- 118 element rooms with 3D atomic models
- Interactive electron orbitals and atomic structure
- Experimental chemistry rooms
- VR controller support with teleportation
- Atmospheric visual effects

## How to build

1. `npm install`
2. `npm start`
3. Open `http://localhost:8080`

## Controls

- **N key** - Next room
- **0-9 keys** - Jump to specific room
- **W/A/S/D** - Move camera (desktop)
- **VR Controllers** - Teleport and interact

## Shader packing

If you make changes to the shaders you'll need to repack them:

`python packshaders.py [seconds]`

where `seconds` is an optional parameter (defaults to 5) to define how many seconds to wait until next rebuild.

## Third party content

* Photogrammetry model by Geoffrey Marchal ([Sketchfab](https://sketchfab.com/3d-models/baptismal-angel-kneeling-f45f01c63e514d3bad846e82af640f33))
* 360 Panoramas from [Wikimedia Commons](https://commons.wikimedia.org/wiki/Main_Page)
* Classical Paintings from various public domain sources
* Public Domain sounds from [freesound.org](https://freesound.org)

## License

MIT License - See [LICENSE](LICENSE) for details.
