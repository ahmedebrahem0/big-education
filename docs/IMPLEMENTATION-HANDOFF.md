# BIG Education — Implementation handoff

## Preview

Run `npm run dev` and visit `http://localhost:3000/ar` or `/en`.
The root redirects to English. Seven page types are available in each language.

## Included

- Official logo, rabbit motif, Alexandria font and brand palette.
- Responsive English/LTR and Arabic/RTL layouts with route-preserving language switching.
- Homepage, About, Solutions, educational spaces, educational media, emergency education and Contact.
- Interactive five-stage learning-space visualization, reduced-motion support and a static fallback.
- Expandable space descriptions, keyboard-accessible process tabs and mobile navigation.
- Four optimized concept images; no school-uniform section or student-uniform imagery.
- Centralized copy and contact details in `content/site.ts`.

## Checks

Verification on 14 October 2026: production build (including TypeScript) and ESLint passed. The second independent visual evaluation was interrupted and is not recorded as complete.

- `npm run lint`
- `npm run build`
- With a local server running: `node scripts/check-routes.mjs`
- Desktop and Arabic mobile captures: `docs/website-desktop-final.png`, `docs/website-mobile-final.png`.

## Before launch

- The contact form opens a mail draft; it does not send or store enquiries. Connect an approved mail service if direct delivery is required.
- Approve public copy, phone numbers, warranty wording and generated concept imagery. Generated images must not be presented as documentary facility photographs.
- Supply approved social links, domain and any real projects/testimonials. No invented client logos or results are included.
- Confirm deployment destination and test email links and performance on target devices. No external publication has been performed.
- The current 3D visual is a stylized procedural learning-space model, not an exact product CAD model.
