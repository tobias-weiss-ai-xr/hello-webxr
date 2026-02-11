# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - heading "Hello!" [level=1] [ref=e4]
    - img [ref=e5]
  - generic [ref=e7]:
    - heading "WebXR Not Supported" [level=2] [ref=e8]
    - paragraph [ref=e9]: "Your browser doesn't support WebXR. Please use a WebXR-compatible browser like:"
    - list [ref=e10]:
      - listitem [ref=e11]:
        - link "Oculus Browser" [ref=e12] [cursor=pointer]:
          - /url: https://www.oculus.com/browser/
      - listitem [ref=e13]:
        - link "Firefox Reality" [ref=e14] [cursor=pointer]:
          - /url: https://mixedreality.mozilla.org/
      - listitem [ref=e15]:
        - link "Chrome with WebXR Emulator" [ref=e16] [cursor=pointer]:
          - /url: https://chrome.google.com/webstore/detail/webxr-api-emulator/mjddjgejdnfnnagcgmbgcafikfcddfhl
  - generic:
    - strong: "Browser Navigation:"
    - text: Click to enable mouse look
    - text: W/↑ - Forward | S/↓ - Back
    - text: A/← - Left | D/→ - Right
    - text: N - Next room
```