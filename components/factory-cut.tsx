"use client";
import { useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { copy, type Locale } from "@/content/site";
import { clamp, smooth, useScrub, win } from "./use-scrub";

// ---------- isometric furniture, built from boxes ----------
type Box = [number, number, number, number, number, number]; // x y z w d h
type Part = {
  dz: number; // exploded offset in px (negative = up)
  t: string;
  l: string;
  r: string;
  cx: number;
  cy: number;
  tag?: string;
  dx?: number;
  screen?: boolean;
};

const poly = (pts: number[][]) =>
  "M" + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("L") + "Z";

function build(
  ox: number,
  oy: number,
  k: number,
  boxes: { b: Box; dz: number; tag?: string; dx?: number; screen?: boolean }[],
): Part[] {
  const P = (x: number, y: number, z: number) => [
    ox + (x - y) * 0.866 * k,
    oy + (x + y) * 0.5 * k - z * k,
  ];
  return boxes.map(({ b: [x, y, z, w, d, h], dz, tag, dx, screen }) => {
    const c = P(x + w / 2, y + d / 2, z + h / 2);
    return {
      dz,
      tag,
      dx,
      screen,
      cx: c[0],
      cy: c[1],
      t: poly([P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)]),
      l: poly([P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h)]),
      r: poly([P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h)]),
    };
  });
}

// listed far-to-near so later parts paint over earlier ones
const CHAIR = build(270, 372, 2.6, [
  { b: [0, 0, 0, 4, 4, 88], dz: 0 },
  { b: [36, 0, 0, 4, 4, 88], dz: 0 },
  { b: [5, 0.5, 56, 30, 3, 26], dz: -112, tag: "back", dx: 112 },
  { b: [0, 36, 0, 4, 4, 45], dz: 0, tag: "frame", dx: 190 },
  { b: [36, 36, 0, 4, 4, 45], dz: 0 },
  { b: [4, 37, 14, 32, 2.5, 3], dz: 30 },
  { b: [0, 4, 45, 40, 36, 5], dz: -56, tag: "seat", dx: 128 },
]);
const DESK = build(728, 398, 2.2, [
  { b: [2, 2, 0, 4, 4, 70], dz: 0 },
  { b: [64, 2, 0, 4, 4, 70], dz: 0 },
  { b: [6, 6, 28, 58, 33, 2], dz: 34, tag: "shelf", dx: 150 },
  { b: [2, 39, 0, 4, 4, 70], dz: 0 },
  { b: [64, 39, 0, 4, 4, 70], dz: 0 },
  { b: [0, 0, 70, 70, 45, 4], dz: -42, tag: "top", dx: 170 },
  { b: [10, 8, 74, 44, 27, 1.2], dz: -112, tag: "screen", dx: 120, screen: true },
]);
const PARTS = [...CHAIR, ...DESK];

// quality gates sweep the finished products inside these scroll windows
const GATES: [number, number][] = [
  [0.64, 0.74],
  [0.76, 0.86],
  [0.88, 0.95],
];
const CUT: [number, number] = [0.14, 0.46];
const ASSEMBLE: [number, number] = [0.46, 0.62];

const UI = {
  en: {
    std: "STANDARD",
    smart: "SMART",
    gate: "QUALITY GATES",
    coats: ["BASE COAT", "COLOUR", "GLOSS"],
    tags: {
      back: "BACKREST",
      seat: "SEAT",
      frame: "FRAME",
      shelf: "BAG SHELF",
      top: "DESK TOP",
      screen: "SMART DISPLAY",
    },
  },
  ar: {
    std: "قياسي",
    smart: "ذكي",
    gate: "بوابات الجودة",
    coats: ["الطبقة الأساس", "اللون", "التلميع"],
    tags: {
      back: "مسند الظهر",
      seat: "المقعد",
      frame: "الهيكل",
      shelf: "رف الحقيبة",
      top: "سطح المكتب",
      screen: "شاشة ذكية",
    },
  },
};

// the three gates are three finishing passes: base coat, colour coat, gloss
type RGB = [number, number, number];
const RAW: RGB = [226, 222, 208];
const COATS: RGB[] = [
  [182, 212, 202], // base coat: brand mint
  [59, 146, 140], // colour coat: brand bright teal
  [24, 92, 94], // gloss coat deepens the colour to a rich teal
];
const SCAN = ["#b6d4ca", "#3b928c", "#ffffff"];
const mixc = (a: RGB, b: RGB, m: number): RGB => [
  a[0] + (b[0] - a[0]) * m,
  a[1] + (b[1] - a[1]) * m,
  a[2] + (b[2] - a[2]) * m,
];

