# BIG Education — Frontend Engineering Audit

Audit scope: repository state inspected on 28 October 2026. **Implemented** means present in code, not deployed or proven in production. No live site, API, analytics, Lighthouse report, or personal authorship evidence was supplied. References use repository-relative paths and line numbers.

## Section 1 — Executive Summary

**Project:** BIG Education bilingual corporate marketing website, not a school-management application or ecommerce storefront. English and Arabic visitors explore educational spaces, media, manufacturing, emergency education, and contact options. Identity is high confidence from `content/site.ts:113-175`, `components/pages.tsx:50-142`, and `app/[locale]/[[...slug]]/page.tsx:33-42`. Implementation exists; deployment and active use are **unverified**. `docs/IMPLEMENTATION-HANDOFF.md` describes a preview and launch work, but is a dated handoff, not deployment evidence.

Strongest engineering evidence: localized server-rendered page shell; route migration to one-page anchors; interactive scroll-driven procedural 3D room with delayed loading, reduced-motion and failure fallback; centralized bilingual content; client-only mail draft enquiry. Promising CV angle: bilingual branded site and resilient interactive visualization, **subject to personal ownership confirmation**. No ready-to-use personal achievement is established. No measured commercial impact or performance score exists in inspected evidence.

Intended users: prospective institutional buyers, educational organizations, and other visitors considering BIG Education offerings; inferred from website copy and enquiry form. Business goal: explain capabilities and invite project enquiries. Actual audience, conversion, and traffic remain unknown.

## Section 2 — Project Identity and Technology Stack

| Area | Finding | Evidence | Confidence |
| --- | --- | --- | --- |
| Framework | Next.js 16.4.3, React 19.3.0 | `package.json:17-20` | High |
| Language | TypeScript, strict checking configured | `tsconfig.json:7`, `.tsx` source | High |
| Rendering and routing | App Router, `/en` and `/ar`; root redirects to `/en`; legacy paths redirect to page anchors | `app/(entry)/page.tsx:1-6`; `app/[locale]/[[...slug]]/page.tsx:8-42` | High |
| State management | Local React state/refs for UI; no Redux or server-data cache evidenced | `components/chrome.tsx:11-18`; `components/contact-next.tsx:285-294`; `package.json` | High |
| API integration | No application API request found; enquiry opens a `mailto:` draft | `components/contact-next.tsx:297-301,375-395`; `content/site.ts:241-245` | High |
| UI and styling | Custom CSS, Motion, Three.js/React Three Fiber, Lucide icons, local Alexandria font | `app/globals.css`; `components/assembly-room.tsx:3-23`; `app/[locale]/layout.tsx:1-11`; `package.json:12-22` | High |
| Authentication | No login, session, protected route, or roles evidenced | `app/` route inventory; `package.json` | High for inspected repo |
| Testing | Route-check script exists, no automated unit/E2E test suite located; dated handoff claims prior build/lint pass | `scripts/check-routes.mjs`; `docs/IMPLEMENTATION-HANDOFF.md` | Medium |
| Build and deployment | `next build`/`next start` scripts; no deployment proof. PNPM lockfile exists | `package.json:5-10`; `pnpm-lock.yaml` | High |
| SEO | Localized title/description and language alternates; no sitemap/robots or canonical config found | `app/[locale]/[[...slug]]/page.tsx:23-31` | High |

Package name supports product name, but copy and routes establish its purpose. README is generic starter text and describes obsolete `app/page.tsx`; use source over README (`README.md:1-21`).

## Section 3 — Feature and Workflow Inventory

