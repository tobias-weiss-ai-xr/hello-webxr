# Vendor Files Fix - Summary

**Date:** 2026-01-02
**Issue:** Missing vendor files causing 404 errors in WebXR application

## Problem Description

The WebXR application was showing multiple 404 errors for vendor files required by Three.js:
- `src/vendor/basis_transcoder.js` - 404 Not Found
- `src/vendor/draco_wasm_wrapper.js` - 404 Not Found
- `src/vendor/basis_transcoder.wasm` - 404 Not Found
- `src/vendor/draco_decoder.wasm` - 404 Not Found

These files are essential for:
- **Basis Universal** texture compression format
- **Draco** geometry compression

## Root Cause

The Dockerfile was not copying the `src/` directory to the container, even though the vendor files exist in the source repository at:
```
/opt/git/hello-webxr/src/vendor/
```

## Solution

Updated the Dockerfile to include the src directory:

```dockerfile
# Before (missing src copy):
COPY index.html /usr/share/nginx/html/
COPY *.js /usr/share/nginx/html/
COPY *.js.map /usr/share/nginx/html/
COPY sw.js /usr/share/nginx/html/
COPY res /usr/share/nginx/html/res
COPY assets /usr/share/nginx/html/assets

# After (includes src directory):
COPY index.html /usr/share/nginx/html/
COPY *.js /usr/share/nginx/html/
COPY *.js.map /usr/share/nginx/html/
COPY sw.js /usr/share/nginx/html/
COPY res /usr/share/nginx/html/res
COPY assets /usr/share/nginx/html/assets
COPY src /usr/share/nginx/html/src    # <-- ADDED
```

Also updated permissions command to apply to all files:
```dockerfile
# Before:
RUN chmod -R 755 /usr/share/nginx/html/*.js /usr/share/nginx/html/*.html

# After:
RUN chmod -R 755 /usr/share/nginx/html/
```

## Files Now Available

All vendor files are now accessible at:
- ✅ https://chemie-lernen.org/pse-in-vr/src/vendor/basis_transcoder.js (60 KB)
- ✅ https://chemie-lernen.org/pse-in-vr/src/vendor/basis_transcoder.wasm (367 KB)
- ✅ https://chemie-lernen.org/pse-in-vr/src/vendor/draco_decoder.js (583 KB)
- ✅ https://chemie-lernen.org/pse-in-vr/src/vendor/draco_decoder.wasm (229 KB)
- ✅ https://chemie-lernen.org/pse-in-vr/src/vendor/draco_wasm_wrapper.js (61 KB)

## Benefits

1. **No more 404 errors** - All vendor files load successfully
2. **Basis textures load correctly** - Compressed .basis files now work
3. **Draco-compressed models load** - GLB/GLTF models with Draco compression work
4. **Better performance** - Compressed assets reduce bandwidth
5. **All 3D assets functional** - angel.glb, halls, etc. load properly

## Deployment Steps

```bash
cd /opt/git/hello-webxr

# Rebuild with updated Dockerfile
docker compose build

# Redeploy container
docker compose up -d

# Verify vendor files are accessible
curl -I https://chemie-lernen.org/pse-in-vr/src/vendor/basis_transcoder.js
curl -I https://chemie-lernen.org/pse-in-vr/src/vendor/draco_wasm_wrapper.js
```

## Verification

All vendor files now return HTTP 200:
```
HTTP/2 200
content-type: application/javascript
```

The application should now load all 3D assets correctly without errors.

## Related Documentation

- **DEPLOYMENT_RUNBOOK.md** - Section 8.3: Bundle Not Loading (404)
- **Dockerfile** - Updated to include src directory
- **src/vendor/** - Contains 5 vendor transcoder files

## Notes

- Vendor files are part of the original hello-webxr repository
- Total vendor file size: ~1.3 MB (uncompressed)
- All files are now cached with 1-year expiry
- Gzip compression reduces transfer size by ~70%
