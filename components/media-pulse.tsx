"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "motion/react";
import { copy, type Locale } from "@/content/site";

// The ECG line lives in a 1600 x 400 box that is stretched over the stage.
const W = 1600;
const H = 400;
const BASE = 260;
const BEATS = [320, 800, 1280];
const PEAK_DX = -26; // the R spike peaks 26 units before the beat centre
const BX = BEATS.map((b) => ((b + PEAK_DX) / W) * 100);
const beat = (x: number) =>
  `H${x - 170} q22 -34 44 0 H${x - 70} l14 16 l30 -196 l32 240 l16 -60 H${x + 60} q36 -56 72 0`;
const LINE = `M0 ${BASE} ${BEATS.map(beat).join(" ")} H${W}`;

// Scroll position (0..1) -> how far the pulse has travelled; plateaus rest on each beat.
const HOLDS = [
  [0.2, 0.32],
  [0.5, 0.62],
  [0.8, 0.92],
];
const JUMP = [0.26, 0.56, 0.86];

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

// Line-art emblems, drawn stroke by stroke like the rabbit.
const GLYPHS: string[][] = [
  // educational content: a page with a voice wave
  [
    "M24 10h38l16 16v62H24z",
    "M62 10v16h16",
    "M34 40h22",
    "M34 52h36",
    "M32 74h6l3-8 5 16 5-12 3 4h16",
  ],
  // visual storytelling: a viewfinder with play
  [
    "M12 32V16h16",
    "M72 16h16v16",
    "M88 68v16H72",
    "M28 84H12V68",
    "M42 36l24 14-24 14z",
    "M80 26a3 3 0 1 0 0.1 0",
  ],
  // recording studio: a microphone
  [
    "M40 14a10 10 0 0 1 20 0v26a10 10 0 0 1-20 0z",
    "M30 38v2a20 20 0 0 0 40 0v-2",
    "M50 60v20",
    "M36 86h28",
    "M17 28q-6 14 0 28",
    "M83 28q6 14 0 28",
  ],
];

export function MediaPulse({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const s = c.services[1];
  const reduced = useReducedMotion();
  const root = useRef<HTMLElement>(null);
  const line = useRef<SVGPathElement>(null);
  const jump = useRef<(k: number) => void>(() => {});
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const el = root.current;
    const path = line.current;
    if (!el || !path) return;
    const len = path.getTotalLength();
    const at = (x: number) => {
      let lo = 0;
      let hi = len;
      for (let n = 0; n < 28; n++) {
        const m = (lo + hi) / 2;
        if (path.getPointAtLength(m).x < x) lo = m;
        else hi = m;
      }
      return lo / len;
    };
    const peaks = BEATS.map((b) => at(b + PEAK_DX));
    const keys: [number, number][] = [[0, 0], [0.04, 0]];
    HOLDS.forEach(([a, b], k) => {
      keys.push([a, peaks[k]], [b, peaks[k]]);
    });
    keys.push([1, 1]);
    const travel = (v: number) => {
      for (let n = 1; n < keys.length; n++) {
        const [s1, p1] = keys[n];
        if (v <= s1) {
          const [s0, p0] = keys[n - 1];
          return p0 + (p1 - p0) * smooth(clamp((v - s0) / (s1 - s0 || 1)));
        }
      }
      return 1;
    };

    let shownActive = -2;
    const paint = (v: number) => {
      const p = travel(v);
      const pt = path.getPointAtLength(p * len);
      el.style.setProperty("--p", p.toFixed(4));
      el.style.setProperty("--hx", `${((pt.x / W) * 100).toFixed(3)}%`);
      el.style.setProperty("--hy", `${((pt.y / H) * 100).toFixed(3)}%`);
      let a = -1;
      peaks.forEach((pk, k) => {
        if (p >= pk - 0.004) a = k;
      });
      if (a !== shownActive) {
        shownActive = a;
        setActive(a);
      }
    };
    const target = () => {
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      return span > 0 ? clamp(-r.top / span) : 0;
    };

    if (reduced) {
      paint(1);
      jump.current = () => {};
      return;
    }
    let goal = target();
    let shown = goal;
    let raf = 0;
    paint(shown);
    const loop = () => {
      shown += (goal - shown) * 0.14;
      if (Math.abs(goal - shown) < 0.0002) shown = goal;
      paint(shown);
      raf = shown === goal ? 0 : requestAnimationFrame(loop);
    };
    const onScroll = () => {
      goal = target();
      if (!raf) raf = requestAnimationFrame(loop);
    };
    jump.current = (k: number) => {
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      window.scrollTo({
        top: window.scrollY + r.top + span * JUMP[k],
        behavior: "smooth",
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <section
      className="mp"
      id="media"
      ref={root}
      data-static={reduced ? "1" : undefined}
    >
      <div className="mp-stage">
        <div className="mp-grid" aria-hidden="true" />
        <div className="mp-head">
          <span className="eyebrow">{s.category}</span>
          <h2>{s.title}</h2>
          <p>{s.text}</p>
        </div>

        {BX.map((x, k) => (
          <i
            key={`f${k}`}
            className="mp-flash"
            aria-hidden="true"
            data-cur={active === k}
            style={{ "--bx": `${x}%` } as CSSProperties}
          />
        ))}

        <div className="mp-track" aria-hidden="true">
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
            <path
              ref={line}
              d={LINE}
              className="mp-ghost"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d={LINE}
              pathLength={1}
              className="mp-live"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <i className="mp-dot" />
        </div>

        {BX.map((x, k) => (
          <button
            key={`l${k}`}
            type="button"
            className="mp-lens"
            style={{ "--bx": `${x}%` } as CSSProperties}
            data-on={active >= k}
            data-cur={active === k}
            aria-label={s.items[k]}
            onClick={() => jump.current(k)}
          >
            <span className="mp-ring" aria-hidden="true" />
            <span className="mp-ring mp-ring-b" aria-hidden="true" />
            <svg viewBox="0 0 100 100" fill="none" aria-hidden="true">
              {GLYPHS[k].map((d, i) => (
                <path
                  key={i}
                  d={d}
                  pathLength={1}
                  style={{ transitionDelay: `${0.12 + i * 0.13}s` }}
                />
              ))}
            </svg>
          </button>
        ))}

        <div className="mp-texts">
          {BX.map((x, k) => (
            <article
              key={`t${k}`}
              className="mp-text"
              style={{ "--bx": `${x}%` } as CSSProperties}
              data-on={active >= k}
              data-cur={active === k}
            >
              <span className="mp-n">0{k + 1}</span>
              <h3>{s.items[k]}</h3>
              <p>{c.mediaDetails[k]}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