| Domain and workflow | Business purpose | Status | Evidence and technical significance | CV value |
| --- | --- | --- | --- | --- |
| Bilingual website navigation: `/en`, `/ar`, language switch, RTL/LTR | Reach English and Arabic prospects | **Implemented** | `app/[locale]/layout.tsx:19-36`; `components/chrome.tsx:128-175`; centralized copy in `content/site.ts`. Locale validation, HTML language/direction, route-preserving switch. | High if owned |
| Solutions storytelling: spaces, media, factory, emergency, values | Explain service range | **Implemented** as website content | `components/pages.tsx:50-142`; `components/spaces-dial.tsx:190-334`; `components/media-pulse.tsx:58-211`; `components/school-box.tsx:266-316`. Interactive exploration, not a booking or operations workflow. | Medium |
| Five-stage 3D room assembly | Demonstrate education-space concept | **Implemented** with fallback | `components/interactions.tsx:33-45`; `components/assembly-experience.tsx:79-280`; `components/assembly-room.tsx:457-533`. Scroll-controlled 3D, chapter navigation, static fallback. | High if owned |
| Project enquiry to mail draft | Let visitors prepare an enquiry | **Partially implemented** as lead intake | `components/contact-next.tsx:277-301,375-395,474-531`. Required name/message, topic chips, URL-encoded mail draft. No site-side send, delivery, persistence, or CRM. | Medium, with precise wording |
| Legacy URL migration | Preserve old entry paths | **Implemented** in route code | `app/[locale]/[[...slug]]/page.tsx:8-42`; generated params for locales and legacy paths. Unknown slugs return not-found. Redirect behavior needs runtime validation. | Medium |
| Storefront, checkout, dashboard, pricing system, school management | Cross-project claims | **Unverified for this repo** | No matching routes, API layer, or domain workflow in inspected application. Emergency education and educational spaces are marketing content, not SMS. | None here |

## Section 4 — Architecture and Engineering Decisions

1. **Localized App Router shell — implemented.** Server layout validates locale and sets `lang`/`dir`; root route redirects; optional catch-all handles homepage and legacy paths (`app/[locale]/layout.tsx:12-38`; `app/(entry)/page.tsx:1-6`; `app/[locale]/[[...slug]]/page.tsx:8-42`). Benefit: one content structure for two languages and old-link continuity. Trade-off: a large single page and anchor redirects, with distinct legacy pages no longer present. Why this migration was chosen requires owner confirmation.
2. **Content separated from presentation — implemented.** `content/site.ts` holds English/Arabic copy, service definitions, contact configuration; components receive `Locale` (`components/pages.tsx:50-51`, `components/chrome.tsx:8-9`). Easier parallel localization, but copy is code-managed, requires deployment for edits, and contact addresses are embedded in a public module. No CMS integration.
3. **Server shell plus client interactions — implemented.** `components/pages.tsx` has no client directive, while interactive sections declare `use client`. The 3D room is dynamically imported in `components/assembly-experience.tsx:25-28`; `components/assembly-room.tsx:520-533` caps DPR and stops frame rendering when inactive. Benefit: static content can render before interactive code; trade-off: significant client-side animation complexity. Bundle and hydration cost unmeasured.
4. **Shared scroll animation primitive — implemented.** `components/use-scrub.ts:12-52` maps sticky-section scroll to eased progress and respects reduced motion; used by contact and emergency scenes (`components/contact-next.tsx:132`; `components/school-box.tsx:272`). This reduces duplicate scroll state logic. It still attaches scroll listeners, so device profiling is needed.
5. **No data-access layer — appropriate to current evidence.** Marketing copy is local. `next.config.ts:9-10` enables cache components and partial prefetching, but no observed application data requests or measured gain support caching claims.

## Section 5 — API and Data Flow

**Enquiry:** visitor selects topics and fills required name/message (`components/contact-next.tsx:289-301,474-531`) → local React state builds encoded subject/body → submit calls `openMail()` synchronously (`:375-395`) → browser opens external email client. UI then changes to a ready/sent-looking animation. **No API request, backend response, delivery acknowledgement, cache invalidation, retry, or persisted lead.** Copy correctly says nothing is submitted through website (`content/site.ts:241-245`), though `contact-next.tsx:63,385-395,461` uses “sent” terminology that could overstate outcome.

