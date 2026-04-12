#!/bin/bash

# Docker deployment script for hello-webxr (Babylon.js + Vite)
set -e

echo "=== Rebuilding hello-webxr Docker image ==="
echo ""

# Step 1: Build the image
echo "Step 1: Building Docker image..."
docker compose build --no-cache

# Step 2: Stop existing container
echo ""
echo "Step 2: Stopping existing container..."
docker compose down || true

# Step 3: Start the container
echo ""
echo "Step 3: Starting container..."
docker compose up -d

# Step 4: Verify it's running
echo ""
echo "Step 4: Verifying deployment..."
sleep 3

if docker ps | grep -q hello-webxr; then
  echo "✅ Container is running!"
  echo ""
  echo "Site available at: https://pse.chemie-lernen.org"
  echo ""
  echo "=== Next steps ==="
  echo "1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)"
  echo "2. Open https://pse.chemie-lernen.org"
  echo "3. Verify loading screen disappears and 3D scene appears"
else
  echo "❌ Container failed to start!"
  echo "Check logs with: docker compose logs"
  exit 1
fi
