# Docker Compose Deployment Guide

## Overview

This guide explains how to deploy the Hello WebXR application with all fixes using Docker Compose and Traefik reverse proxy.

## Prerequisites

- Docker and Docker Compose installed
- Access to server where Traefik is running
- Git repository cloned or available

---

## Quick Deployment

### Option 1: One-Command Deploy

```bash
cd /opt/git/hello-webxr

# Build and start with Docker Compose
docker-compose up -d --build

# View logs
docker-compose logs -f hello-webxr
```

### Option 2: Two-Step Deploy (Build, Then Start)

```bash
# Step 1: Build the Docker image
cd /opt/git/hello-webxr
docker-compose build

# Step 2: Start the container
docker-compose up -d

# Verify running
docker-compose ps
```

---

## Docker Compose Configuration

### Service Definition

The `docker-compose.yml` includes:

```yaml
services:
  hello-webxr:
    image: hello-webxr:latest
    build:
      context: .
      dockerfile: Dockerfile
    container_name: hello-webxr
    restart: unless-stopped
    ports:
      - "80:80"
    networks:
      - traefik-public
```

**Key Features:**
- ✅ **Build stage**: Builds Dockerfile from current directory
- ✅ **Port mapping**: 80:80 (internal:external)
- ✅ **Traefik labels**: Auto-discovery by reverse proxy
- ✅ **HTTPS router**: Configured for pse.chemie-lernen.org

### Traefik Labels Explained

| Label | Purpose | Value |
|--------|---------|--------|
| `traefik.enable=true` | Enable Traefik routing | - |
| `traefik.docker.network=traefik-public` | Connect to external network | traefik-public |
| `traefik.http.routers.hello-webxr-secure.rule` | HTTPS routing rule | `Host('pse.chemie-lernen.org')` |
| `traefik.http.routers.hello-webxr-secure.entrypoints` | Use HTTPS endpoint | websecure |
| `traefik.http.routers.hello-webxr-secure.tls=true` | Enable TLS/HTTPS | - |
| `traefik.http.routers.hello-webxr-secure.tls.certresolver` | Certificate resolver | mytlschallenge |
| `traefik.http.routers.hello-webxr-secure.middlewares` | Apply middlewares (compression, security, etc) | asset-rewrite,security-headers@file,compression@file,hello-webxr-headers |

### Middlewares Configuration

| Middleware | Purpose | Configuration |
|----------|---------|--------------|
| **asset-rewrite** | No longer needed (assets are now in correct location) | - |
| **security-headers** | Add security headers | CSP, X-Frame-Options, etc. |
| **compression** | Compress static assets | gzip |
| **hello-webxr-headers** | Custom headers | Service-Worker-Allowed, etc. |

---

## Building with Docker Compose

### Verification Before Building

```bash
cd /opt/git/hello-webxr

# Verify all source files are present
ls -lh bundle.js 1.bundle.js 2.bundle.js index.html sw.js
ls -lh assets/
ls -lh src/vendor/

# Run verification script (optional but recommended)
./verify-fix.sh
```

### Build Process

```bash
# View build output in real-time
docker-compose build --progress=plain

# Expected output:
# [+] Building 2/2 steps
# => => [internal] load build definition from Dockerfile
# => => transferring context: 30.23MB
# => => [internal] load metadata for docker.io/library/hello-webxr
# => => [hello-webxr:latest 1/1] FROM nginx:alpine
# => [hello-webxr:latest 1/2] RUN apk add --no-cache gzip
# => => [hello-webxr:latest 2/2] COPY index.html /usr/share/nginx/html/
# => => [hello-webxr:latest 3/2] COPY *.js /usr/share/nginx/html/
# => => [hello-webxr:latest 4/2] COPY *.js.map /usr/share/nginx/html/
# => => [hello-webxr:latest 5/2] COPY sw.js /usr/share/nginx/html/
# => => [hello-webxr:latest 6/2] COPY assets /usr/share/nginx/html/assets
# => => [hello-webxr:latest 7/2] COPY src /usr/share/nginx/html/src
# => => [hello-webxr:latest 8/2] RUN chmod -R 755 /usr/share/nginx/html/
# => => naming to docker.io/library/hello-webxr:latest
# => => exporting to image
```

