"use client";
import { useRef, type CSSProperties } from "react";
import { useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { contact, copy, type Locale } from "@/content/site";
import { makeIso, type IsoBox } from "./iso";
import { smooth, useScrub, win } from "./use-scrub";

// ---------- scene: a ruined classroom, a container lands on it, opens, and a classroom lives inside ----------
const L = 120; // container length (x)
const W = 48; // width (y)
const H = 52; // height (z)
const I = makeIso(500, 341, 3.2);

const faces = (b: IsoBox, c: string) => (
  <>
    <path pathLength={1} className={`${c}-l`} d={b.l} />
    <path pathLength={1} className={`${c}-r`} d={b.r} />
    <path pathLength={1} className={`${c}-t`} d={b.t} />
  </>
);

const RUIN_WALLS: [number, number, number, number, number, number][] = [
  [0, 0, 0, 34, 2.4, 34],
  [34, 0, 0, 14, 2.4, 19],
  [60, 0, 0, 26, 2.4, 11],
  [92, 0, 0, 28, 2.4, 27],
  [0, 2.4, 0, 2.4, 24, 30],
  [0, 26.4, 0, 2.4, 14, 13],
];
const RUIN_BITS: [number, number, number, number, number, number][] = [
  [30, 24, 0, 24, 12, 9],
  [74, 12, 0, 20, 10, 7],
  [96, 30, 0, 18, 11, 8],
  [58, 36, 0, 7, 7, 5],
  [18, 38, 0, 6, 6, 4],
  [14, 10, 0, 6, 5, 4],
  [104, 18, 0, 6, 5, 5],
  [84, 38, 0, 5, 4, 3],
  [48, 6, 0, 5, 4, 3],
];
const RUIN_FLOOR = I.box(-4, -4, -2.5, L + 8, W + 8, 2.5);
const CRACKS = [
  I.line([8, 40, 0], [30, 26, 0], [44, 32, 0], [70, 12, 0], [90, 20, 0], [112, 6, 0]),
  I.line([60, 44, 0], [72, 34, 0], [96, 40, 0]),
];

const SHELL_TOP = I.quad([0, 0, H], [L, 0, H], [L, W, H], [0, W, H]);
const SHELL_LONG = I.quad([0, W, 0], [L, W, 0], [L, W, H], [0, W, H]);
const SHELL_END = I.quad([L, 0, 0], [L, W, 0], [L, W, H], [L, 0, H]);
const RIBS_LONG = Array.from({ length: 19 }, (_, n) =>
  I.line([6 + n * 6, W, 2], [6 + n * 6, W, H - 2]),
);
const RIBS_END = Array.from({ length: 7 }, (_, n) =>
  I.line([L, 6 + n * 6, 2], [L, 6 + n * 6, H - 2]),
);
const RIBS_TOP = Array.from({ length: 11 }, (_, n) =>
  I.line([10 + n * 10, 0, H], [10 + n * 10, W, H]),
);
const DOOR = [
  I.quad([L, 5, 3], [L, 43, 3], [L, 43, H - 3], [L, 5, H - 3]),
  I.line([L, 24, 3], [L, 24, H - 3]),
  I.line([L, 19, 22], [L, 19, 32]),
  I.line([L, 29, 22], [L, 29, 32]),
];

const FLOOR = I.box(0, 0, -2, L, W, 2);
const BACK = I.box(0, 0, 0, L, 2.4, H);
const LEFT = I.box(0, 0, 0, 2.4, W, H);
const WINDOWS = [12, 84].flatMap((x) => [
  I.quad([x, 2.4, 20], [x + 24, 2.4, 20], [x + 24, 2.4, 42], [x, 2.4, 42]),
  I.line([x + 12, 2.4, 20], [x + 12, 2.4, 42]),
  I.line([x, 2.4, 31], [x + 24, 2.4, 31]),
]);
const CASE = I.box(46, 2.4, 0, 32, 7, 36);
const SHELVES = [9, 18, 27].map((z) => I.line([46, 9.4, z], [78, 9.4, z]));
const BOOKS = [0, 9, 18, 27].flatMap((z, r) =>
  Array.from({ length: 9 }, (_, n) =>
    I.line([48 + n * 3.3, 9.4, z + 0.6], [48 + n * 3.3, 9.4, z + 4 + ((n * 5 + r * 3) % 4)]),
  ),
);
const SCREEN = [
  I.quad([2.4, 8, 16], [2.4, 40, 16], [2.4, 40, 42], [2.4, 8, 42]),
  I.line([2.4, 12, 24], [2.4, 18, 28], [2.4, 24, 22], [2.4, 30, 34], [2.4, 36, 30]),
  I.line([2.4, 12, 38], [2.4, 28, 38]),
];
const RUG = I.quad([46, 12, 0.1], [104, 12, 0.1], [104, 42, 0.1], [46, 42, 0.1]);

type Round = { top: ReturnType<typeof I.ell>; side: string; leg: string };
function table(x: number, y: number, z: number, r: number): Round {
  const top = I.ell(x, y, z, r);
  const t = 3 * 3.2;
  const f = (n: number) => n.toFixed(1);
  return {
    top,
    side: `M${f(top.cx - top.rx)} ${f(top.cy)}v${f(t)}a${f(top.rx)} ${f(top.ry)} 0 0 0 ${f(2 * top.rx)} 0v${f(-t)}z`,
    leg: I.line([x, y, 0], [x, y, z]),
  };
}
const TABLE_A = table(70, 26, 14, 10);
const TABLE_B = table(98, 14, 11, 6);
const STOOLS = [
  { x: 60, y: 12, kid: true },
  { x: 56, y: 36, kid: true },
  { x: 86, y: 38, kid: true },
].map((s) => ({ ...s, e: I.ell(s.x, s.y, 8, 3.6), leg: I.line([s.x, s.y, 0], [s.x, s.y, 8]) }));

function Kid({ x, y, z, tall = false }: { x: number; y: number; z: number; tall?: boolean }) {
  const [px, py] = I.P(x, y, z);
  const s = tall ? 1.35 : 1;
  const f = (n: number) => n.toFixed(1);
  return (
    <g className="sx-kid">
      <path
        pathLength={1}
        d={`M${f(px - 9 * s)} ${f(py - 2)}q0 ${f(-24 * s)} ${f(9 * s)} ${f(-24 * s)}q${f(9 * s)} 0 ${f(9 * s)} ${f(24 * s)}z`}
      />
      <ellipse pathLength={1} cx={f(px)} cy={f(py - 32 * s)} rx={f(7.5 * s)} ry={f(7.5 * s)} />
    </g>
  );
}

const UI = {
  en: { sub: "Technical reference framework" },
  ar: { sub: "إطار مرجعي تقني" },
};
const STANDARDS: { name: string; x: number; y: number; sx: number; sy: number }[] = [
  { name: "CHS", x: 160, y: 92, sx: 0, sy: -44 },
  { name: "Sphere", x: 112, y: 172, sx: -62, sy: 40 },
  { name: "INEE", x: 208, y: 172, sx: 62, sy: 40 },
];

export function SchoolBox({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const ui = UI[locale];
  const reduced = useReducedMotion();
  const root = useRef<HTMLElement>(null);

  useScrub(root, reduced, (s) => {
    const el = root.current;
    if (!el) return;
    const set = (k: string, v: number) => el.style.setProperty(k, v.toFixed(3));
    const w = (a: number, b: number) => smooth(win(s, a, b));
    set("--ru", w(0.02, 0.14));
    set("--rf", 1 - w(0.36, 0.54) * 0.85);
    set("--fall", w(0.24, 0.4));
    set("--dust", win(s, 0.37, 0.55));
    set("--op", w(0.44, 0.58));
    set("--in0", w(0.5, 0.6));
    set("--i1", w(0.56, 0.66));
    set("--i2", w(0.62, 0.72));
    set("--i3", w(0.68, 0.78));
    set("--i4", w(0.74, 0.84));
    set("--seal", w(0.82, 0.92));
    set("--cp", w(0.88, 0.97));
    set("--dim", 1 - win(s, 0.36, 0.78));
  });

  const e = (n: string): CSSProperties => ({ "--e": `var(--${n})` }) as CSSProperties;

  return (
    <section
      className="sb"
      id="emergency"
      ref={root}
      data-static={reduced ? "1" : undefined}
    >
      <div className="sb-stage">
        <div className="sb-glow" aria-hidden="true" />
        <div className="sb-dim" aria-hidden="true" />
        <div className="sb-head">
          <span className="eyebrow">{c.emergencyLabel}</span>
          <h2>{c.emergencyTitle}</h2>
        </div>

        <svg
          className="sb-scene"
          viewBox="250 140 700 520"
          role="img"
          aria-label={c.emergencyTitle.replace("\n", " ")}
        >
          <ellipse cx="600" cy="478" rx="300" ry="96" className="sb-dust" />
          <ellipse cx="600" cy="478" rx="250" ry="78" className="sb-pad" />

          <g className="sb-ruin sb-d" style={e("ru")}>
            <g style={{ opacity: "var(--rf, 1)" }}>
              {faces(RUIN_FLOOR, "sr")}
              {CRACKS.map((d, i) => (
                <path key={i} pathLength={1} d={d} className="sr-crack" />
              ))}
              {RUIN_WALLS.map((b, i) => (
                <g key={`w${i}`}>{faces(I.box(...b), "sr")}</g>
              ))}
              {RUIN_BITS.map((b, i) => (
                <g key={`b${i}`}>{faces(I.box(...b), "sr")}</g>
              ))}
            </g>
          </g>

          <g className="sb-in">
            <g className="sb-d" style={e("in0")}>
              {faces(FLOOR, "sx")}
              {faces(BACK, "sx")}
              {faces(LEFT, "sx")}
            </g>
            <g className="sb-d" style={e("i1")}>
              <path pathLength={1} d={RUG} className="sx-rug" />
              {WINDOWS.map((d, i) => (
                <path key={i} pathLength={1} d={d} className={i % 3 === 0 ? "sx-win" : ""} />
              ))}
              {faces(CASE, "sx")}
              {SHELVES.map((d, i) => (
                <path key={i} pathLength={1} d={d} />
              ))}
              {BOOKS.map((d, i) => (
                <path key={`k${i}`} pathLength={1} d={d} className="sx-book" />
              ))}
            </g>
            <g className="sb-d sb-screen" style={e("i3")}>
              {SCREEN.map((d, i) => (
                <path key={i} pathLength={1} d={d} className={i === 0 ? "sx-scr" : "sx-scr-ln"} />
              ))}
            </g>
            <g className="sb-d sb-rise" style={e("i2")}>
              <path pathLength={1} d={TABLE_B.leg} />
              <path pathLength={1} d={TABLE_B.side} className="sx-dk-l" />
              <ellipse pathLength={1} {...TABLE_B.top} className="sx-dk-t" />
              <g className="sb-d" style={e("i4")}>
                <Kid x={60} y={12} z={8} />
              </g>
              {STOOLS.map((s, i) => (
                <g key={i}>
                  <path pathLength={1} d={s.leg} />
                  <ellipse pathLength={1} {...s.e} className="sx-dk-t" />
                </g>
              ))}
              <path pathLength={1} d={TABLE_A.leg} />
              <path pathLength={1} d={TABLE_A.side} className="sx-dk-l" />
              <ellipse pathLength={1} {...TABLE_A.top} className="sx-dk-t" />
              <g className="sb-d" style={e("i4")}>
                <Kid x={56} y={36} z={8} />
                <Kid x={86} y={38} z={8} />
                <Kid x={14} y={26} z={0} tall />
              </g>
            </g>
          </g>

          <g className="sb-drop">
            <g className="sb-shell">
              <g className="sb-roof">
                <path d={SHELL_TOP} className="ss-t" />
                {RIBS_TOP.map((d, i) => (
                  <path key={i} d={d} className="ss-rib" />
                ))}
              </g>
              <g className="sb-wall-l">
                <path d={SHELL_LONG} className="ss-l" />
                {RIBS_LONG.map((d, i) => (
                  <path key={i} d={d} className="ss-rib" />
                ))}
              </g>
              <g className="sb-wall-r">
                <path d={SHELL_END} className="ss-r" />
                {RIBS_END.map((d, i) => (
                  <path key={i} d={d} className="ss-rib" />
                ))}
                {DOOR.map((d, i) => (
                  <path key={`d${i}`} d={d} className="ss-door" />
                ))}
              </g>
            </g>
          </g>
        </svg>

        <div className="sb-lower">
          <div className="sb-side">
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

          <div className="sb-seal">
            <svg viewBox="0 0 320 262" aria-hidden="true">
              {STANDARDS.map((st) => (
                <g
                  key={st.name}
                  style={{ "--sx": `${st.sx}px`, "--sy": `${st.sy}px` } as CSSProperties}
                  className="sb-ring"
                >
                  <circle pathLength={1} cx={st.x} cy={st.y} r="74" />
                  <text x={st.x + (st.x - 160) * 0.62} y={st.y + (st.y - 144) * 0.5} textAnchor="middle">
                    {st.name}
                  </text>
                </g>
              ))}
            </svg>
            <strong>BIG-MSEED</strong>
            <span>{ui.sub}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