**Content:** locale path → server layout validation → local `copy[locale]` → page/interactive sections (`app/[locale]/layout.tsx:19-35`; `app/[locale]/[[...slug]]/page.tsx:33-42`; `components/pages.tsx:50-142`). No shared backend API evidenced. Footer mail and phone links are browser-handled (`components/chrome.tsx:241-252`). External emergency/group links point to other sites, but integration and ownership are unverified (`content/site.ts:2-9`; `components/school-box.tsx:316`).

## Section 6 — Authentication, Authorization, and Security

No login, session handling, token storage, role checks, or protected pages found. Public marketing site has no authenticated workflow to audit. Thus no RBAC claim. No backend authorization can be assessed because no backend source or app API exists here.

Form fields have browser-required constraints and maximum lengths (`components/contact-next.tsx:487-519`), but these are client validation only. The email draft depends on local mail client; submission and recipient delivery remain outside app control. Public contact addresses are present in `content/site.ts`; report intentionally omits exact values. No secrets were read or included.

## Section 7 — Performance, SEO, Accessibility, and Quality

**Performance.** Confirmed code practices: `next/image` for hero with sizes/preload (`components/pages.tsx:30-47,54-57`); local font with swap (`app/[locale]/layout.tsx:7-11`); lazy 3D import and static fallback (`components/assembly-experience.tsx:16-28,214-223`); viewport/visibility-based activation (`:95-116`); DPR cap and paused frame loop (`components/assembly-room.tsx:520-533`); reduced-motion behavior (`components/use-scrub.ts:25-28`). Potential risks: many client animation sections and large CSS; no bundle, Web Vitals, or Lighthouse measurements. No 98–100 claim supported.

**SEO.** Implemented locale-specific title/description and `alternates.languages` (`app/[locale]/[[...slug]]/page.tsx:23-31`), semantic main/H1 (`components/pages.tsx:53,82`), redirect for legacy routes (`app/[locale]/[[...slug]]/page.tsx:37-40`). Unknown: indexed state, search traffic, canonical domain; no sitemap, robots file, Open Graph, or structured data located. Alternate links resolve to homepage, fitting single-page layout. Search outcome unverified.

**Accessibility.** Implemented `lang`/`dir`, skip link (`app/[locale]/layout.tsx:23-33`), main landmark/H1, labelled navigation and menu state (`components/chrome.tsx:139-188`), menu focus trap and Escape handling (`:91-126`), form labels/required fields (`components/contact-next.tsx:474-531`), reduced-motion handling and static 3D description (`components/assembly-experience.tsx:16-23,214-223`), CSS motion media queries (`app/globals.css`). Risks requiring keyboard/screen-reader testing: custom interactive dial and scroll sections, enquiry preview focus behavior, and contrast. No compliance audit or score supplied.

**Testing and reliability.** Route script checks locale HTML and root redirect against a running server (`scripts/check-routes.mjs:1-19`). It follows redirects automatically and does not verify each legacy status/location explicitly; its old paths may reflect dated assumptions. Handoff records build/lint success on 14 October 2026 but no reproducible output attached (`docs/IMPLEMENTATION-HANDOFF.md`). No unit/E2E tests located. Checks were not run in this read-only audit because build/tooling may write `.next` or caches. 3D failure boundary and static fallback exist (`components/assembly-experience.tsx:25-43,214-223`); mail-client launch success is not detectable by app.

**Maintainability.** Strict TypeScript configured (`tsconfig.json:7`), centralized bilingual content, reusable animation utility. Risks: very large monolithic stylesheet (`app/globals.css`); complex 3D implementation; old `CompactApproach` path exists but is not used by current Home (`components/interactions.tsx:33-46`; `components/pages.tsx:135`); generic README disagrees with current routes (`README.md:19-21`). Refactoring value should be measured, not assumed.

