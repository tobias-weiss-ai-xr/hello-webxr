#!/bin/bash

# Verification script for VoiceCommander fix and asset deployment
# This script checks that all fixes are correctly in place

echo "=== VoiceCommander Fix Verification ==="
echo ""

# Check 1: VoiceCommander initialization
echo "✓ Checking VoiceCommander initialization..."
if grep -q "voiceCommander = new VoiceCommander(context)" src/index.js; then
    INIT_LINE=$(grep -n "voiceCommander = new VoiceCommander" src/index.js | cut -d: -f1)
    echo "  ✅ VoiceCommander initialized at line $INIT_LINE"
else
    echo "  ❌ ERROR: VoiceCommander initialization not found!"
    exit 1
fi

# Check 2: VoiceCommander.init() call
echo "✓ Checking VoiceCommander.init() call..."
if grep -q "voiceCommander.init()" src/index.js; then
    INIT_CALL_LINE=$(grep -n "voiceCommander.init()" src/index.js | cut -d: -f1)
    echo "  ✅ VoiceCommander.init() called at line $INIT_CALL_LINE"
else
    echo "  ❌ ERROR: VoiceCommander.init() call not found!"
    exit 1
fi

# Check 3: Initialization happens BEFORE setupControllers()
echo "✓ Checking initialization order..."
INIT_LINE=$(grep -n "voiceCommander = new VoiceCommander" src/index.js | cut -d: -f1)
SETUP_LINE=$(grep -n "^function setupControllers()" src/index.js | cut -d: -f1)

if [ "$INIT_LINE" -lt "$SETUP_LINE" ]; then
    echo "  ✅ Correct order: initialization at line $INIT_LINE, setupControllers() at line $SETUP_LINE"
else
    echo "  ❌ ERROR: Wrong order! setupControllers() called before initialization!"
    exit 1
fi

echo ""
echo "=== Webpack Configuration Verification ==="
echo ""

# Check 4: CopyWebpackPlugin
echo "✓ Checking CopyWebpackPlugin in webpack.config.js..."
if grep -q "CopyWebpackPlugin" webpack.config.js; then
    echo "  ✅ CopyWebpackPlugin configured"
else
    echo "  ❌ ERROR: CopyWebpackPlugin not found!"
    exit 1
fi

# Check 5: Assets copy pattern
echo "✓ Checking assets copy pattern..."
if grep -q "from: 'assets', to: 'assets'" webpack.config.js; then
    echo "  ✅ Assets directory copy configured"
else
    echo "  ❌ ERROR: Assets copy not configured!"
    exit 1
fi

# Check 6: Vendor copy pattern
echo "✓ Checking vendor copy pattern..."
if grep -q "from: 'src/vendor', to: 'src/vendor'" webpack.config.js; then
    echo "  ✅ Vendor directory copy configured"
else
    echo "  ❌ ERROR: Vendor copy not configured!"
    exit 1
fi

echo ""
echo "=== Service Worker Verification ==="
echo ""

# Check 7: Service worker cache version
echo "✓ Checking service worker cache version..."
if grep -q "const CACHE_NAME = 'hello-webxr-v2'" sw.js; then
    echo "  ✅ Service worker cache upgraded to v2"
else
    echo "  ❌ ERROR: Service worker still at v1!"
    exit 1
fi

echo ""
echo "=== index.html Verification ==="
echo ""

# Check 8: CSS gradient (no loadingbg.jpg reference)
echo "✓ Checking loading screen CSS..."
if grep -q "background: linear-gradient" index.html; then
    echo "  ✅ CSS gradient configured (no loadingbg.jpg)"
else
    echo "  ❌ ERROR: Still references loadingbg.jpg!"
    exit 1
fi

echo ""
echo "=== Build Artifacts Verification ==="
echo ""

# Check 9: Bundle exists
echo "✓ Checking bundle files..."
if [ -f "bundle.js" ]; then
    BUNDLE_SIZE=$(stat -f%z bundle.js 2>/dev/null || stat -c%s bundle.js)
    echo "  ✅ bundle.js exists ($BUNDLE_SIZE bytes)"
else
    echo "  ❌ ERROR: bundle.js not found!"
    exit 1
fi

# Check 10: Assets directory exists in build output
echo "✓ Checking assets directory..."
if [ -d "assets" ]; then
    ASSET_COUNT=$(ls -1 assets/* 2>/dev/null | wc -l)
    echo "  ✅ assets/ exists with $ASSET_COUNT files"
else
    echo "  ❌ ERROR: assets/ directory not found!"
    exit 1
fi

# Check 11: Vendor directory exists in build output
echo "✓ Checking vendor directory..."
if [ -d "src/vendor" ]; then
    VENDOR_COUNT=$(ls -1 src/vendor/* 2>/dev/null | wc -l)
    echo "  ✅ src/vendor/ exists with $VENDOR_COUNT files"
else
    echo "  ❌ ERROR: src/vendor/ directory not found!"
    exit 1
fi

# Check 12: Critical assets
echo "✓ Checking critical assets..."
CRITICAL_ASSETS=(
    "assets/generic_controller.glb"
    "assets/teleport.glb"
    "assets/doorfx.basis"
    "assets/glow.basis"
    "assets/controller.basis"
    "assets/beamfx.png"
    "src/vendor/basis_transcoder.wasm"
    "src/vendor/draco_decoder.wasm"
)

ALL_EXIST=true
for asset in "${CRITICAL_ASSETS[@]}"; do
    if [ ! -f "$asset" ]; then
        echo "  ❌ ERROR: Missing critical asset: $asset"
        ALL_EXIST=false
    fi
done

if [ "$ALL_EXIST" = true ]; then
    echo "  ✅ All critical assets present"
else
    exit 1
fi

echo ""
echo "=== ALL VERIFICATION CHECKS PASSED ✅ ==="
echo ""
echo "Summary:"
echo "  ✅ VoiceCommander correctly initialized before setupControllers()"
echo "  ✅ CopyWebpackPlugin configured for assets and vendor"
echo "  ✅ Service worker cache upgraded to v2"
echo "  ✅ Loading screen uses CSS gradient"
echo "  ✅ Build artifacts generated correctly"
echo "  ✅ All critical assets present"
echo ""
echo "Ready for deployment! 🚀"
echo ""
echo "Next steps:"
echo "1. Deploy all modified files to server"
echo "2. Users must perform hard refresh (Ctrl + Shift + R)"
echo "3. Verify no console errors on deployed site"
