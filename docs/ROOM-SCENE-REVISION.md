# Reference room process scene

Reference: `Brand Identity/Room.png`. Scope: the bilingual homepage Approach section only.

The supplied image depicts a branded exhibition space, not a classroom: a pale wood platform, two teal walls, vertical timber slats, branded wall graphics, a table and four stools, screen, literature stand and spotlights. The process visualization should preserve these recognizable features through all five states, without asserting that this is a photographed real installation.

## Acceptance checks

- Five tabs select five visually distinct stages of the same space.
- Planning and design remain identifiable as the reference room.
- Manufacturing exposes component assembly; delivery brings them together; support lights the screen.
- Transitions work forward, backward and with skipped stages.
- Keyboard arrows, Home and End preserve existing RTL behavior.
- Desktop and 390px mobile framing show the whole platform without clipping.
- Reduced motion and unavailable WebGL still show a relevant room representation.
- No network-only textures/fonts or invented logo assets.
- No changes to unrelated site sections.

This is a procedural interpretation of the reference image, not an exact architectural/CAD reconstruction.

## Implementation

The scene is in `components/orbit-scene.tsx`; the static reference fallback is in `components/room-static.tsx`. Five stage controls remain in `components/interactions.tsx`. Local canvas textures supply wood, wall graphics and the active screen; the logo is sourced from the official local SVG. The renderer stops rendering offscreen and respects reduced-motion preferences.

Initial verification: full ESLint passed. Arabic keyboard Home returned to stage 01; ArrowLeft then advanced to stage 02. Desktop and mobile captures are `docs/room-desktop-final.png` and `docs/room-mobile-final.png`.
