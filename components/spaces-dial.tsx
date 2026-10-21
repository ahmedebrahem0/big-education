"use client";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { copy, type Locale } from "@/content/site";

type RGB = [number, number, number];
const THEMES: { bg: RGB; fg: RGB; ac: RGB }[] = [
  // Learning: bone paper, teal ink
  { bg: [242, 240, 233], fg: [16, 59, 59], ac: [38, 115, 114] },
  // Technology: deep night, mint light
  { bg: [11, 41, 43], fg: [242, 240, 233], ac: [182, 212, 202] },
  // Creative & social: brand teal, bone light
  { bg: [38, 115, 114], fg: [242, 240, 233], ac: [182, 212, 202] },
];
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t: number) => t * t * (3 - 2 * t);
const mix = (a: RGB, b: RGB, m: number): RGB => [
  a[0] + (b[0] - a[0]) * m,
  a[1] + (b[1] - a[1]) * m,
  a[2] + (b[2] - a[2]) * m,
];
const rgb = (c: RGB) => `rgb(${c.map((v) => Math.round(v)).join(",")})`;

// Dial geometry (SVG units; the wheel is a 2000 x 2000 box, radius 900).
const R = 900;
const STEP = 34; // degrees between neighbouring spaces
const GAP = 14; // extra degrees between chapters
const N = 9;
const theta = (i: number) => i * STEP + Math.floor(i / 3) * GAP;
const HOLD = 0.58; // share of each item's scroll the wheel rests before turning

type Shape =
  | ["p", string]
  | ["c", number, number, number]
  | ["r", number, number, number, number, number]
  | ["e", number, number, number, number, number?];
// One line icon per space, drawn in a 200 x 200 box.
const ICONS: Shape[][] = [
  // 0 classrooms
  [
    ["r", 36, 38, 128, 68, 4],
    ["p", "M54 62H96M54 76H122M54 90H84"],
    ["p", "M44 114H156"],
    ["r", 40, 136, 34, 20, 2],
    ["r", 83, 136, 34, 20, 2],
    ["r", 126, 136, 34, 20, 2],
    ["p", "M57 156V170M100 156V170M143 156V170"],
  ],
  // 1 libraries & digital learning
  [
    ["r", 62, 34, 76, 48, 4],
    ["p", "M100 82V96M84 96H116"],
    ["p", "M92 48L92 68L110 58Z"],
    [
      "p",
      "M100 116C84 104 56 104 40 110V162C56 156 84 156 100 168C116 156 144 156 160 162V110C144 104 116 104 100 116ZM100 116V168",
    ],
  ],
  // 2 learning furniture
  [
    ["r", 54, 112, 62, 10, 3],
    ["p", "M60 112V68Q60 60 68 60H104Q112 60 112 68V112"],
    ["p", "M62 122V166M108 122V166"],
    ["p", "M128 102H172M134 102V166M166 102V166"],
    ["c", 150, 84, 8],
  ],
  // 3 STEM laboratories
  [
    [
      "p",
      "M84 38H116M90 38V82L58 146Q52 164 70 164H130Q148 164 142 146L110 82V38",
    ],
    ["p", "M68 136H132"],
    ["c", 98, 118, 5],
    ["c", 114, 104, 3.5],
    ["c", 104, 92, 2.5],
    ["c", 156, 52, 4],
    ["e", 156, 52, 22, 8, 0],
    ["e", 156, 52, 22, 8, 60],
    ["e", 156, 52, 22, 8, -60],
  ],
  // 4 AI learning environments
  [
    ["c", 100, 100, 74],
    ["c", 54, 72, 6],
    ["c", 54, 100, 6],
    ["c", 54, 128, 6],
    ["c", 100, 58, 6],
    ["c", 100, 86, 6],
    ["c", 100, 114, 6],
    ["c", 100, 142, 6],
    ["c", 146, 86, 6],
    ["c", 146, 114, 6],
    [
      "p",
      "M60 72L94 58M60 72L94 86M60 100L94 86M60 100L94 114M60 128L94 114M60 128L94 142M60 72L94 114M60 128L94 86M106 58L140 86M106 86L140 86M106 86L140 114M106 114L140 114M106 142L140 114M106 142L140 86",
    ],
  ],
  // 5 VR / AR spaces
  [
    ["r", 40, 82, 120, 58, 20],
    ["c", 76, 110, 16],
    ["c", 124, 110, 16],
    ["p", "M92 140Q100 128 108 140"],
    ["p", "M40 100H24V114H40M160 100H176V114H160"],
    ["p", "M100 30L116 39V57L100 66L84 57V39Z"],
  ],
  // 6 art and music studios
  [
    ["p", "M96 50V126M96 50L142 40V112"],
    ["c", 82, 130, 14],
    ["c", 128, 116, 14],
    ["p", "M34 166Q66 138 100 166T166 166"],
    ["c", 52, 60, 5],
    ["c", 156, 72, 4],
  ],
  // 7 theatres and media rooms
  [
    ["p", "M38 34H162"],
    [
      "p",
      "M44 34Q62 94 44 164M62 34Q80 94 62 164M156 34Q138 94 156 164M138 34Q120 94 138 164",
    ],
    ["p", "M36 168H164"],
    ["p", "M92 50H108L130 150H70Z"],
    ["e", 100, 152, 30, 6, 0],
  ],
  // 8 student activity zones
  [
    ["c", 100, 66, 15],
    ["c", 54, 90, 11],
    ["c", 146, 90, 11],
    ["p", "M70 144Q70 96 100 96Q130 96 130 144Z"],
    ["p", "M30 152Q30 112 54 110Q72 110 80 124"],
    ["p", "M170 152Q170 112 146 110Q128 110 120 124"],
    ["p", "M26 162H174"],
  ],
];
function Icon({ shapes }: { shapes: Shape[] }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" aria-hidden="true">
      {shapes.map((s, i) => {
        const style = { transitionDelay: `${i * 70}ms` };
        if (s[0] === "p")
          return <path key={i} pathLength={1} d={s[1]} style={style} />;
        if (s[0] === "c")
          return (
            <circle
              key={i}
              pathLength={1}
              cx={s[1]}
              cy={s[2]}
              r={s[3]}
              style={style}
            />
          );
        if (s[0] === "r")
          return (
            <rect
              key={i}
              pathLength={1}
              x={s[1]}
              y={s[2]}
              width={s[3]}
              height={s[4]}
              rx={s[5]}
              style={style}
            />
          );
        return (
          <ellipse
            key={i}
            pathLength={1}
            cx={s[1]}
            cy={s[2]}
            rx={s[3]}
            ry={s[4]}
            transform={s[5] ? `rotate(${s[5]} ${s[1]} ${s[2]})` : undefined}
            style={style}
          />
        );
      })}
    </svg>
  );
}