type Geo = { a: number[]; b: number[]; len: number[] };

export function FactoryCut({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const ui = UI[locale];
  const reduced = useReducedMotion();
  const root = useRef<HTMLElement>(null);
  const els = useRef<(SVGPathElement | null)[]>([]);
  const beam = useRef<SVGPathElement>(null);
  const geo = useRef<Geo | null>(null);
  const [stage, setStage] = useState(0);
  const shownStage = useRef(-1);

  useScrub(root, reduced, (s) => {
    const el = root.current;
    if (!el) return;
    if (!geo.current) {
      const len = els.current.map((p) => p?.getTotalLength() ?? 1);
      const w = len.map((l) => l + 60);
      const sum = w.reduce((t, v) => t + v, 0);
      let acc = 0;
      const a: number[] = [];
      const b: number[] = [];
      w.forEach((v) => {
        a.push(acc / sum);
        acc += v;
        b.push((acc - 60) / sum);
      });
      geo.current = { a, b, len };
    }
    const g = geo.current;
    const set = (k: string, v: number) => el.style.setProperty(k, v.toFixed(3));
    set("--ghost", win(s, 0, 0.07));
    set("--split", win(s, 0.04, 0.13));
    const p = win(s, CUT[0], CUT[1]);
    let head = -1;
    let hc = 0;
    PARTS.forEach((_, i) => {
      const ci = clamp((p - g.a[i]) / (g.b[i] - g.a[i]));
      set(`--c${i}`, ci);
      if (p >= g.a[i]) {
        head = i;
        hc = ci;
      }
    });
    set("--ex", 1 - smooth(win(s, ASSEMBLE[0], ASSEMBLE[1])));
    const live = p > 0 && p < 1 && head >= 0 && els.current[head];
    if (live) {
      const pt = els.current[head]!.getPointAtLength(hc * g.len[head]);
      const x = pt.x;
      const y = pt.y + PARTS[head].dz;
      set("--hx", x);
      set("--hy", y);
      beam.current?.setAttribute("d", `M${x.toFixed(1)} 20V${y.toFixed(1)}`);
    }
    set("--ho", live ? 1 : 0);
    let sweep = 0;
    const band: number[] = [];
    GATES.forEach(([a, b], k) => {
      const q = win(s, a, b);
      set(`--g${k}`, smooth(q));
      band.push(q <= 0 ? -Infinity : q >= 1 ? Infinity : -60 + q * 1120 + 30);
      if (q > 0 && q < 1) {
        sweep = 1;
        set("--sx", -60 + q * 1120);
        el.style.setProperty("--sc", SCAN[k]);
      }
    });
    // each part takes a coat once the band has passed over it
    PARTS.forEach((p, i) => {
      const a = band.map((bx) => smooth(clamp((bx - p.cx + 70) / 140)));
      let col = mixc(RAW, COATS[0], a[0]);
      col = mixc(col, COATS[1], a[1]);
      col = mixc(col, COATS[2], a[2]);
      el.style.setProperty(`--pt${i}`, `rgb(${col.map((v) => Math.round(v)).join(",")})`);
      set(`--gl${i}`, a[2]);
    });
    set("--so", sweep);
    set("--ok", smooth(win(s, 0.95, 0.99)));
    set("--sp0", win(s, 0, CUT[0]));
    set("--sp1", win(s, CUT[0], 0.63));
    set("--sp2", win(s, 0.63, 0.96));
    const st = s < CUT[0] ? 0 : s < 0.63 ? 1 : 2;
    if (st !== shownStage.current) {
      shownStage.current = st;
      setStage(st);
    }
  });

  const vars = (i: number, dz: number) =>
    ({
      "--c": `var(--c${i})`,
      "--pt": `var(--pt${i})`,
      "--gl": `var(--gl${i})`,
      "--dz": `${dz}px`,
    }) as CSSProperties;

  return (
    <section
      className="fc"
      id="factory"
      ref={root}
      data-static={reduced ? "1" : undefined}
    >
      <div className="fc-stage">
        <div className="fc-copy">
          <span className="eyebrow">{c.factoryLabel}</span>
          <h2>{c.factoryTitle}</h2>
          <p>{c.factoryText}</p>
          <ol className="fc-steps">
            {c.factoryTags.map((t, i) => (
              <li
                key={t}
                data-on={stage === i}
                data-done={stage > i}
                style={{ "--sp": `var(--sp${i})` } as CSSProperties}
              >
                <b>0{i + 1}</b>
                <span>{t}</span>
                <i aria-hidden="true" />
              </li>
            ))}
          </ol>
          <a className="button fc-cta" href="#contact">
            {c.start}
            <ArrowUpRight size={19} />
          </a>
        </div>

        <svg
          className="fc-bench"
          viewBox="0 0 1000 660"
          role="img"
          aria-label={c.factoryTitle.replace("\n", " ")}
        >
          <defs>
            <linearGradient id="fcScan" x1="0" x2="1">
              <stop offset="0" stopColor="var(--sc)" stopOpacity="0" />
              <stop offset="0.8" stopColor="var(--sc)" stopOpacity="0.45" />
              <stop offset="1" stopColor="var(--sc)" stopOpacity="0.95" />
            </linearGradient>
            <linearGradient id="fcGloss" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#fff" stopOpacity="0.85" />
              <stop offset="0.45" stopColor="#fff" stopOpacity="0.08" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </defs>

          <text x="270" y="40" textAnchor="middle" className="fc-chip">
            {ui.std}
          </text>
          <text x="740" y="40" textAnchor="middle" className="fc-chip">
            {ui.smart}
          </text>

          <ellipse cx="270" cy="428" rx="130" ry="36" className="fc-shadow" />
          <ellipse cx="752" cy="462" rx="190" ry="50" className="fc-shadow" />

          {PARTS.map((p, i) => (
            <path
              key={`g${i}`}
              d={`M${p.cx.toFixed(1)} ${p.cy.toFixed(1)}v${p.dz}`}
              className="fc-guide"
            />
          ))}

          {PARTS.map((p, i) => (
            <g key={i} className="fc-part" style={vars(i, p.dz)}>
              <path d={p.l} className="fc-fill fc-fl" />
              <path d={p.r} className="fc-fill fc-fr" />
              <path
                d={p.t}
                className={p.screen ? "fc-fill fc-ft fc-screen" : "fc-fill fc-ft"}
              />
              <path d={p.t} className="fc-gloss" fill="url(#fcGloss)" />
              <path d={p.r} className="fc-gloss fc-gloss-r" fill="url(#fcGloss)" />
              <g className="fc-ghost">
                <path d={p.l} />
                <path d={p.r} />
                <path d={p.t} />
              </g>
              <g className="fc-edges">
                <path d={p.l} />
                <path d={p.r} />
                <path
                  ref={(n) => {
                    els.current[i] = n;
                  }}
                  d={p.t}
                  pathLength={1}
                  className="fc-trace"
                />
              </g>
              {p.tag && (
                <g className="fc-lab">
                  <path d={`M${p.cx.toFixed(1)} ${p.cy.toFixed(1)}H${(p.cx + (p.dx ?? 100) - 8).toFixed(1)}`} />
                  <text x={p.cx + (p.dx ?? 100)} y={p.cy + 4}>
                    {ui.tags[p.tag as keyof typeof ui.tags]}
                  </text>
                </g>
              )}
            </g>
          ))}

          <g className="fc-head">
            <path ref={beam} d="M0 20V20" className="fc-beam" />
            <circle r="7" className="fc-spark" />
          </g>

          <rect x="0" y="52" width="60" height="520" fill="url(#fcScan)" className="fc-scan" />

          <g className="fc-gates">
            <text x="40" y="598" className="fc-gate-label">
              {ui.gate}
            </text>
            {[0, 1, 2].map((k) => (
              <g key={k} transform={`translate(${52 + k * 190} 624)`}>
                <text x="24" y="4" className="fc-coat">
                  {ui.coats[k]}
                </text>
                <circle r="13" className="fc-lamp-ring" />
                <circle
                  r="13"
                  className="fc-lamp"
                  style={{ "--g": `var(--g${k})` } as CSSProperties}
                />
                <text y="4" textAnchor="middle" className="fc-lamp-n">
                  {k + 1}
                </text>
              </g>
            ))}
          </g>
          <g className="fc-stamp" transform="translate(900 606)">
            <circle r="34" pathLength={1} />
            <circle r="26" pathLength={1} />
            <path d="M-13 1l9 10 17-21" pathLength={1} />
          </g>
        </svg>
      </div>
    </section>
  );
}