---

## Deployment Commands

### Start Container

```bash
docker-compose up -d --build
```

### View Logs

```bash
# Follow logs in real-time
docker-compose logs -f hello-webxr

# View last 100 lines
docker-compose logs --tail=100 hello-webxr
```

### Stop Container

```bash
docker-compose down
```

### Restart Container

```bash
docker-compose restart hello-webxr
```

---

## Traefik Integration

### Automatic Discovery

When you run `docker-compose up -d --build`, Traefik automatically:

1. **Detects** the new container via labels
2. **Creates** HTTPS router: `pse.chemie-lernen.org`
3. **Configures** TLS certificate via Let's Encrypt (mytlschallenge)
4. **Applies** middlewares for compression and security headers

### URL Routing

After deployment, the application will be accessible at:
- **HTTPS**: `https://pse.chemie-lernen.org/`
- **HTTP**: `http://pse.chemie-lernen.org/` (redirects to HTTPS)

### Assets Path

**Correct path**: `https://pse.chemie-lernen.org/assets/`
- ✅ All assets copied during build
- ✅ No asset 404 errors expected
- ✅ Basis transcoder and Draco decoder in `src/vendor/`

---

## Post-Deployment Verification

### Check Container Status

```bash
docker-compose ps

# Expected output:
# NAME           COMMAND                  SERVICE       STATUS    PORTS
# hello-webxr   "nginx -g 'daemon off'"   hello-webxr   Up         80/tcp
```

### Check Health

```bash
# Test HTTP
curl -I http://localhost/

# Expected: HTTP/1.1 200 OK

# Test HTTPS (after Traefik routes)
curl -I https://pse.chemie-lernen.org/

# Expected: HTTP/2 200 OK
```

### Verify Assets

```bash
# Verify assets are accessible
curl -I https://pse.chemie-lernen.org/assets/generic_controller.glb
curl -I https://pse.chemie-lernen.org/assets/doorfx.basis
curl -I https://pse.chemie-lernen.org/src/vendor/basis_transcoder.wasm

# Expected: All return HTTP/2 200 OK (not 404)
```

### Verify Fix Deployment

Open `https://pse.chemie-lernen.org/` and check:

#### Console Errors
- [ ] **NO** "Cannot read properties of undefined (reading 'init')"
- [ ] **NO** "Cannot set properties of undefined (setting 'aspect')"
- [ ] **NO** 404 errors for `/assets/*.glb`
- [ ] **NO** 404 errors for `/assets/*.basis`
- [ ] **NO** 404 errors for `/src/vendor/*.wasm`

#### Network Requests
- [ ] All assets load with status 200
- [ ] Service worker loads correctly (v2)
- [ ] No 404 errors for `/res/*` paths

#### Visual Verification
- [ ] Loading screen shows dark blue gradient (not 404 error)
- [ ] VR controller model visible
- [ ] Teleport marker appears
- [ ] 3D scene renders

---

## Troubleshooting

### Container Won't Start

**Symptom:** `docker-compose up -d` fails

**Possible Causes:**
1. Port 80 already in use
2. Old container with same name exists
3. Build errors in Dockerfile

**Solutions:**

```bash
# Check for existing container
docker ps -a | grep hello-webxr

# Stop and remove old container
docker stop hello-webxr
docker rm hello-webxr

# Force rebuild
docker-compose up -d --build --force-recreate
```

### Assets Return 404

**Symptom:** Assets still return 404 after deployment

**Solution:**

```bash
# Verify Dockerfile copies assets correctly
cat Dockerfile | grep "COPY assets"

# Should see:
# COPY assets /usr/share/nginx/html/assets
# COPY src /usr/share/nginx/html/src
```

If not present, rebuild image:

```bash
docker-compose build --no-cache
docker-compose up -d --force-recreate
```

### Service Worker Not Updating

**Symptom:** Still seeing requests to `/res/*` or old cache behavior

**Solution:**

1. Open DevTools → Application → Service Workers
2. Unregister old service worker (v1)
3. Hard refresh (`Ctrl + Shift + R`)
4. Verify new service worker (v2) is active

