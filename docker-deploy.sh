#!/bin/bash

# Docker deployment script for hello-webxr
# Rebuild and deploy the Docker container with fixed code

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
  echo "=== Testing deployment ==="
  echo "Checking bundle.js in container..."
  docker exec hello-webxr ls -lh /usr/share/nginx/html/bundle.js
  echo ""
  echo "Site should be available at: https://chemie-lernen.org/pse-in-vr/"
  echo ""
  echo "=== Next steps ==="
  echo "1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)"
  echo "2. Open https://chemie-lernen.org/pse-in-vr/"
  echo "3. Check console - 'classList' error should be gone"
  echo "4. Loading screen should disappear and app should start"
else
  echo "❌ Container failed to start!"
  echo "Check logs with: docker compose logs"
  exit 1
fi
