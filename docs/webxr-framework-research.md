# WebXR Framework Research (April 2026)

## Decision: Babylon.js

Rationale: Microsoft-backed, best WebXR API abstraction, TypeScript-first, proven at scale (118 rooms + desktop fallback), Apache 2.0 license.

## Framework Comparison

| Framework | Stars | Desktop-First | VR Quality | Bundle Size | License | Production Track Record |
|-----------|-------|--------------|------------|-------------|---------|------------------------|
| **Babylon.js** | ~25K | Excellent | Excellent | ~1.4MB gzip | Apache 2.0 | Strong (Microsoft, automotive, education) |
| @react-three/xr | ~2.6K | Excellent | Excellent | ~168KB | NOASSERTION | Emerging |
| A-Frame | ~17.5K | Good | Good | ~100KB | MIT | Strong (education, Mozilla Hubs) |
| PlayCanvas | ~15K | Excellent | Excellent | ~300KB | MIT | Strong (commercial) |
| Mozilla Hubs | ~2K | Good | Good | Heavy | MPL 2.0 | Strong (non-profit, social VR) |

### Not relevant
- **Meta Lumin/OpenXR SDK** — native Quest C++ SDK, not web
- **Primrose** — text editor for WebGL, not a framework
- **8th Wall** — AR-focused, not VR-oriented

## Key Findings

1. Babylon.js `createDefaultXRExperienceAsync` provides the simplest WebXR setup
2. @react-three/xr is best if team is React-heavy (lighter bundle, modern patterns)
3. A-Frame has known WebXR bugs (bounded-floor issues on Quest 3, March 2026)
4. PlayCanvas is strong commercial option with self-hosted editor
5. All viable options support desktop-first rendering with optional VR session

## Current Stack (to replace)

- Three.js (3D rendering)
- ECSY (entity-component system) — overkill for this app
- Webpack 4 (build)
- WebXR Polyfill — no longer needed
- Service Worker — causes stale cache issues

## Migration Notes

- Drop ECSY entirely (manual setup/enter/exit/execute pattern → Babylon scene management)
- Drop service worker (causes more problems than it solves)
- Drop WebXR polyfill (modern browsers support WebXR natively)
- Babylon.js includes built-in physics, audio, GUI — may replace several lib/ modules
- Element data (src/data/elements.js) is framework-agnostic — reuse as-is
- Room concepts map well to Babylon scenes or scene sub-graphs
