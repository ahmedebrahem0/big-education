"use client";
import { useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { copy, type Locale } from "@/content/site";
import { clamp, smooth, useScrub, win } from "./use-scrub";

const rr = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r} ${y}h${w - 2 * r}a${r} ${r} 0 0 1 ${r} ${r}v${h - 2 * r}a${r} ${r} 0 0 1 ${-r} ${r}h${-(w - 2 * r)}a${r} ${r} 0 0 1 ${-r} ${-r}v${-(h - 2 * r)}a${r} ${r} 0 0 1 ${r} ${-r}z`;
const circ = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;

// Parts nested on one sheet: standard furniture on the left, smart furniture on the right.
const PARTS: { id: string; d: string; x: number; y: number; tag?: boolean }[] = [
  { id: "A1", d: rr(70, 90, 190, 150, 16), x: 84, y: 118, tag: true },
  { id: "A2", d: rr(290, 90, 200, 100, 16), x: 304, y: 118, tag: true },
  { id: "A3", d: rr(290, 210, 200, 34, 8), x: 0, y: 0 },
  { id: "A4", d: rr(70, 280, 44, 320, 8), x: 0, y: 0 },
  { id: "A5", d: rr(134, 280, 44, 320, 8), x: 0, y: 0 },
  { id: "A6", d: rr(198, 280, 44, 320, 8), x: 0, y: 0 },
  { id: "A7", d: rr(270, 280, 220, 150, 16), x: 284, y: 308, tag: true },
  { id: "A8", d: rr(270, 450, 220, 150, 16), x: 284, y: 478, tag: true },
  { id: "B1", d: rr(530, 90, 400, 150, 18), x: 592, y: 122, tag: true },
  { id: "B2", d: rr(530, 270, 260, 190, 14), x: 548, y: 298, tag: true },
  { id: "B3", d: circ(660, 385, 30), x: 0, y: 0 },
  { id: "B4", d: rr(820, 270, 110, 330, 12), x: 834, y: 298, tag: true },
  { id: "B5", d: rr(530, 490, 260, 110, 12), x: 548, y: 518, tag: true },
  { id: "B6", d: circ(562, 121, 9), x: 0, y: 0 },
  { id: "B7", d: circ(898, 121, 9), x: 0, y: 0 },
];
// the three quality gates sweep the sheet inside these scroll windows
const GATES: [number, number][] = [
  [0.62, 0.72],
  [0.74, 0.84],
  [0.86, 0.94],
];
const CUT: [number, number] = [0.18, 0.6];

const UI = {
  en: { std: "STANDARD", smart: "SMART", gate: "QUALITY GATE" },
  ar: { std: "قياسي", smart: "ذكي", gate: "بوابة الجودة" },
};

type Geo = { a: number[]; b: number[]; len: number[] };

export function FactoryCut({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const ui = UI[locale];
  const reduced = useReducedMotion();
  const root = useRef<HTMLElement>(null);
  const els = useRef<(SVGPathElement | null)[]>([]);
  const geo = useRef<Geo | null>(null);
  const [stage, setStage] = useState(0);
  const shownStage = useRef(-1);

  useScrub(root, reduced, (s) => {
    const el = root.current;
    if (!el) return;
    if (!geo.current) {
      const len = els.current.map((p) => p?.getTotalLength() ?? 1);
      const w = len.map((l) => l + 50);
      const sum = w.reduce((t, v) => t + v, 0);
      let acc = 0;
      const a: number[] = [];
      const b: number[] = [];
      w.forEach((v) => {
        a.push(acc / sum);
        acc += v;
        b.push((acc - 50) / sum);
      });
      geo.current = { a, b, len };
    }
    const g = geo.current;
    const set = (k: string, v: number) => el.style.setProperty(k, v.toFixed(3));
    set("--sheet", win(s, 0, 0.06));
    set("--split", win(s, 0.04, 0.14));
    const p = win(s, CUT[0], CUT[1]);
    let head = -1;
    let hc = 0;
    PARTS.forEach((_, i) => {
      const ci = clamp((p - g.a[i]) / (g.b[i] - g.a[i]));
      set(`--c${i}`, ci);
      if (p >= g.a[i] && p < 1 && ci < 1 + 1e-9) {
        head = i;
        hc = ci;
      }
    });
    const live = p > 0 && p < 1 && head >= 0 && els.current[head];
    if (live) {
      const pt = els.current[head]!.getPointAtLength(hc * g.len[head]);
      set("--hx", pt.x);
      set("--hy", pt.y);
    }
    set("--ho", live ? 1 : 0);
    let sweep = 0;
    GATES.forEach(([a, b], k) => {
      const q = win(s, a, b);
      set(`--g${k}`, smooth(q));
      if (q > 0 && q < 1) {
        sweep = 1;
        set("--sx", 40 + q * 920);
      }
    });
    set("--so", sweep);
    set("--ok", smooth(win(s, 0.93, 0.98)));
    set("--sp0", win(s, 0, 0.17));
    set("--sp1", win(s, 0.17, 0.61));
    set("--sp2", win(s, 0.61, 0.94));
    const st = s < 0.17 ? 0 : s < 0.61 ? 1 : 2;
    if (st !== shownStage.current) {
      shownStage.current = st;
      setStage(st);
    }
  });

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
                style={{ "--sp": `var(--sp${i})` } as React.CSSProperties}
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
          viewBox="0 0 1000 740"
          role="img"
          aria-label={c.factoryTitle.replace("\n", " ")}
        >
          <defs>
            <pattern id="fcGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M20 0H0V20" className="fc-gridline" />
            </pattern>
            <linearGradient id="fcScan" x1="0" x2="1">
              <stop offset="0" stopColor="var(--ac)" stopOpacity="0" />
              <stop offset="1" stopColor="var(--ac)" stopOpacity="0.55" />
            </linearGradient>
          </defs>

          <g className="fc-sheet">
            <rect x="40" y="50" width="920" height="600" fill="url(#fcGrid)" />
            <path pathLength={1} d="M40 50H960V650H40Z" className="fc-edge" />
            <path
              d="M40 80V50H70M930 50H960V80M960 620V650H930M70 650H40V620"
              className="fc-corner"
            />
          </g>
          <path d="M500 50V650" className="fc-split" />
          <text x="270" y="34" textAnchor="middle" className="fc-chip">
            {ui.std}
          </text>
          <text x="730" y="34" textAnchor="middle" className="fc-chip">
            {ui.smart}
          </text>

          {PARTS.map((p, i) => (
            <g key={p.id} className="fc-part">
              <path
                d={p.d}
                className="fc-fill"
                style={{ "--c": `var(--c${i})` } as React.CSSProperties}
              />
              <path
                ref={(n) => {
                  els.current[i] = n;
                }}
                d={p.d}
                pathLength={1}
                className="fc-cut"
                style={{ "--c": `var(--c${i})` } as React.CSSProperties}
              />
              {p.tag && (
                <text
                  x={p.x}
                  y={p.y}
                  className="fc-id"
                  style={{ "--c": `var(--c${i})` } as React.CSSProperties}
                >
                  {p.id}
                </text>
              )}
            </g>
          ))}

          <g className="fc-head">
            <path d="M40 0H960" className="fc-gx" />
            <path d="M0 50V650" className="fc-gy" />
            <circle r="7" className="fc-spark" />
          </g>

          <rect x="-60" y="50" width="60" height="600" fill="url(#fcScan)" className="fc-scan" />

          <g className="fc-gates">
            <text x="40" y="690" className="fc-gate-label">
              {ui.gate}
            </text>
            {[0, 1, 2].map((k) => (
              <g key={k} transform={`translate(${52 + k * 46} 716)`}>
                <circle r="13" className="fc-lamp-ring" />
                <circle
                  r="13"
                  className="fc-lamp"
                  style={{ "--g": `var(--g${k})` } as React.CSSProperties}
                />
                <text y="4" textAnchor="middle" className="fc-lamp-n">
                  {k + 1}
                </text>
              </g>
            ))}
          </g>
          <g className="fc-stamp" transform="translate(890 690)">
            <circle r="34" pathLength={1} />
            <circle r="26" pathLength={1} />
            <path d="M-13 1l9 10 17-21" pathLength={1} />
          </g>
        </svg>
      </div>
    </section>
  );
}