## Section 8 — Engineering Challenges and Solutions

1. **Interactive room with graceful degradation.** Problem: 3D storytelling must remain usable when WebGL/motion is unavailable. Solution: load room near viewport, pause when hidden, cap DPR, catch rendering/context failures, present static fallback and chapter controls (`components/assembly-experience.tsx:16-43,95-116,214-280`; `components/assembly-room.tsx:457-533`). Complex because rendering lifecycle, animation, and accessible navigation interact. Business relevance: demonstrates a product concept to prospects. Runtime device coverage and personal contribution unverified.
2. **One bilingual experience with different reading directions.** Solution: route locale validation, `lang`/`dir`, centralized copy, route-preserving language switch (`app/[locale]/layout.tsx:19-36`; `content/site.ts`; `components/chrome.tsx:128-175`). Business relevance: two language audiences. No evidence of translation QA or audience reach. Decision rationale and ownership unverified.
3. **Legacy URL continuity after consolidation.** Old paths map to page anchors, while invalid slugs use not-found (`app/[locale]/[[...slug]]/page.tsx:8-42`). Relevant to link continuity, but real redirect and SEO outcomes require runtime/search verification. Ownership unverified.
4. **Enquiry without backend delivery.** Local form state generates a mail draft and explains site does not submit it (`components/contact-next.tsx:297-301,375-395`; `content/site.ts:241-245`). Lower infrastructure need but depends on installed mail client and cannot measure successful delivery. Describe as draft preparation, not lead capture automation.

## Section 9 — Business Impact and Metrics

| Potential outcome | Evidence | Status | Metric or validation needed |
| --- | --- | --- | --- |
| Better explanation of education offerings | Interactive sections in `components/pages.tsx:130-142` | Plausible | User research, engagement, qualified enquiry rate |
| Reach English and Arabic prospects | Locale routes and copy | Plausible | Traffic by locale, user interviews, translation QA |
| Fewer broken links from old URLs | Legacy redirect map | Plausible | Route tests, logs, search-console coverage |
| More project enquiries | Mail draft form | Plausible, limited | Email completion/delivery and conversion tracking; no server-side events here |
| Faster business operations by 20% | No operational workflow or before/after measurements | Unsupported for this project | Identify exact process, comparable baseline/new timings, attribution to relevant system |
| Lighthouse 98–100 on production pages | No Lighthouse report | Unsupported | Production URL, dated runs/pages/categories, repeated results |

No verified outcome or numeric improvement found. The 20% operational-time claim appears unrelated to this marketing site unless owner supplies a measured process affected by it.

## Section 10 — CV Evidence Matrix

| Rank | Evidence-backed accomplishment | Technical evidence | Business relevance | Attribution status | Metric status | CV priority |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Bilingual, RTL/LTR corporate experience | `app/[locale]/layout.tsx:19-36`; `content/site.ts`; `components/chrome.tsx:128-175` | Wider audience access | Supported but unconfirmed | No adoption metric | High |
| 2 | Scroll-driven 3D room with lifecycle and fallback | `components/assembly-experience.tsx:79-280`; `components/assembly-room.tsx:457-533` | Product explanation | Supported but unconfirmed | No engagement/performance metric | High |
| 3 | Legacy-route consolidation | `app/[locale]/[[...slug]]/page.tsx:8-42` | Link continuity | Supported but unconfirmed | No redirect/search data | Medium |
| 4 | Enquiry mail-draft flow | `components/contact-next.tsx:277-301,375-395,474-531` | Contact initiation | Supported but unconfirmed | No conversion/delivery data | Medium |
| 5 | Metadata and accessible foundations | `app/[locale]/[[...slug]]/page.tsx:23-31`; `app/[locale]/layout.tsx:23-33`; `components/chrome.tsx:91-126` | Discoverability/usability | Supported but unconfirmed | No audit score | Medium |

