"use client";
import { useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { copy, coreValues, type Locale } from "@/content/site";
import { clamp, useScrub, win } from "./use-scrub";

// ---------- a pledge sheet: a rubber stamp presses each of the eight values onto it, then the BIG seal ----------
const N = 8;
const VW = 520;
const VH = 810;
const START = (k: number) => 0.03 + k * 0.095;
const LEN = 0.092;
const SIGN: [number, number] = [0.79, 0.86];
const FINAL: [number, number] = [0.86, 0.97];
const SEAL_BIG = { x: 260, y: 742, r: 52 };

// centre of the seal: two columns of four cells, seal beside its title
const slotXY = (k: number, rtl: boolean): [number, number] => {
  const x0 = (k % 2) * 240 + 40;
  return [rtl ? VW - (x0 + 36) : x0 + 36, 276 + Math.floor(k / 2) * 104];
};

// wrap a title into at most two lines
function wrap(text: string, max = 14): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > max && cur) {
      lines.push(cur);
      cur = w;
    } else cur = (cur + " " + w).trim();
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3);
}

const ease = (t: number) => t * t * (3 - 2 * t);
const out = (t: number) => 1 - (1 - t) * (1 - t) * (1 - t);

const MARK_A =
  "M137.51,223.64l15.41,21.31c7.46-.13,13.5-4.64,15.88-17.79,3.57-19.77,42.7-29.62-35.96-133.09-3.47-4.57-8.18-10.87-12.3-14.76-14.04-13.28-8.36,11.54-6.31,18.49,5.85,19.92,14.98,37.8,24.97,55.88C86.52,88.71,36.73,58.56,38.02,75.47c1.92,25.32,24.44,51.18,42.71,69.12l73.91,63.95-17.13,15.1Z";
const MARK_B =
  "M122.6,222.66l14.74-13.03-47.46-53.69c-1.85,10.3-7.18,54.87,33.64,77.74,5.38,3.01,11.36,6.37,17.2,8.64l-18.12-19.66Z";

