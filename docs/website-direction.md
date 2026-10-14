# Big Education — Website Direction & Discovery Plan

## 1. Confirmed project context

- Framework: Next.js 16.4 with App Router.
- Installed visual stack: Three.js, React Three Fiber, Drei, Motion, Lucide.
- Current app is still the default starter page in `app/page.tsx`.
- Brand assets available:
  - `Brand Guidelines/Company Profile_Big Education_ENG.pdf`
  - `Brand Guidelines/Big Education - Brand Identity.pdf`
  - `Logo/Horizontal- Main/Logo.png|svg|pdf|ai`
  - `Logo/Vertical/Logo Vertical.png|svg|pdf|eps|ai`
  - `Fonts/Arabic/Alexandria[wght].ttf`
  - `Fonts/English/Alexandria[wght].ttf`

## 2. Brand observations from visible assets

- Brand name: BIG Education.
- Primary mark: an abstract rabbit symbol. The Company Profile explicitly explains it as a rabbit representing agility, speed, engineering intelligence and the ability to move past obstacles.
- Main logo lockup uses a dark teal wordmark for “BIG” and a brighter teal for “EDUCATION”.
- Typeface asset is Alexandria Variable, a geometric, modern and highly legible Arabic/Latin family.
- The visual language should stay confident, modern and educational rather than looking like a generic school template.

## 3. Proposed creative direction

### Working concept: “Learning in Motion”

The website behaves like an intelligent learning ecosystem: the rabbit mark becomes a living 3D object, particles form pathways, and scrolling moves visitors through a journey from challenge to educational continuity.

The experience should feel premium and memorable, but the content must remain easy to scan for parents, students, partners and institutional decision-makers.

### Visual system

- Brand teal `#267372` as the authority / trust color.
- Brighter teal `#3B928C` as the energy / progress accent.
- Warm accent `#D8B5A3` and pale neutral `#DADBE7` for breathing room.
- Dark mode sections for cinematic moments and 3D contrast.
- Rounded but disciplined cards; avoid excessive glassmorphism.
- Large Alexandria Variable typography with strong Arabic/English rhythm; the brand guide contains conflicting font names, documented in `docs/brand-identity-findings.md`.
- Use the rabbit mark as a motion primitive: leap, reveal, motion trail and engineered pathway. Preserve its recognizable official silhouette.

## 4. Proposed homepage structure

1. **Intro / loading moment**
   - Rabbit logo mark assembles from flowing shapes.
   - “Skip animation” control and reduced-motion support.

2. **Hero**
   - Clear company promise, not only a slogan.
   - Interactive 3D brand object reacting subtly to pointer movement.
   - Primary CTA: “Explore our solutions”.
   - Secondary CTA: “Talk to our team”.
   - Replaceable media slot for hero video or supplied imagery.

3. **Trust strip**
   - Numbers / countries / learners / institutions / years, only after confirmation.
   - Partner and client logo placeholders.

4. **What Big Education does**
   - Three to five service or solution pillars.
   - Scroll-linked panels with micro-interactions.

5. **Interactive “learning journey”**
   - A horizontal or spatial timeline: Understand → Design → Manufacture → Equip → Support.
   - Each stage opens a concise explanation and relevant visual.

6. **Programs / solutions showcase**
   - Editorial cards with hover depth, image reveal and category labels.
   - Cover the verified business lines: educational furniture, educational media production, school uniforms and emergency education solutions.

7. **Impact / proof**
   - Case studies, outcomes, testimonials, certifications and partner marks.
   - Avoid invented statistics; use editable placeholders until verified.

8. **About the company**
   - Brand story, vision, mission and values.
   - Use the logo mark as a visual chapter separator.

9. **CTA section**
   - A memorable dark section where the 3D mark becomes a glowing pathway.
   - Contact / consultation action.

10. **Footer**
    - Social links, email, phone, address, legal links, language switcher.

## 5. Interaction and motion plan