All personal attribution remains unverified. Repository presence cannot establish who designed, built, or maintained these features.

## Section 11 — Draft English CV Bullets

### A. Ready-to-use candidates

None as personal accomplishment bullets: implementation is evidenced, but your ownership is not. The following require confirmation before inclusion.

### B. Strong candidates requiring confirmation

- **[NEEDS CONFIRMATION]** Built a bilingual Next.js corporate site with English/Arabic routes, RTL/LTR layouts, localized content, and route-preserving language switching. Confirm your implementation role and deployment.
- **[NEEDS CONFIRMATION]** Developed a scroll-driven 3D educational-space experience with lazy loading, reduced-motion behavior, and static fallback for rendering failures. Confirm your ownership, device testing, and production use.
- **[NEEDS CONFIRMATION]** Consolidated legacy content routes into a single-page experience using localized redirects and metadata. Confirm your role and validate live redirect behavior.
- **[NEEDS CONFIRMATION]** Implemented a localized project-enquiry form that prepares an email draft from validated visitor input. Confirm your role; never describe this as server-side submission or delivered leads.

No metrics are attached. Add only after measurement and attribution verification.

## Section 12 — Interview Defense Notes

| Candidate | Explain and justify | Trade-off and likely follow-up | Confirm first |
| --- | --- | --- | --- |
| Bilingual site | Locale route validation, `lang`/`dir`, shared copy, switch behavior | Code-managed translation; how was Arabic layout tested? | Specific files you owned; translation review; launch |
| 3D room | Scroll progress, R3F rendering, lazy activation, static fallback | Rendering cost and device coverage; what happens without WebGL? | Design/implementation scope; profiling; real-device checks |
| Route consolidation | Legacy map, anchor redirects, unknown path handling | Legacy pages lose independent content; how were redirects/SEO validated? | Migration ownership; live status codes/search data |
| Enquiry | Browser validation, encoded `mailto`, client state | Mail client dependency; how is delivery known? | Ownership and intended lead process |

Do not prepare first-person implementation stories until contribution is confirmed.

## Section 13 — Missing Evidence and Questions for Me

1. Which parts of this site did you personally design, implement, review, or maintain? Which were built by others?
2. Is this site publicly deployed? If yes, when, where, and are both locales and legacy redirects live?
3. Were 3D fallback, keyboard navigation, Arabic layout, and real-device performance tested? Where are results?
4. Do you have dated Lighthouse or Web Vitals reports for this exact site and pages?
5. Does the mail-draft flow generate actual qualified enquiries? Is delivery/conversion measured outside the site?
6. Why was the site consolidated into one page, and what migration/SEO requirements drove legacy redirects?
7. Does any verified 20% time reduction relate to this website? If so, which process and baseline/new measurements?

## Section 14 — Cross-Project Comparison Notes

This repository supports **BIG Education marketing website** identity, serving prospective educational-institution customers. Distinctive capabilities: bilingual RTL/LTR experience, animated service storytelling, procedural 3D room assembly, mail-draft contact. Technologies: Next.js App Router, React, TypeScript, Motion, React Three Fiber, custom CSS. External group and emergency links exist (`content/site.ts:2-9`) but do not prove a shared API, ownership, or integration.

No evidence here validates three storefronts, shared backend, unified operations dashboard, internal pricing system, school-management system, 20% operations savings, or 98–100 Lighthouse scores. Reserve those claims for audits of the relevant repositories and external records. If multiple sites share bilingual or 3D work, confirm whether code and individual contribution overlap before aggregating CV bullets. This site's lead generation or business impact must not be counted twice under a company-wide dashboard claim.

## Audit limitations and integrity

Read-only inspection only; no source, configuration, dependencies, or existing documentation changed. The report is the sole intended new file. A pre-existing deleted generated image was visible in Git status before report creation and was left untouched. No secret values or private contact details are reproduced. Runtime, deployment, browser accessibility, and benchmark results were not independently verified.