export function ValuesPledge({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const values = coreValues[locale];
  const reduced = useReducedMotion();
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(-1);
  const shown = useRef(-2);
  const rtl = locale === "ar";

  useScrub(root, reduced, (s) => {
    const el = root.current;
    if (!el) return;
    const set = (k: string, v: number) => el.style.setProperty(k, v.toFixed(3));
    let a = -1;
    let stamp = -1;
    let u = 0;
    let jolt = 0;
    for (let k = 0; k < N; k++) {
      const w = win(s, START(k), START(k) + LEN);
      set(`--s${k}`, ease(win(w, 0.42, 0.56)));
      if (w > 0.3) a = k;
      if (w > 0 && w < 1) {
        stamp = k;
        u = w;
      }
      if (w > 0.42 && w < 0.58) jolt = Math.max(jolt, Math.sin(((w - 0.42) / 0.16) * Math.PI));
    }
    // the big BIG seal is the ninth stamp
    const wf = win(s, FINAL[0], FINAL[1]);
    set("--s8", ease(win(wf, 0.42, 0.56)));
    if (wf > 0 && wf < 1) {
      stamp = 8;
      u = wf;
    }
    if (wf > 0.42 && wf < 0.6) jolt = Math.max(jolt, 1.6 * Math.sin(((wf - 0.42) / 0.18) * Math.PI));
    set("--sig", win(s, SIGN[0], SIGN[1]));
    set("--jolt", jolt);

    if (stamp >= 0) {
      const [x, y] = stamp === 8 ? [SEAL_BIG.x, SEAL_BIG.y] : slotXY(stamp, rtl);
      let lift: number;
      if (u < 0.42) lift = 420 * (1 - ease(u / 0.42));
      else if (u < 0.52) lift = 0;
      else lift = 420 * out((u - 0.52) / 0.48);
      const rot =
        u < 0.42 ? -9 * (1 - ease(u / 0.42)) : 6 * out(clamp((u - 0.52) / 0.48));
      const squash = u > 0.42 && u < 0.52 ? 0.07 * Math.sin(((u - 0.42) / 0.1) * Math.PI) : 0;
      const o = u < 0.06 ? u / 0.06 : u > 0.88 ? (1 - u) / 0.12 : 1;
      set("--tx", x);
      set("--ty", y);
      set("--tl", lift);
      set("--tr", rot);
      set("--tq", 1 - squash + (stamp === 8 ? 0.5 : 0));
      set("--to", o);
    } else {
      set("--to", 0);
    }
    if (wf > 0.3) a = N - 1;
    if (a !== shown.current) {
      shown.current = a;
      setActive(a);
    }
  });

  const jump = (k: number) => {
    const el = root.current;
    if (!el || reduced) {
      setActive(k);
      return;
    }
    const r = el.getBoundingClientRect();
    const span = r.height - window.innerHeight;
    window.scrollTo({
      top: window.scrollY + r.top + span * (START(k) + LEN * 0.65),
      behavior: "smooth",
    });
  };
  const cur = Math.max(0, active);
  const PrevIcon = rtl ? ArrowRight : ArrowLeft;
  const NextIcon = rtl ? ArrowLeft : ArrowRight;
  const label = c.valuesTitle.replace("\n", " ");
  const ax = rtl ? VW - 40 : 40; // header anchor
  const anchor = rtl ? "end" : "start";
  const sigX = (x: number) => (rtl ? VW - x : x);

  return (
    <section
      className="pl"
      id="values"
      ref={root}
      data-static={reduced ? "1" : undefined}
    >
      <div className="pl-stage">
        <div className="pl-glow" aria-hidden="true" />
        <div className="pl-head">
          <span className="eyebrow">{c.valuesLabel}</span>
          <h2>{c.valuesTitle}</h2>
        </div>

        <svg className="pl-sheet" viewBox={`0 0 ${VW} ${VH}`} role="img" aria-label={label}>
          <g className="pl-paper">
            <rect width={VW} height={VH} rx="8" className="pl-page" />
            <rect x="14" y="14" width={VW - 28} height={VH - 28} rx="4" className="pl-border" />

            <g transform={`translate(${rtl ? VW - 78 : 40} 40)`}>
              <g transform="scale(0.2) translate(-20 -40)" className="pl-logo">
                <path d={MARK_A} />
                <path d={MARK_B} />
              </g>
            </g>
            <text x={rtl ? VW - 86 : 86} y="66" textAnchor={anchor} className="pl-brand">
              BIG EDUCATION
            </text>
            <text x={ax} y="128" textAnchor={anchor} className="pl-doc">
              {c.valuesLabel}
            </text>
            <path d={`M40 154H${VW - 40}`} className="pl-rule" />
            {[440, 392, 300].map((w, i) => (
              <rect
                key={i}
                x={rtl ? VW - 40 - w : 40}
                y={178 + i * 20}
                width={w}
                height="7"
                rx="3.5"
                className="pl-bar"
              />
            ))}

            {Array.from({ length: N }, (_, k) => {
              const [x, y] = slotXY(k, rtl);
              const lines = wrap(values[k][0]);
              return (
                <g key={k} className="pl-slot" data-cur={cur === k && active >= 0} onClick={() => jump(k)}>
                  <circle cx={x} cy={y} r="33" className="pl-ghost" />
                  <text x={x} y={y + 8} textAnchor="middle" className="pl-ghost-n">
                    {String(k + 1).padStart(2, "0")}
                  </text>
                  <g
                    className="pl-seal"
                    style={{ "--ps": `var(--s${k})` } as CSSProperties}
                  >
                    <circle cx={x} cy={y} r="35" className="pl-ring" />
                    <circle cx={x} cy={y} r="29" className="pl-ring2" />
                    <text x={x} y={y + 9} textAnchor="middle" className="pl-n">
                      {String(k + 1).padStart(2, "0")}
                    </text>
                  </g>
                  <text
                    textAnchor={anchor}
                    className="pl-title"
                    style={{ "--ps": `var(--s${k})` } as CSSProperties}
                  >
                    {lines.map((ln, i) => (
                      <tspan
                        key={i}
                        x={rtl ? x - 48 : x + 48}
                        y={y - ((lines.length - 1) * 17) / 2 + 5 + i * 17}
                      >
                        {ln}
                      </tspan>
                    ))}
                  </text>
                </g>
              );
            })}

            <path
              pathLength={1}
              className="pl-sign"
              d={`M${sigX(56)} 764C${sigX(70)} 730 ${sigX(86)} 732 ${sigX(92)} 756C${sigX(98)} 774 ${sigX(112)} 730 ${sigX(126)} 744C${sigX(138)} 756 ${sigX(150)} 748 ${sigX(172)} 736`}
            />
            <path d={`M${sigX(48)} 780H${sigX(190)}`} className="pl-rule" />

            <g className="pl-seal pl-big" style={{ "--ps": "var(--s8)" } as CSSProperties}>
              <circle cx={SEAL_BIG.x} cy={SEAL_BIG.y} r={SEAL_BIG.r} className="pl-ring" />
              <circle cx={SEAL_BIG.x} cy={SEAL_BIG.y} r={SEAL_BIG.r - 7} className="pl-ring2" />
              <g
                className="pl-logo pl-logo-big"
                transform={`translate(${SEAL_BIG.x} ${SEAL_BIG.y}) scale(0.26) translate(-104 -150)`}
              >
                <path d={MARK_A} />
                <path d={MARK_B} />
              </g>
            </g>
          </g>

          <g className="pl-stamp">
            <rect x="-46" y="-14" width="92" height="14" rx="4" className="pl-st-rubber" />
            <rect x="-50" y="-28" width="100" height="14" rx="5" className="pl-st-plate" />
            <path d="M-17 -28L-10 -74H10L17 -28Z" className="pl-st-neck" />
            <rect x="-27" y="-116" width="54" height="44" rx="17" className="pl-st-knob" />
            <path d="M-15 -104Q0 -110 15 -104" className="pl-st-shine" />
          </g>
        </svg>

        <div className="pl-panel" aria-live="polite">
          <div className="pl-in" key={cur} data-on={active >= 0}>
            <span className="pl-count">
              <bdi dir="ltr">
                {String(cur + 1).padStart(2, "0")} / {String(N).padStart(2, "0")}
              </bdi>
            </span>
            <h3>{values[cur][0]}</h3>
            <p>{values[cur][1]}</p>
          </div>
          <div className="pl-nav">
            <button
              type="button"
              onClick={() => jump(Math.max(0, cur - 1))}
              disabled={cur === 0}
              aria-label={c.learn}
            >
              <PrevIcon size={18} />
            </button>
            <button
              type="button"
              onClick={() => jump(Math.min(N - 1, cur + 1))}
              disabled={cur === N - 1}
              aria-label={c.learn}
            >
              <NextIcon size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
