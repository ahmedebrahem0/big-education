# BIG Education — Brand Identity Review

Source: `Brand Guidelines/Big Education - Brand Identity.pdf`, user-supplied pasted text, and `Brand Identity/slide-15.png` (the only image currently visible in that folder). The text labels the guide as 2025.

## Logo rules

- Approved orientations: main horizontal, vertical, and icon. The actual logo files are present in `Logo/`.
- Clear space: the guide uses the height of the letter **B** as unit `x`; keep at least **3x** on all four sides of the complete logo.
- Do not stretch, distort, skew, recolor outside approved palette, or remove `EDUCATION` from the complete logo.
- Use approved full-color, grayscale, black/white or reversed variations with sufficient contrast.
- Text extraction says minimum print size “Height - 20x”, but the unit/diagram cannot be interpreted reliably from text alone. Do not transfer this to a web pixel minimum until the source page is inspected.
- Icon-only use appears approved as a distinct orientation; it does **not** permit deleting `EDUCATION` from the full lockup.

## Color codes supplied by the guide

| Role in guide | Hex | Practical web role proposed |
|---|---|---|
| Primary | `#267372` | Main teal, large brand surfaces |
| Primary | `#3B928C` | Active states, bright teal accents |
| Primary | `#D8B5A3` | Warm supporting accent |
| Primary | `#000000` | High contrast text, sparing use |
| Secondary | `#769897` | Muted teal |
| Secondary | `#DADBE7` | Cool pale neutral |
| Secondary | `#BEA38F` | Muted warm accent |

The guide lists 80% and 50% tints for several colors. A “color usage” page lists `40%, 30%, 10%, 10%, 10%` without a reliable text mapping to specific swatches. Treat those as unassigned until the visual page is available.

## Typography: ambiguity in the guide

- The English typography section opens with **Montserrat** in generic introductory copy, then specifically names **“Alexandera”** as the primary English font. This appears inconsistent and possibly misspelled.
- The Arabic section opens with **Tajawal** in generic introductory copy, then specifically names **Alexandria** as the primary Arabic font. It also spells it once as “Alxandria”.
- The actual user-supplied font files in both `Fonts/Arabic` and `Fonts/English` are `Alexandria[wght].ttf`. Therefore **Alexandria Variable** is the strongest asset-backed choice for both scripts until the company clarifies the English specification.
- Both light/medium and regular/bold weights are shown in the guide text. Use typographic hierarchy, not one weight for all content.

## Slogan, assets and image rules

- English slogan in the guide: `WE BUILD EDUCATION.. WHERE THE WORLD NEEDS IT MOST`.
- Arabic slogan appears as `نصنع التعليم حيث يحتاجه العالم` on one page. Arabic phrasing and punctuation should be approved before publishing.
- The guide includes business card, letterhead, envelope, pattern and social media mockups.
- The one image available (`slide-15.png`) shows three tall flags with white and teal reversed marks and the English slogan. It confirms that the white rabbit mark is used on a dark teal field and teal text appears on white.
- Names, email addresses, phone numbers and street address on stationery mockups appear to be sample content (`Saad Nageeb`, `saad.nageeb@bigeducation.com`, `012 345 678`, placeholder street address and lorem ipsum). Do **not** copy these as real contact information. Use the Company Profile contact page instead.

## Website implementation consequences

1. Define CSS design tokens for the seven exact color codes; preserve the original full-color and reversed logo variants.
2. Reserve logo clear space in header, footer and mobile navigation. The 3x rule applies to the complete lockup; the icon can be used where the full logo cannot fit.
3. Use Alexandria Variable, with distinct display and body weights. Validate Arabic rendering and RTL layouts explicitly.
4. Derive motion graphics from the rabbit silhouette and the fine-line brand pattern. The source PDF's static examples should guide visual tone, not force a static website.
5. Apply approved colors to 3D materials. Avoid introducing strong non-brand hues as dominant surfaces.
6. Test contrast on `#267372`, `#3B928C`, and tinted backgrounds before setting text colors.

## Still to confirm from visuals or company

- Exact color usage allocation from page 13.
- Exact web-safe minimum logo size and whether the logo clear-space diagram differs for icon-only usage.
- Whether English should use Alexandria, Alexandera, or Montserrat; asset files currently support Alexandria.
- Complete image set for the Brand Identity guide. Only `slide-15.png` is currently in `Brand Identity/`.