- Smooth but restrained scroll transitions using Motion.
- Three.js scene only where it adds meaning: hero mark, journey, or CTA.
- Scroll-triggered typography reveals and image masking.
- Cursor-following light / parallax limited to desktop.
- Magnetic CTA buttons with keyboard-safe focus states.
- Hover states that reveal depth, not just color changes.
- Page transition system for future inner pages.
- Mobile fallback: replace heavy 3D with optimized raster/video or a lightweight canvas.
- Respect `prefers-reduced-motion`; never make core information depend on animation.

## 6. Pages to plan

- Home
- About Big Education
- Solutions / Services
- Programs or business units
- Case studies / success stories
- News / insights, if needed
- Careers, if needed
- Contact
- Privacy policy / terms

## 7. Content placeholders to prepare

Use editable placeholders until the company confirms the data:

- `COMPANY_TAGLINE` — confirmed English promise: “We build education where the world needs it most.”
- `COMPANY_SHORT_DESCRIPTION`
- `COMPANY_LONG_DESCRIPTION`
- `VISION`
- `MISSION`
- `VALUES[]`
- `SERVICES[]`
- `PROGRAMS[]`
- `IMPACT_METRICS[]`
- `CASE_STUDIES[]`
- `TESTIMONIALS[]`
- `PARTNER_LOGOS[]`
- `EMAIL` — `info@big-education-egypt.com` in profile.
- `PHONE` — `010 44 2222 82` and `010 44 2222 84` in profile; confirm international format before publishing.
- `ADDRESS` — not supplied in the Company Profile; address in the brand stationery mockup appears to be placeholder content.
- `LINKEDIN_URL`, `FACEBOOK_URL`, `INSTAGRAM_URL`, `YOUTUBE_URL`

## 8. Reference sites and what to study

- Awwwards interactive collection: https://www.awwwards.com/websites/web-interactive/
  - Study interaction patterns, but do not copy layouts blindly.
- Finely Crafted: https://www.awwwards.com/sites/finely-crafted
  - Immersive 3D tour, WebGL and cinematic navigation.
- UltraSuperCity case study: https://www.digitaldisruptors.agency/ultra-super-new-case-study
  - Strong example of turning a homepage into a navigable world.
- The Wondrouz: https://the-wondrouz.com/
  - Brand world, 3D universes and memorable creative-tech positioning.
- Webisoft by Locomotive: https://locomotive.ca/en/work/webisoft
  - Corporate/technology credibility combined with fluid motion and 3D branding.
- Webby Crafted with Code: https://www.webbyawards.com/crafted-with-code/
  - Useful benchmark for storytelling, technology and content quality together.
- Dogstudio examples: https://www.creativebloq.com/web-design/14-parallax-scrolling-websites-designed-impeccably
  - Study how one 3D hero object can carry a long scrolling narrative.

## 9. Important guardrails

- “Impressive” must support trust and clarity; animation cannot hide weak messaging.
- No statistics, client logos, awards or claims should be invented.
- 3D assets need a performance budget and mobile fallback.
- Arabic and English should be designed as first-class layouts, not simple text swaps.
- Final content must be extracted from the two PDFs and confirmed by the company.

## 10. Information still required from the company

1. Exact services / products and which ones are the priority.
2. Target audiences: students, parents, schools, universities, employers, government, or partners.
3. Confirmed company description, mission, vision and values.
4. Verified impact numbers and client / partner names.
5. Contact information and social URLs.
6. Preferred language behavior: Arabic-first, English-first, or browser-detected.
7. Whether the PDF pages may be used as image references or only as content sources.
8. Any real photography, videos, 3D models or campaign assets to include.

## Next implementation step

After the PDF content is reviewed and the missing company facts are confirmed, create a high-fidelity homepage prototype inside the existing Next.js app. The first prototype should validate the visual direction, hero interaction, Arabic/English typography, and mobile performance before expanding into inner pages.