// Pinned dial: scrolling turns a giant wheel carrying the nine spaces. The space at the top
// is drawn in the lens; crossing a chapter floods the page with the next colour from the lens.
export function SpacesDial({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const reduced = useReducedMotion();
  const root = useRef<HTMLElement>(null);
  const jump = useRef<(i: number) => void>(() => {});
  const [active, setActive] = useState(0);
  const arabic = locale === "ar";
  const names = c.spaces.flat();
  const details = c.spaceDetails.flat();
  const chapter = Math.floor(active / 3);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let current = -1;
    const paint = (i: number, local: number) => {
      const snap = i < N - 1 ? smooth(clamp((local - HOLD) / (1 - HOLD))) : 0;
      const pos = theta(i) + (i < N - 1 ? (theta(i + 1) - theta(i)) * snap : 0);
      const shown = snap > 0.5 ? i + 1 : i;
      const a = Math.floor(i / 3);
      const m = i % 3 === 2 && i < N - 1 ? snap : 0;
      const b = Math.min(2, a + 1);
      const text = smooth(clamp((m - 0.4) / 0.25));
      el.style.setProperty("--rot", `${(-pos).toFixed(2)}deg`);
      el.style.setProperty("--bg", rgb(THEMES[a].bg));
      el.style.setProperty("--bg2", rgb(THEMES[b].bg));
      el.style.setProperty("--wr", (m * 160).toFixed(1));
      el.style.setProperty("--fg", rgb(mix(THEMES[a].fg, THEMES[b].fg, text)));
      el.style.setProperty("--ac", rgb(mix(THEMES[a].ac, THEMES[b].ac, text)));
      if (shown !== current) {
        current = shown;
        setActive(shown);
      }
    };
    const fromScroll = () => {
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const p = span > 0 ? clamp(-r.top / span) : 0;
      const t = Math.min(N - 0.0001, p * N);
      const i = Math.floor(t);
      paint(i, t - i);
    };
    jump.current = (i: number) => {
      const k = clamp(Math.round(i), 0, N - 1);
      if (reduced) {
        paint(k, 0.2);
        return;
      }
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      window.scrollTo({
        top: window.scrollY + r.top + (span * (k + 0.25)) / N,
        behavior: "smooth",
      });
    };
    if (reduced) paint(0, 0.2);
    else fromScroll();
    const onScroll = reduced ? () => {} : fromScroll;
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduced]);

  const next = () => active < N - 1 && jump.current(active + 1);
  const prev = () => active > 0 && jump.current(active - 1);
  const ticks = Array.from({ length: 120 }, (_, k) => k * 3);
  const PrevIcon = arabic ? ArrowRight : ArrowLeft;
  const NextIcon = arabic ? ArrowLeft : ArrowRight;
  return (
    <section
      className="dl"
      id="spaces"
      ref={root}
      data-static={reduced ? "1" : undefined}
    >
      <div className="dl-stage">
        <div className="dl-wash" aria-hidden="true" />
        <div className="dl-top">
          <span className="eyebrow">{c.spacesLabel}</span>
          <h2>{c.spacesTitle}</h2>
          <div
            className="dl-chapters"
            role="tablist"
            aria-label={c.spacesLabel}
          >
            {c.filters.map((f, n) => {
              const fill =
                n < chapter ? 1 : n === chapter ? ((active % 3) + 1) / 3 : 0;
              return (
                <button
                  key={f}
                  role="tab"
                  aria-selected={chapter === n}
                  className="dl-chapter"
                  data-on={chapter === n}
                  onClick={() => jump.current(n * 3)}
                >
                  <span>0{n + 1}</span>
                  {f}
                  <i style={{ transform: `scaleX(${fill})` }} />
                </button>
              );
            })}
          </div>
        </div>

        <div className="dl-lens" aria-hidden="true">
          <i className="dl-halo" />
          <svg className="dl-ring" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="98" />
          </svg>
          <div className="dl-icons">
            {ICONS.map((shapes, i) => (
              <div key={i} className="dl-ic" data-on={active === i}>
                <Icon shapes={shapes} />
              </div>
            ))}
          </div>
        </div>

        <div className="dl-info" key={active} aria-live="polite">
          <span className="dl-count">
            {String(active + 1).padStart(2, "0")} / 09 · {c.filters[chapter]}
          </span>
          <h3>{names[active]}</h3>
          <p>{details[active]}</p>
          <div className="dl-nav">
            <button
              onClick={prev}
              disabled={active === 0}
              aria-label={c.close + " -"}
            >
              <PrevIcon size={18} />
            </button>
            <button
              onClick={next}
              disabled={active === N - 1}
              aria-label={c.learn}
            >
              <NextIcon size={18} />
            </button>
          </div>
        </div>

        <i className="dl-pin" aria-hidden="true" />
        <div className="dl-wheel" aria-hidden="true">
          <svg viewBox="-1000 -1000 2000 2000">
            <circle r={R} className="dl-rim" />
            <circle r={R - 130} className="dl-rim dl-thin" />
            <circle r={R - 520} className="dl-rim dl-thin" />
            {ticks.map((a) => (
              <line
                key={a}
                x1={0}
                x2={0}
                y1={-R}
                y2={-R + (a % 15 === 0 ? 38 : 18)}
                transform={`rotate(${a})`}
                className="dl-tick"
              />
            ))}
            {names.map((name, i) => (
              <g
                key={name}
                style={{
                  transform: `rotate(${theta(i)}deg) translateY(${-(active === i ? R - 92 : R - 200)}px)`,
                }}
                className="dl-label"
                data-on={active === i}
                data-far={Math.abs(i - active) > 2}
                onClick={() => jump.current(i)}
              >
                <text textAnchor="middle">{name}</text>
              </g>
            ))}
            {c.filters.map((f, k) => (
              <g
                key={f}
                transform={`rotate(${(theta(k * 3) + theta(k * 3 + 2)) / 2}) translate(0 ${-(R - 340)})`}
                className="dl-chap"
              >
                <text textAnchor="middle">{f}</text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    </section>
  );
}
