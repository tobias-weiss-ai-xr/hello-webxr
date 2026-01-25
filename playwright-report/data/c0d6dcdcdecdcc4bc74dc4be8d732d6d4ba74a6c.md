# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - heading "WebXR Not Supported" [level=2] [ref=e3]
    - paragraph [ref=e4]: "Your browser doesn't support WebXR. Please use a WebXR-compatible browser like:"
    - list [ref=e5]:
      - listitem [ref=e6]:
        - link "Oculus Browser" [ref=e7] [cursor=pointer]:
          - /url: https://www.oculus.com/browser/
      - listitem [ref=e8]:
        - link "Firefox Reality" [ref=e9] [cursor=pointer]:
          - /url: https://mixedreality.mozilla.org/
      - listitem [ref=e10]:
        - link "Chrome with WebXR Emulator" [ref=e11] [cursor=pointer]:
          - /url: https://chrome.google.com/webstore/detail/webxr-api-emulator/mjddjgejdnfnnagcgmbgcafikfcddfhl
  - banner [ref=e12]:
    - generic [ref=e13]:
      - text: "Handedness:"
      - link "Left" [ref=e14] [cursor=pointer]:
        - /url: "#"
      - link "Right":
        - /url: "#"
  - generic:
    - strong: "Browser Navigation:"
    - text: Click to enable mouse look
    - text: W/↑ - Forward | S/↓ - Back
    - text: A/← - Left | D/→ - Right
    - text: N - Next room
  - button "🎤 Mikrofon an" [ref=e17] [cursor=pointer]
  - button "VR NOT SUPPORTED" [ref=e20]
```