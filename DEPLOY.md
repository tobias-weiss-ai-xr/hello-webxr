# Docker Deployment Instructions for hello-webxr

## Quick Deployment (ON YOUR SERVER)

```bash
# 1. Go to your project directory on the Docker server
cd /path/to/hello-webxr  # or wherever your repo is cloned

# 2. Pull the latest code
git pull origin pse-in-vr

# 3. Run the deployment script
bash docker-deploy.sh
```

## Manual Deployment Steps

```bash
# 1. Stop the running container
docker compose down

# 2. Remove old image (optional, saves space)
docker rmi hello-webxr:latest

# 3. Pull/build new image
docker compose build

# 4. Start container
docker compose up -d

# 5. Verify it's running
docker ps | grep hello-webxr
```

## Verify Deployment

```bash
# Check bundle size in container
docker exec hello-webxr ls -lh /usr/share/nginx/html/bundle.js
# Should show: ~64K (not 95K)

# Check container logs
docker compose logs -f
```

## Clear Browser Cache

After deployment:
1. **Hard refresh**: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
2. **Or clear cache**: F12 → Application → Clear storage → Clear site data
3. **Open**: https://chemie-lernen.org/pse-in-vr/
4. **Check console**: No `classList` error should appear

## Troubleshooting

### Container won't start?
```bash
# Check logs
docker compose logs

# Check if port 80 is available
netstat -tulpn | grep :80
```

### Old code still showing?
```bash
# 1. Verify new image was built
docker images | grep hello-webxr

# 2. Force rebuild without cache
docker compose build --no-cache

# 3. Stop and remove container completely
docker compose down
docker rm hello-webxr  # if container still exists

# 4. Restart
docker compose up -d
```

### Service Worker cached old files?
```bash
# Unregister service worker
# Open browser DevTools → Application → Service Workers
# Click "Unregister" or "Update on reload"

# Or force reload in console
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister());
});
```

## Expected Results After Deployment

✅ bundle.js size: ~64KB (was 95KB)
✅ No `classList` null reference error
✅ Loading screen disappears
✅ App starts and 3D scene appears
✅ Texture warnings still OK (info-level)
