#!/bin/bash

# Deployment script for hello-webxr
# This script identifies which files need to be deployed to update the site

 echo "=== Files to deploy to https://chemie-lernen.org/pse-in-vr/ ==="
 echo ""
 echo "Required files (UPDATED - must upload):"
 echo "  - bundle.js (67KB - contains all app code)"
 echo "  - 1.bundle.js (~688KB - Three.js library)"
 echo "  - 2.bundle.js (~75KB - vendor libraries)"
 echo "  - index.html (updated with CSS gradient)"
 echo ""
 echo "Required directories (NEW - must upload):"
 echo "  - assets/ (3D models, textures, audio)"
 echo "  - src/vendor/ (Basis transcoder, Draco decoder)"
 echo ""
 echo "Optional files (if changed):"
 echo "  - *.map files (source maps for debugging)"
 echo "  - sw.js (service worker, if modified)"
 echo ""
 echo "=== Instructions ==="
 echo "1. Copy these files and directories to your server's pse-in-vr directory"
 echo "2. Or use SCP/SFTP to upload (recursive for directories):"
 echo "   scp bundle.js 1.bundle.js 2.bundle.js index.html user@server:/path/to/chemie-lernen.org/pse-in-vr/"
 echo "   scp -r assets src/vendor user@server:/path/to/chemie-lernen.org/pse-in-vr/"
 echo ""
 echo "=== Verification ==="
 echo "After upload, verify site works by checking:"
 echo "  - No 404 errors for assets/*.glb, assets/*.basis, assets/*.png"
 echo "  - No 404 errors for src/vendor/*.wasm files"
 echo "  - Bundle size is ~67KB"
  echo "  - Loading screen with gradient appears and app starts"
  echo ""

# Check if build is current
if [ -f "bundle.js" ]; then
  BUNDLE_SIZE=$(stat -f%z bundle.js 2>/dev/null || stat -c%s bundle.js 2>/dev/null)
  EXPECTED_SIZE=65536  # ~64KB

  if [ "$BUNDLE_SIZE" -lt "$EXPECTED_SIZE" ]; then
    echo "✅ Bundle built successfully ($BUNDLE_SIZE bytes)"
    echo "✅ Ready to deploy!"
  else
    echo "⚠️  Bundle size is larger than expected ($BUNDLE_SIZE bytes)"
    echo "   May still contain duplicate code. Run 'npm run build' again."
  fi
else
  echo "❌ bundle.js not found. Run 'npm run build' first."
fi
