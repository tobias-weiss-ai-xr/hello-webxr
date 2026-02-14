# src/shaders - GLSL Shader Sources

Raw GLSL vertex and fragment shaders for 3D effects.

---

## FILES
| File | Purpose |
|------|---------|
| `basic.vert.glsl` | Basic vertex shader |
| `beam.frag.glsl` | Beam/glow effect |
| `door.frag.glsl` | Door transition effect |
| `panoball.frag.glsl` | Panorama ball effect |
| `panoball.vert.glsl` | Panorama ball vertex shader |
| `zoom.frag.glsl` | Zoom/blur effect |

---

## WORKFLOW

1. **Edit shaders** in `src/shaders/*.glsl`
2. **Repack** to update runtime bundle:
   ```bash
   python packshaders.py [seconds]
   ```
3. **Use shaders** via `ctx.shaders` in room code:
   ```javascript
   ctx.shaders.basicVertex
   ctx.shaders.beamFragment
   ```

---

## PATTERN

All shaders compiled into `src/lib/shaders.js` as packed string.

---

## USAGE

```javascript
// In room setup()
const material = new THREE.ShaderMaterial({
  vertexShader: ctx.shaders.panoballVertex,
  fragmentShader: ctx.shaders.panoballFragment,
  uniforms: { time: { value: 0 } }
});

// In execute()
material.uniforms.time.value = time;
```

---

## NOTES

- `packshaders.py` watches for changes (optional `seconds` param)
- Default watch interval: 5 seconds
- Do NOT import shaders directly - use `ctx.shaders`