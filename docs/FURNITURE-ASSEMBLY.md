# Full-stage furniture assembly

Current reference: `Brand Identity/Modern Teal Education Training Room.png`.
This supersedes the two-column booth concept in `ROOM-SCENE-REVISION.md`.

## Direction

The Approach section becomes a full-width, viewport-sized stage. Native scrolling controls a reversible, staggered furniture assembly. The main visual is the room rather than a large heading beside a small model. The training chairs, their writing tablets, lecturer desk and storage are the primary subject; room finishes complete the sequence.

The visual is a procedural interpretation of the supplied reference, not an exact CAD replica. No paid Higgsfield generation is required for native per-piece interactivity.

## Verification checklist

- Desktop: stage fits viewport; progress moves forward/back with scroll; all furniture remains in frame.
- Assembly: bases, supports, seats/backs, writing arms, desk/storage panels move independently with staggered timing.
- Controls: chapter jumps and skip/continue work with keyboard and pointer in EN and AR.
- Mobile: readable controls, no horizontal overflow, reduced resource cost and appropriate scene framing.
- Accessibility: reduced-motion avoids lengthy mandatory animated scrolling; WebGL failure shows the new reference.
- Performance: no React state updates for each animation frame, bounded pixel ratio, no continuous offscreen animation, shared resources where practical.
- Verify lint, TypeScript/build, route checks, console errors and desktop/mobile captures.

Frame rate must be assessed on actual target devices; no universal no-lag guarantee is implied.