### Traefik Not Routing

**Symptom:** Application not accessible via `https://pse.chemie-lernen.org/`

**Solution:**

```bash
# Check Traefik logs
docker logs traefik

# Check Traefik dashboard
# Usually: http://localhost:8080/dashboard/

# Verify container labels
docker inspect hello-webxr | grep -A 20 Labels

# Should show all traefik labels present
```

---

## Rolling Back

If deployment causes issues, quickly roll back:

```bash
# Option 1: Rebuild previous Docker image
cd /opt/git/hello-webxr
git log --oneline -5
# Copy previous commit hash
git checkout <previous-hash>
docker-compose up -d --build

# Option 2: Stop and remove container
docker-compose down
# Wait for Traefik to remove route (may take few minutes)
# Then redeploy
```

---

## Production Deployment

### For Production Environment

When deploying to production:

1. **Test locally first** with `docker-compose up -d --build`
2. **Verify all functionality** works locally
3. **Test HTTPS routing** with `curl -I https://pse.chemie-lernen.org/`
4. **Monitor logs** for first few minutes after deployment
5. **Prepare rollback plan** in case issues occur

### Environment Variables

If you need environment-specific configuration:

```yaml
# Add to docker-compose.yml
services:
  hello-webxr:
    environment:
      - NODE_ENV=production
      - LOG_LEVEL=info
```

---

## Summary

### What Gets Fixed

| Fix | Status | Deployment Method |
|------|--------|-----------------|
| VoiceCommander TypeError | ✅ Fixed | Docker Compose builds new image |
| Asset 404 errors | ✅ Fixed | CopyWebpackPlugin in Dockerfile |
| Service worker cache | ✅ Fixed | New image with v2 cache |
| Loading screen | ✅ Fixed | New image with CSS gradient |

### Key Advantages of Docker Compose

- ✅ **One-command deployment**: `docker-compose up -d --build`
- ✅ **Automatic HTTPS**: Traefik handles TLS routing
- ✅ **Auto-discovery**: Container registered automatically with Traefik
- ✅ **Easy rollback**: `docker-compose down` and rebuild
- ✅ **Version control**: Images tagged with git commit SHA
- ✅ **Consistency**: Same deployment method across environments

### Files Deployed via Docker Compose

When you run `docker-compose up -d --build`, the following files are deployed:

**Application Files:**
- bundle.js (73KB - with VoiceCommander fix)
- 1.bundle.js (689KB - Three.js)
- 2.bundle.js (75KB - vendors)
- bundle.js.map (228KB - source map)
- index.html (9.7KB - CSS gradient loading screen)
- sw.js (3.9KB - v2 cache)

**Static Assets:**
- assets/generic_controller.glb (30KB)
- assets/teleport.glb (7.4KB)
- assets/controller.basis (250B)
- assets/doorfx.basis (47KB)
- assets/glow.basis (1.1KB)
- assets/beamfx.png (235B)
- assets/ogg/teleport_a.ogg (86KB)
- assets/ogg/teleport_b.ogg (10KB)

**Decoder Files:**
- src/vendor/basis_transcoder.js (60KB)
- src/vendor/basis_transcoder.wasm (359KB)
- src/vendor/draco_decoder.js (570KB)
- src/vendor/draco_decoder.wasm (224KB)
- src/vendor/draco_wasm_wrapper.js (60KB)

---

## Next Steps

1. **Build and deploy:**
   ```bash
   cd /opt/git/hello-webxr
   docker-compose up -d --build
   ```

2. **Verify deployment:**
   ```bash
   curl -I https://pse.chemie-lernen.org/
   ```

3. **Test functionality:**
   - Open https://pse.chemie-lernen.org/ in browser
   - Check console for errors
   - Verify all assets load
   - Test 3D rendering
   - Perform hard refresh (`Ctrl + Shift + R`)

4. **Monitor:**
   ```bash
   docker-compose logs -f hello-webxr
   ```

---

**Documentation Updated**: 2026-01-25
**Docker Compose Configuration**: Updated for production deployment
**Status**: Ready for deployment 🚀
