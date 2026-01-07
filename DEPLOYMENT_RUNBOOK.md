# Hello WebXR - Deployment Runbook

**Version:** 1.0.0
**Last Updated:** 2026-01-02
**Environment:** Production
**URL:** https://chemie-lernen.org/pse-in-vr/

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Initial Deployment](#initial-deployment)
5. [Routine Updates](#routine-updates)
6. [Rollback Procedures](#rollback-procedures)
7. [Health Checks](#health-checks)
8. [Troubleshooting](#troubleshooting)
9. [Monitoring](#monitoring)
10. [Maintenance](#maintenance)
11. [Emergency Procedures](#emergency-procedures)
12. [Contact Information](#contact-information)

---

## 1. Overview

### 1.1 Application Details

- **Name:** Hello WebXR
- **Type:** WebXR VR/AR Experience
- **Technology Stack:**
  - Frontend: Three.js, WebXR API, WebGL
  - Build: Webpack 4.47.0
  - Server: Nginx (Alpine Linux)
  - Container: Docker
  - Reverse Proxy: Traefik
  - PWA: Service Worker enabled

### 1.2 Deployment Architecture

```
Internet
    ↓
Traefik (graphwiz-traefik)
    ↓ (Port 443/80)
hello-webxr Container (traefik-public network)
    ↓
Nginx
    ↓
Static Files (HTML/JS/CSS/Assets)
```

### 1.3 Key Features

- ✅ Code splitting (3 bundles)
- ✅ Gzip compression
- ✅ Service Worker (PWA)
- ✅ SEO optimized
- ✅ Performance monitoring
- ✅ Security headers
- ✅ Offline support

---

## 2. Architecture

### 2.1 Network Configuration

- **Docker Network:** `traefik-public`
- **Container Name:** `hello-webxr`
- **Internal Port:** 80
- **External Exposure:** Via Traefik
- **Domain:** chemie-lernen.org
- **Path Prefix:** /pse-in-vr/

### 2.2 File Structure

```
/opt/git/hello-webxr/
├── src/                    # Source code
├── assets/                 # 3D models and textures (106 MB)
├── res/                    # Resources (icons, images)
├── Dockerfile              # Container build
├── docker-compose.yml      # Orchestration
├── webpack.config.js       # Build configuration
├── package.json            # Dependencies
├── index.html              # Main HTML
├── sw.js                   # Service Worker
└── *.js                    # Built bundles
```

### 2.3 Bundle Structure

| File | Size | Description |
|------|------|-------------|
| `bundle.js` | 94.5 KB | Main application code |
| `1.bundle.js` | 688 KB | Three.js + 3D libraries |
| `2.bundle.js` | 237 KB | Other vendors |
| **Total** | **1,020 KB** | **Uncompressed** |

---

## 3. Prerequisites

### 3.1 System Requirements

- **OS:** Linux (Ubuntu 20.04+ or similar)
- **Docker:** 20.10+
- **Docker Compose:** 1.29+
- **Node.js:** 18.x+ (for builds)
- **Nginx:** Via Traefik
- **Memory:** 2GB+ recommended
- **Disk:** 500MB+ for application

### 3.2 Access Requirements

- SSH access to server
- Docker daemon permissions
- Access to Traefik dashboard (optional)
- Git repository access

### 3.3 Pre-Deployment Checklist

- [ ] Docker and Docker Compose installed
- [ ] `traefik-public` network exists
- [ ] Traefik is running and accessible
- [ ] Port 80/443 available
- [ ] Sufficient disk space
- [ ] Backup current version (if updating)

---

## 4. Initial Deployment

### 4.1 First-Time Setup

```bash
# 1. Navigate to project directory
cd /opt/git/hello-webxr

# 2. Install dependencies
npm install

# 3. Build production bundle
NODE_ENV=production npm run build

# 4. Build Docker image
docker compose build

# 5. Start container
docker compose up -d

# 6. Verify deployment
curl -I https://chemie-lernen.org/pse-in-vr/
```

### 4.2 Verify Traefik Network

```bash
# Check if traefik-public network exists
docker network ls | grep traefik-public

# If not exists, create it
docker network create traefik-public
```

### 4.3 Initial Health Check

```bash
# Check container status
docker ps | grep hello-webxr

# Check container logs
docker logs hello-webxr --tail 50

# Test HTTP endpoint
curl -I https://chemie-lernen.org/pse-in-vr/

# Test bundle accessibility
curl -I https://chemie-lernen.org/pse-in-vr/bundle.js
curl -I https://chemie-lernen.org/pse-in-vr/1.bundle.js
curl -I https://chemie-lernen.org/pse-in-vr/2.bundle.js
```

### 4.4 Service Worker Verification

```bash
# Check service worker is accessible
curl -I https://chemie-lernen.org/pse-in-vr/sw.js

# Should return HTTP 200
```

---

## 5. Routine Updates

### 5.1 Standard Update Procedure

```bash
# 1. Navigate to project directory
cd /opt/git/hello-webxr

# 2. Pull latest code (if using git)
git pull origin main

# 3. Install new dependencies (if package.json changed)
npm install

# 4. Build new bundle
NODE_ENV=production npm run build

# 5. Rebuild Docker image
docker compose build

# 6. Recreate container (zero downtime if using health checks)
docker compose up -d

# 7. Verify deployment
./verify-deployment-simple.js

# 8. Check logs
docker logs hello-webxr --tail 20
```

### 5.2 Quick Code Changes

If only HTML/CSS/JS changed (no dependencies):

```bash
cd /opt/git/hello-webxr
npm run build
docker compose up -d --build
```

### 5.3 Dependency Updates

If `package.json` changed:

```bash
cd /opt/git/hello-webxr
rm -rf node_modules package-lock.json
npm install
NODE_ENV=production npm run build
docker compose build --no-cache
docker compose up -d
```

### 5.4 Asset Updates

For changes to assets/ or res/:

```bash
cd /opt/git/hello-webxr
docker compose build
docker compose up -d
```

### 5.5 Post-Deployment Verification

```bash
# Run automated tests
node performance-test.js
node final-test-report.js

# Check all bundles
curl -sI https://chemie-lernen.org/pse-in-vr/bundle.js | grep "HTTP"
curl -sI https://chemie-lernen.org/pse-in-vr/1.bundle.js | grep "HTTP"
curl -sI https://chemie-lernen.org/pse-in-vr/2.bundle.js | grep "HTTP"

# Verify service worker
curl -sI https://chemie-lernen.org/pse-in-vr/sw.js | grep "HTTP"

# Check page loads
curl -s https://chemie-lernen.org/pse-in-vr/ | grep "Hello WebXR"
```

---

## 6. Rollback Procedures

### 6.1 Quick Rollback (Previous Image)

```bash
# 1. List recent images
docker images | grep hello-webxr

# 2. Stop current container
docker compose down

# 3. Revert to previous image (replace <IMAGE_ID>)
docker tag <PREVIOUS_IMAGE_ID> hello-webxr:latest

# 4. Start container
docker compose up -d

# 5. Verify rollback
curl -I https://chemie-lerne.org/pse-in-vr/
```

### 6.2 Rollback Using Git

```bash
# 1. View commit history
git log --oneline -10

# 2. Checkout previous version
git checkout <COMMIT_HASH>

# 3. Rebuild and deploy
NODE_ENV=production npm run build
docker compose build
docker compose up -d
```

### 6.3 Emergency Rollback (< 5 minutes)

```bash
# Complete reset to last known good state
cd /opt/git/hello-webxr
git fetch origin
git checkout origin/main  # or known good branch/tag
npm ci
NODE_ENV=production npm run build
docker compose build --no-cache
docker compose up -d --force-recreate
```

---

## 7. Health Checks

### 7.1 Automated Health Check Script

```bash
#!/bin/bash
# health-check.sh

echo "🔍 Hello WebXR Health Check"
echo "================================"

# Container status
echo -n "Container: "
if docker ps | grep -q hello-webxr; then
    echo "✅ Running"
else
    echo "❌ Not running"
    exit 1
fi

# HTTP endpoint
echo -n "HTTP Status: "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://chemie-lernen.org/pse-in-vr/)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ $HTTP_CODE"
else
    echo "❌ $HTTP_CODE"
    exit 1
fi

# Bundle accessibility
echo -n "Main Bundle: "
BUNDLE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://chemie-lernen.org/pse-in-vr/bundle.js)
if [ "$BUNDLE_STATUS" = "200" ]; then
    echo "✅ $BUNDLE_STATUS"
else
    echo "❌ $BUNDLE_STATUS"
fi

# Service Worker
echo -n "Service Worker: "
SW_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://chemie-lernen.org/pse-in-vr/sw.js)
if [ "$SW_STATUS" = "200" ]; then
    echo "✅ $SW_STATUS"
else
    echo "❌ $SW_STATUS"
fi

# Compression check
echo -n "Gzip Compression: "
if curl -sI https://chemie-lernen.org/pse-in-vr/bundle.js | grep -q "Content-Encoding: gzip"; then
    echo "✅ Enabled"
else
    echo "❌ Disabled"
fi

echo ""
echo "✅ Health check complete!"
```

### 7.2 Manual Health Checks

```bash
# 1. Container health
docker ps -f name=hello-webxr
docker inspect hello-webxr --format='{{.State.Health.Status}}'

# 2. Resource usage
docker stats hello-webxr --no-stream

# 3. Logs (last 100 lines)
docker logs hello-webxr --tail 100

# 4. Network connectivity
docker exec hello-webxr wget -O- http://localhost:80 -q

# 5. File integrity
docker exec hello-webxr ls -lh /usr/share/nginx/html/*.js
```

### 7.3 URL Monitoring

Monitor these URLs:

- **Main Page:** https://chemie-lernen.org/pse-in-vr/
- **Main Bundle:** https://chemie-lernen.org/pse-in-vr/bundle.js
- **Three.js Bundle:** https://chemie-lernen.org/pse-in-vr/1.bundle.js
- **Vendor Bundle:** https://chemie-lernen.org/pse-in-vr/2.bundle.js
- **Service Worker:** https://chemie-lernen.org/pse-in-vr/sw.js

All should return **HTTP 200**.

---

## 8. Troubleshooting

### 8.1 Container Won't Start

**Symptoms:** `docker ps` shows no hello-webxr container

**Diagnosis:**
```bash
# Check container logs
docker logs hello-webxr

# Check if port is available
ss -tlnp | grep :80

# Check Docker networks
docker network ls
docker network inspect traefik-public
```

**Solutions:**

1. If port conflict:
   ```bash
   # Check what's using port 80
   sudo lsof -i :80
   # Stop conflicting service or use different port
   ```

2. If network issue:
   ```bash
   docker network create traefik-public
   docker compose up -d
   ```

3. If build error:
   ```bash
   # Rebuild without cache
   docker compose build --no-cache
   docker compose up -d
   ```

### 8.2 504 Gateway Timeout

**Symptoms:** Traefik returns 504 error

**Diagnosis:**
```bash
# Check if container is running
docker ps | grep hello-webxr

# Check if container is on correct network
docker inspect hello-webxr --format='{{range $key, $value := .NetworkSettings.Networks}}{{$key}} {{end}}'

# Check Traefik logs
docker logs graphwiz-traefik --tail 50 | grep hello-webxr
```

**Solutions:**

1. Network mismatch:
   ```bash
   docker network connect traefik-public hello-webxr
   docker compose restart
   ```

2. Traefik not routing:
   ```bash
   # Check Traefik configuration
   docker logs graphwiz-traefik
   # Verify labels on container
   docker inspect hello-webxr --format='{{json .Config.Labels}}' | jq
   ```

### 8.3 Bundle Not Loading (404)

**Symptoms:** Page loads but bundles return 404

**Diagnosis:**
```bash
# Check if files exist in container
docker exec hello-webxr ls -lh /usr/share/nginx/html/*.js

# Check nginx is serving files
docker exec hello-webxr cat /etc/nginx/conf.d/default.conf
```

**Solutions:**

1. Rebuild and redeploy:
   ```bash
   cd /opt/git/hello-webxr
   docker compose down
   docker compose build --no-cache
   docker compose up -d
   ```

2. Check file permissions:
   ```bash
   docker exec hello-webxr ls -la /usr/share/nginx/html/
   # Should show readable files (644 or 755)
   ```

### 8.4 Service Worker 403 Error

**Symptoms:** sw.js returns 403 Forbidden

**Diagnosis:**
```bash
# Check file permissions
docker exec hello-webxr ls -la /usr/share/nginx/html/sw.js
```

**Solutions:**

Fix permissions in Dockerfile:
```dockerfile
# Fix permissions for nginx
RUN chmod -R 755 /usr/share/nginx/html/*.js /usr/share/nginx/html/*.html
```

Then rebuild:
```bash
docker compose build
docker compose up -d
```

### 8.5 High Memory Usage

**Symptoms:** Container using excessive memory

**Diagnosis:**
```bash
# Check resource usage
docker stats hello-webxr

# Check nginx processes
docker exec hello-webxr ps aux
```

**Solutions:**

1. Restart container:
   ```bash
   docker compose restart
   ```

2. Add memory limits in docker-compose.yml:
   ```yaml
   services:
     hello-webxr:
       deploy:
         resources:
           limits:
             memory: 512M
   ```

### 8.6 Build Fails with Webpack Error

**Symptoms:** `npm run build` fails

**Diagnosis:**
```bash
# Check webpack version
npm list webpack

# Try building with verbose output
npm run build -- --verbose
```

**Solutions:**

1. Clear cache and reinstall:
   ```bash
   rm -rf node_modules package-lock.json .cache
   npm install
   NODE_ENV=production npm run build
   ```

2. Check Node version:
   ```bash
   node --version  # Should be 18.x or 20.x
   ```

### 8.7 Performance Degradation

**Symptoms:** Slow page loads, high latency

**Diagnosis:**
```bash
# Run performance test
node performance-test.js

# Check compression
curl -sI https://chemie-lernen.org/pse-in-vr/bundle.js | grep Content-Encoding

# Check cache headers
curl -sI https://chemie-lernen.org/pse-in-vr/bundle.js | grep Cache-Control
```

**Solutions:**

1. Verify nginx config has gzip:
   ```bash
   docker exec hello-webxr cat /etc/nginx/conf.d/default.conf | grep gzip
   ```

2. Rebuild with optimizations:
   ```bash
   NODE_ENV=production npm run build
   docker compose build
   docker compose up -d
   ```

---

## 9. Monitoring

### 9.1 Container Monitoring

```bash
# Real-time stats
docker stats hello-webxr

# Container info
docker inspect hello-webxr

# Resource usage
docker top hello-webxr
```

### 9.2 Log Monitoring

```bash
# Follow logs in real-time
docker logs -f hello-webxr

# Last 100 lines
docker logs --tail 100 hello-webxr

# Logs with timestamp
docker logs -t hello-webxr

# Export logs
docker logs hello-webxr > hello-webxr-$(date +%Y%m%d).log
```

### 9.3 Application Monitoring

Check Google Analytics for:
- Page load times
- User sessions
- Core Web Vitals (LCP)
- Traffic sources
- Device breakdown

View at: https://analytics.google.com/

### 9.4 Error Tracking

Monitor console errors in browser:
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for red errors
4. Check Network tab for failed requests

### 9.5 Automated Monitoring Script

```bash
#!/bin/bash
# monitor.sh - Run every 5 minutes via cron

ALERT_EMAIL="admin@example.com"
LOG_FILE="/var/log/hello-webxr-monitor.log"

# Check container
if ! docker ps | grep -q hello-webxr; then
    echo "[$(date)] ERROR: Container not running" >> $LOG_FILE
    # Send alert (configure mail command)
    exit 1
fi

# Check HTTP endpoint
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://chemie-lernen.org/pse-in-vr/)
if [ "$HTTP_CODE" != "200" ]; then
    echo "[$(date)] ERROR: HTTP returned $HTTP_CODE" >> $LOG_FILE
    exit 1
fi

# Check bundle size
BUNDLE_SIZE=$(curl -s https://chemie-lernen.org/pse-in-vr/bundle.js | wc -c)
if [ $BUNDLE_SIZE -lt 90000 ] || [ $BUNDLE_SIZE -gt 100000 ]; then
    echo "[$(date)] WARNING: Bundle size unusual: $BUNDLE_SIZE" >> $LOG_FILE
fi

echo "[$(date)] OK: All checks passed" >> $LOG_FILE
```

### 9.6 Uptime Monitoring

Use external services:
- **UptimeRobot** - https://uptimerobot.com
- **Pingdom** - https://www.pingdom.com
- **StatusCake** - https://www.statuscake.com

Monitor: https://chemie-lernen.org/pse-in-vr/

---

## 10. Maintenance

### 10.1 Regular Maintenance Tasks

#### Daily (Automated)
- [ ] Health check script runs
- [ ] Logs rotated
- [ ] Uptime monitored

#### Weekly
- [ ] Review logs for errors
- [ ] Check disk space
- [ ] Monitor resource usage
- [ ] Review Google Analytics

#### Monthly
- [ ] Security updates (npm audit)
- [ ] Docker base image updates
- [ ] Performance review
- [ ] Backup verification

#### Quarterly
- [ ] Full dependency update
- [ ] Major version upgrades
- [ ] Architecture review
- [ ] Disaster recovery test

### 10.2 Log Rotation

```bash
# Configure docker log rotation
# Add to docker-compose.yml:

services:
  hello-webxr:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 10.3 Dependency Updates

```bash
# Check for security vulnerabilities
npm audit

# Fix vulnerabilities (use caution)
npm audit fix

# Update all dependencies
npm update

# Test thoroughly before deploying
NODE_ENV=production npm run build
docker compose build
```

### 10.4 Docker Maintenance

```bash
# Remove unused images
docker image prune -a

# Remove unused containers
docker container prune

# Remove unused volumes
docker volume prune

# Clean build cache
docker builder prune

# Full cleanup
docker system prune -a
```

### 10.5 Performance Tuning

Review and optimize:
1. Bundle sizes (run `performance-test.js`)
2. Asset sizes (check assets/ directory)
3. Nginx configuration
4. Compression ratios
5. Cache hit rates

### 10.6 Backup Procedures

Critical files to backup:
- `docker-compose.yml`
- `Dockerfile`
- `webpack.config.js`
- `package.json`
- Source code (`src/`)
- Assets (`assets/`)

Backup command:
```bash
tar -czf hello-webxr-backup-$(date +%Y%m%d).tar.gz \
  docker-compose.yml Dockerfile webpack.config.js package.json \
  src/ assets/ res/ index.html sw.js
```

---

## 11. Emergency Procedures

### 11.1 Site Down - Complete Outage

**Immediate Actions (First 5 minutes):**

```bash
# 1. Check container status
docker ps -a | grep hello-webxr

# 2. Check Traefik
docker ps | grep traefik
docker logs graphwiz-traefik --tail 50

# 3. Restart container
docker compose restart

# 4. If still down, check system resources
df -h
free -h
top
```

**If still down (5-15 minutes):**

```bash
# 5. Complete rebuild
cd /opt/git/hello-webxr
docker compose down
docker compose build --no-cache
docker compose up -d

# 6. Verify
curl -I https://chemie-lernen.org/pse-in-vr/
```

### 11.2 Degraded Performance

**Actions:**

```bash
# 1. Check resource usage
docker stats hello-webxr

# 2. Check logs
docker logs hello-webxr --tail 100

# 3. Restart container
docker compose restart

# 4. Monitor
docker logs -f hello-webxr
```

### 11.3 Security Incident

**If hacked or compromised:**

```bash
# 1. IMMEDIATELY take offline
docker compose down

# 2. Preserve logs
docker logs hello-webxr > incident-$(date +%Y%m%d).log

# 3. Review access logs
docker exec hello-webxr cat /var/log/nginx/access.log

# 4. Change secrets/keys
# (if any API keys, update them)

# 5. Rebuild from known good state
git checkout origin/main
npm ci
NODE_ENV=production npm run build
docker compose build --no-cache
docker compose up -d

# 6. Verify integrity
curl -I https://chemie-lernen.org/pse-in-vr/
```

### 11.4 Data Loss

**If files deleted/corrupted:**

```bash
# 1. Stop container
docker compose down

# 2. Restore from backup
tar -xzf hello-webxr-backup-YYYYMMDD.tar.gz

# 3. Rebuild
docker compose build
docker compose up -d

# 4. Verify
docker exec hello-webxr ls -lh /usr/share/nginx/html/
```

### 11.5 Escalation Matrix

| Severity | Response Time | Escalation |
|----------|---------------|------------|
| **P1 - Critical** (Site Down) | < 15 min | Immediate → DevOps Lead → CTO |
| **P2 - High** (Degraded) | < 1 hour | DevOps Team |
| **P3 - Medium** (Partial) | < 4 hours | Development Team |
| **P4 - Low** (Cosmetic) | < 24 hours | Next Sprint |

---

## 12. Contact Information

### 12.1 Team Roles

| Role | Name | Contact |
|------|------|---------|
| **DevOps Lead** | TBD | tbd@example.com |
| **Developer** | TBD | tbd@example.com |
| **On-Call** | TBD | +1-XXX-XXX-XXXX |

### 12.2 Useful Commands Reference

```bash
# Quick status check
docker ps | grep hello-webxr && curl -sI https://chemie-lernen.org/pse-in-vr/ | grep "HTTP"

# Full restart
cd /opt/git/hello-webxr && docker compose restart

# Full rebuild
cd /opt/git/hello-webxr && docker compose down && docker compose build --no-cache && docker compose up -d

# View logs
docker logs -f hello-webxr

# Resource usage
docker stats hello-webxr --no-stream

# Shell access
docker exec -it hello-webxr sh

# Network test
docker exec hello-webxr wget -O- http://localhost:80 -q
```

### 12.3 Documentation Links

- **Optimization Report:** `/opt/git/hello-webxr/OPTIMIZATION_REPORT.md`
- **Performance Tests:** `/opt/git/hello-webxr/performance-test.js`
- **Deployment Verify:** `/opt/git/hello-webxr/verify-deployment-simple.js`
- **Project README:** `/opt/git/hello-webxr/README.md`

### 12.4 External Resources

- **Traefik Dashboard:** Check with your team for URL
- **Google Analytics:** https://analytics.google.com/
- **Docker Docs:** https://docs.docker.com/
- **Three.js Docs:** https://threejs.org/docs/
- **WebXR Spec:** https://immersive-web.github.io/webxr/

---

## Appendix A: Quick Reference

### Most Common Commands

```bash
# Deploy
cd /opt/git/hello-webxr && npm run build && docker compose up -d --build

# Restart
docker compose restart

# Check logs
docker logs -f hello-webxr

# Check status
curl -I https://chemie-lernen.org/pse-in-vr/

# Quick health check
docker ps | grep hello-webxr
```

### File Locations

- **Project:** `/opt/git/hello-webxr/`
- **Container Data:** `/var/lib/docker/containers/`
- **Logs:** `docker logs hello-webxr`

### Important Ports

- **External:** 443 (HTTPS), 80 (HTTP)
- **Internal:** 80 (Container)
- **Traefik Dashboard:** 8080 (if exposed)

---

## Appendix B: Change History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2026-01-02 | 1.0.0 | Initial runbook creation | Claude Code |

---

## Appendix C: Related Documents

1. **OPTIMIZATION_REPORT.md** - Detailed optimization analysis
2. **README.md** - Project overview
3. **webpack.config.js** - Build configuration
4. **docker-compose.yml** - Container orchestration

---

**End of Runbook**

For questions or updates to this runbook, please contact the DevOps team.

**Last reviewed:** 2026-01-02
**Next review:** 2026-04-02 (Quarterly)
