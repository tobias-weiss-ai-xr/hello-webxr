# Converting spider.blend to spider.glb

## Method 1: Using Blender Desktop Application (Recommended)

1. **Open Blender** (download from https://www.blender.org/download/ if not installed)

2. **Open the spider.blend file:**
   - File > Open > select `/home/weiss/git/hello-webxr/assets/spider.blend`

3. **Export to GLB format:**
   - File > Export > glTF 2.0 (.glb/.gltf)
   - Set:
     - Format: GLB (.glb binary)
     - Include: ✓ Selected Objects (if only spider is selected)
     - Mesh: ✓ Export Tessellated
     - Transform: ✓ +Y Up (Blender default)
   - Click "Export glTF 2.0 binary"
   - Save as: `/home/weiss/git/hello-webxr/assets/spider.glb`

4. **Optional - Export texture separately:**
   - If the model has textures, you may want to convert them to Basis format
   - See Method 3 below

## Method 2: Using Blender Command Line

If you have Blender installed system-wide:

```bash
# Navigate to assets directory
cd /home/weiss/git/hello-webxr/assets

# Convert using Blender's Python API
blender -b spider.blend -o spider.glb --python-expr "import bpy; bpy.ops.export_scene.gltf(filepath='spider.glb', export_format='GLB')"
```

## Method 3: Convert Textures to Basis Format (Optional)

If your spider has textures and you want to optimize them:

1. **Install Basis Universal:**
   ```bash
   # Download from GitHub
   cd /tmp
   wget https://github.com/BinomialLLC/basis_universal/releases/download/1.16/toktx_linux_x64_64_release -O toktx
   chmod +x toktx
   sudo mv toktx /usr/local/bin/
   ```

2. **Convert textures:**
   ```bash
   # Export texture from Blender first (as PNG/JPG)
   # Then convert:
   basisu -q 255 spider_texture.png -o spider.basis
   ```

## Method 4: Online Conversion

If you don't have Blender installed:

1. Visit: https://anyconv.com/blend-to-glb-converter/
2. Upload `spider.blend`
3. Download the converted `spider.glb`
4. Place it in `/home/weiss/git/hello-webxr/assets/`

## After Conversion

Once you have `spider.glb` in the assets folder:

```bash
cd /home/weiss/git/hello-webxr
npm run build
docker compose build
docker compose up -d
```

## Testing

Access the spider room:
- Navigate through doors from the Vertigo room (room 3)
- Or use direct URL: `http://localhost/?room=spider`

## Troubleshooting

**Issue: Spider appears too small/large**
- Edit `src/rooms/Spider.js` line 25
- Adjust `spider.scale.set(0.5, 0.5, 0.5)` to different values

**Issue: Spider is in wrong position**
- Edit `src/rooms/Spider.js` line 24
- Adjust `spider.position.y` value

**Issue: Texture not showing**
- Check if texture file is named correctly (spider.basis or spider.png)
- Ensure texture is in the assets folder
- The code will automatically apply spider_tex if available
