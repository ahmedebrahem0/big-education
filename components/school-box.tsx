"use client";
import { useRef, type CSSProperties } from "react";
import { useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { contact, copy, type Locale } from "@/content/site";
import { smooth, useScrub, win } from "./use-scrub";

const rr = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 ${-r} ${r}h${-(w - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(h - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}z`;
const circ = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;

// scroll windows for each thing that comes out of the box
const WIN = {
  box: [0, 0.1],
  lid: [0.12, 0.24],
  tent: [0.22, 0.42],
  board: [0.4, 0.52],
  left: [0.5, 0.62],
  right: [0.58, 0.7],
  kid: [0.66, 0.74],
  sun: [0.72, 0.86],
  copy: [0.84, 0.94],
} as const;

const RAYS = Array.from({ length: 12 }, (_, k) => {
  const a = (k / 12) * Math.PI * 2;
  const p = (r: number) => `${(600 + Math.cos(a) * r).toFixed(1)} ${(106 + Math.sin(a) * r).toFixed(1)}`;
  return `M${p(86)}L${p(112)}`;
});
const STARS = [
  [170, 120, 3],
  [300, 50, 2.5],
  [420, 120, 2],
  [820, 70, 2.5],
  [940, 110, 3],
  [1050, 60, 2],
];

// a desk with a book and a child sitting behind it; (0,0) is the left end of the desk top
function Desk() {
  return (
    <>
      <path pathLength={1} d="M0 0H190" />
      <path pathLength={1} d="M16 0V100M174 0V100" />
      <path pathLength={1} d="M65 -2q15 -12 30 0q15 -12 30 0" />
      <path pathLength={1} d={circ(95, -92, 20)} />
      <path pathLength={1} d="M75 -102q20 -24 40 0" />
      <path pathLength={1} d="M52 0V-30Q52 -64 95 -66Q138 -64 138 -30V0" />
    </>
  );
}

export function SchoolBox({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const reduced = useReducedMotion();
  const root = useRef<HTMLElement>(null);

  useScrub(root, reduced, (s) => {
    const el = root.current;
    if (!el) return;
    const set = (k: string, v: number) => el.style.setProperty(k, v.toFixed(3));
    const e = (k: keyof typeof WIN) => smooth(win(s, WIN[k][0], WIN[k][1]));
    set("--e0", e("box"));
    set("--lid", e("lid"));
    set("--e1", e("tent"));
    set("--e2", e("board"));
    set("--e3", e("left"));
    set("--e4", e("right"));
    set("--e5", e("kid"));
    set("--e6", e("sun"));
    set("--cp", e("copy"));
  });

  const item = (n: number): CSSProperties =>
    ({ "--e": `var(--e${n})` }) as CSSProperties;

  return (
    <section
      className="sb"
      id="emergency"
      ref={root}
      data-static={reduced ? "1" : undefined}
    >
      <div className="sb-stage">
        <div className="sb-glow" aria-hidden="true" />
        <div className="sb-head">
          <span className="eyebrow">{c.emergencyLabel}</span>
          <h2>{c.emergencyTitle}</h2>
        </div>

        <svg
          className="sb-scene"
          viewBox="0 0 1200 700"
          role="img"
          aria-label={c.emergencyTitle.replace("\n", " ")}
        >
          <defs>
            <linearGradient id="sbBeam" x1="0" x2="0" y1="1" y2="0">
              <stop offset="0" stopColor="var(--ac)" stopOpacity="0.7" />
              <stop offset="1" stopColor="var(--ac)" stopOpacity="0" />
            </linearGradient>
          </defs>

          <path className="sb-beam" d="M492 402L380 120H820L708 402z" fill="url(#sbBeam)" />

          <g className="sb-it sb-sun" style={item(6)}>
            <path pathLength={1} d={circ(600, 106, 64)} />
            {RAYS.map((d, i) => (
              <path key={i} pathLength={1} d={d} />
            ))}
            {STARS.map(([x, y, r], i) => (
              <path key={`s${i}`} pathLength={1} d={circ(x, y, r)} />
            ))}
          </g>

          <g className="sb-it sb-tent" style={item(1)}>
            <path pathLength={1} d="M170 570V400Q170 350 215 330L600 170L985 330Q1030 350 1030 400V570" />
            <path pathLength={1} d="M170 400Q260 436 350 400T530 400T710 400T890 400T1030 400" />
          </g>

          <g className="sb-it" style={item(2)}>
            <path pathLength={1} d={rr(440, 235, 320, 110, 8)} />
            <path pathLength={1} d="M476 275h110M476 305h170M690 275l20 22l30 -34" />
            <path pathLength={1} d="M520 345V402M680 345V402" />
          </g>

          <g className="sb-it" style={item(3)}>
            <g transform="translate(190 470)">
              <Desk />
            </g>
          </g>
          <g className="sb-it" style={item(4)}>
            <g transform="translate(820 470)">
              <Desk />
            </g>
          </g>

          <g className="sb-it" style={item(5)}>
            <path pathLength={1} d={circ(784, 432, 20)} />
            <path pathLength={1} d="M764 424q20 -26 40 0" />
            <path pathLength={1} d="M784 454V522M784 478l-36 -54M784 480l24 26M784 522l-15 48M784 522l15 48" />
          </g>

          <g className="sb-box" style={item(0)}>
            <path pathLength={1} d="M40 570H1160" className="sb-ground" />
            <path pathLength={1} d={rr(470, 400, 260, 170, 10)} />
            <path pathLength={1} d="M470 440H730" />
            <path pathLength={1} d={rr(560, 414, 80, 14, 7)} />
            <text x="600" y="486" textAnchor="middle" className="sb-t1">
              BIG
            </text>
            <text x="600" y="516" textAnchor="middle" className="sb-t2">
              SCHOOL
            </text>
            <text x="600" y="544" textAnchor="middle" className="sb-t2">
              IN A BOX
            </text>
            <g className="sb-lid">
              <path pathLength={1} d={rr(460, 368, 280, 32, 6)} />
            </g>
          </g>
        </svg>

        <div className="sb-foot">
          <p>{c.emergencyText}</p>
          <a
            className="button light"
            href={contact.emergency}
            target="_blank"
            rel="noreferrer"
          >
            {c.external}
            <ArrowUpRight size={19} />
          </a>
        </div>
      </div>
    </section>
  );
}
