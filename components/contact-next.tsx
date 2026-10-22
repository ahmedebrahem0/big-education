"use client";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import { useReducedMotion } from "motion/react";
import { ArrowDown, ArrowUpRight, Check, Send } from "lucide-react";
import { contact, copy, type Locale } from "@/content/site";
import { makeIso } from "./iso";
import { clamp, smooth, useScrub, win } from "./use-scrub";

const MARK_A =
  "M137.51,223.64l15.41,21.31c7.46-.13,13.5-4.64,15.88-17.79,3.57-19.77,42.7-29.62-35.96-133.09-3.47-4.57-8.18-10.87-12.3-14.76-14.04-13.28-8.36,11.54-6.31,18.49,5.85,19.92,14.98,37.8,24.97,55.88C86.52,88.71,36.73,58.56,38.02,75.47c1.92,25.32,24.44,51.18,42.71,69.12l73.91,63.95-17.13,15.1Z";
const MARK_B =
  "M122.6,222.66l14.74-13.03-47.46-53.69c-1.85,10.3-7.18,54.87,33.64,77.74,5.38,3.01,11.36,6.37,17.2,8.64l-18.12-19.66Z";

// a crumpled sheet of paper: irregular outline + faceted shading, built once
const BALL = (() => {
  const rnd = (i: number) => {
    const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  const N = 12;
  const outer = Array.from({ length: N }, (_, i) => {
    const a = (i / N) * Math.PI * 2 + rnd(i) * 0.25;
    const r = 56 + rnd(i + 9) * 22;
    return [Math.cos(a) * r, Math.sin(a) * r * 0.92] as [number, number];
  });
  const inner = Array.from({ length: N }, (_, i) => {
    const a = (i / N) * Math.PI * 2 + 0.2 + rnd(i + 30) * 0.4;
    const r = 24 + rnd(i + 50) * 18;
    return [Math.cos(a) * r, Math.sin(a) * r] as [number, number];
  });
  const shade = (k: number) => {
    const l = 86 + Math.round(rnd(k + 77) * 14 - 6 + Math.cos(k * 1.7) * 4);
    return "hsl(150 12% " + Math.min(100, l) + "%)";
  };
  const tris: { d: string; fill: string }[] = [];
  const P = (p: [number, number]) => p[0].toFixed(1) + " " + p[1].toFixed(1);
  let k = 0;
  for (let i = 0; i < N; i++) {
    const j = (i + 1) % N;
    tris.push({ d: "M" + P(outer[i]) + "L" + P(outer[j]) + "L" + P(inner[i]) + "Z", fill: shade(k++) });
    tris.push({ d: "M" + P(outer[j]) + "L" + P(inner[j]) + "L" + P(inner[i]) + "Z", fill: shade(k++) });
    tris.push({ d: "M0 0L" + P(inner[i]) + "L" + P(inner[j]) + "Z", fill: shade(k++) });
  }
  return { tris, outline: "M" + outer.map(P).join("L") + "Z" };
})();

const UI = {
  en: {
    steps: ["Spaces", "Media", "Factory", "Emergency", "Values", "Your project"],
    bubble: "Your project is the next step",
    title: "Tell us what’s on your mind.",
    plan: "What are you planning?",
    opts: ["Learning spaces", "Educational media", "Emergency education", "Something else"],
    send: "Send message",
    sending: "On its way…",
    sentTitle: "Your message took off",
    again: "Write another",
    contactUs: "Contact us",
    to: "To",
    subject: "Project enquiry",
    from: "From",
    placeholder: "Your message will appear here as you write it.",
  },
  ar: {
    steps: ["المساحات", "الإعلام", "المصنع", "الطوارئ", "القيم", "مشروعك"],
    bubble: "مشروعك هو الخطوة القادمة",
    title: "حدّثنا عمّا يدور في ذهنك.",
    plan: "ما الذي تخطط له؟",
    opts: ["مساحات تعليمية", "إنتاج إعلامي تعليمي", "التعليم في الطوارئ", "شيء آخر"],
    send: "أرسل الرسالة",
    sending: "في الطريق…",
    sentTitle: "رسالتك انطلقت",
    again: "اكتب رسالة أخرى",
    contactUs: "تواصل معنا",
    to: "إلى",
    subject: "استفسار عن مشروع",
    from: "من",
    placeholder: "ستظهر رسالتك هنا وأنت تكتبها.",
  },
};

// ---------- part 1: the brand mark climbs one step per section and lands on "your project" ----------
const STEPS = 6;
const SW = 150;
const SD = 60;
const GAP = 40;
const I = makeIso(0, 470, 1, [1, 0], [-0.5, 0.55]);
const hOf = (i: number) => 30 + i * 26;
const HOP0 = 0.08;
const HOP_STEP = 0.16;
const HOP_LEN = 0.12;

const ICONS = [
  "M0 -16A16 16 0 1 0 0.1 -16M0 -22v5M0 17v5M-22 0h5M17 0h5M0 -2a2 2 0 1 0 0.1 0",
  "M-20 0h9l5-12 10 24 5-12h12",
  "M-9 -16V12M-9 0H9M9 0V12M-9 12H9M6 -16V0",
  "M-18 -9h36v20h-36zM-18 -2h36M-6 -9v20M6 -9v20",
  "M0 -16A16 16 0 1 0 0.1 -16M-7 0l5 6 9-11",
  "M0 -14v28M-14 0h28",
];

function Journey({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const ui = UI[locale];
  const rtl = locale === "ar";
  const reduced = useReducedMotion();
  const root = useRef<HTMLElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const mark = useRef<SVGGElement>(null);

  const steps = useMemo(() => {
    return Array.from({ length: STEPS }, (_, i) => {
      const x = rtl ? 1200 - (40 + i * (SW + GAP) + SW) : 40 + i * (SW + GAP);
      const h = hOf(i);
      const feet = I.P(x + SW / 2, 30, h);
      const label = I.P(x + SW / 2, SD, h / 2);
      return { box: I.box(x, 0, 0, SW, SD, h), feet, label, h };
    });
  }, [rtl]);

  useScrub(root, reduced, (s) => {
    const el = root.current;
    const m = mark.current;
    const sv = svg.current;
    if (!el || !m || !sv) return;
    const set = (k: string, v: number) => el.style.setProperty(k, v.toFixed(3));
    // which hop are we in, and how far
    let done = 0;
    let hop = -1;
    let t = 0;
    for (let j = 0; j < STEPS - 1; j++) {
      const a = HOP0 + j * HOP_STEP;
      if (s >= a + HOP_LEN) done = j + 1;
      else if (s >= a) {
        hop = j;
        t = (s - a) / HOP_LEN;
        break;
      } else break;
    }
    const dir = rtl ? -1 : 1;
    let x: number;
    let y: number;
    let sx = 1;
    let sy = 1;
    let tilt = 0;
    if (hop >= 0) {
      const A = steps[hop].feet;
      const B = steps[hop + 1].feet;
      const e = smooth(t);
      x = A[0] + (B[0] - A[0]) * e;
      y = A[1] + (B[1] - A[1]) * e - 86 * Math.sin(Math.PI * t);
      sy = 1 + 0.16 * Math.sin(Math.PI * t);
      sx = 1 - 0.07 * Math.sin(Math.PI * t);
      tilt = dir * 16 * (1 - 2 * t);
    } else {
      const F = steps[done].feet;
      x = F[0];
      y = F[1];
      const landed = done > 0 ? HOP0 + (done - 1) * HOP_STEP + HOP_LEN : 0;
      const u = clamp((s - landed) / 0.045);
      const q = (1 - u) * (1 - u);
      if (done > 0) {
        sy = 1 - 0.22 * q;
        sx = 1 + 0.16 * q;
      }
    }
    m.setAttribute(
      "transform",
      `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${tilt.toFixed(1)}) scale(${sx.toFixed(3)} ${sy.toFixed(3)})`,
    );
    for (let i = 0; i < STEPS; i++) {
      const landed = i === 0 ? 0 : HOP0 + (i - 1) * HOP_STEP + HOP_LEN;
      set(`--l${i}`, smooth(win(s, landed, landed + 0.05)));
    }
    set("--burst", win(s, 0.84, 0.95));
    set("--cta", smooth(win(s, 0.9, 0.98)));
    // on phones the camera follows the mark
    const narrow = window.innerWidth < 900;
    const vbw = narrow ? 560 : 1200;
    const cam = narrow ? clamp(x - vbw * 0.42, 0, 1200 - vbw) : 0;
    sv.setAttribute("viewBox", `${cam.toFixed(1)} 150 ${vbw} 400`);
  });

  useEffect(() => {
    const onResize = () => {
      const sv = svg.current;
      if (sv && window.innerWidth >= 900) sv.setAttribute("viewBox", "0 150 1200 400");
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const l = (i: number): CSSProperties => ({ "--l": `var(--l${i})` }) as CSSProperties;
  const last = steps[STEPS - 1].feet;

  return (
    <section
      className="cn-journey"
      id="next"
      ref={root}
      data-static={reduced ? "1" : undefined}
    >
      <div className="cn-stage">
        <div className="cn-grid" aria-hidden="true" />
        <div className="cn-head">
          <span className="eyebrow">{c.contactLabel}</span>
          <h2>{c.contactTitle}</h2>
        </div>

        <svg
          ref={svg}
          className="cn-steps"
          viewBox="0 150 1200 400"
          role="img"
          aria-label={c.contactTitle.replace("\n", " ")}
        >
          <ellipse cx="600" cy="520" rx="560" ry="22" className="cn-ground" />
          {steps.map((st, i) => (
            <g key={i} className="cn-step" style={l(i)} data-final={i === STEPS - 1}>
              <path d={st.box.r} className="cn-r" />
              <path d={st.box.l} className="cn-l" />
              <path d={st.box.t} className="cn-t" />
              <text x={st.label[0]} y={st.label[1] + 7} textAnchor="middle" className="cn-lab">
                {ui.steps[i]}
              </text>
              <g transform={`translate(${st.feet[0]} ${st.feet[1] - 112})`} className="cn-badge">
                <circle r="26" />
                <path d={ICONS[i]} />
              </g>
            </g>
          ))}

          <g
            className="cn-burst"
            transform={`translate(${last[0].toFixed(1)} ${(last[1] - 20).toFixed(1)})`}
          >
            <circle r="30" />
            <circle r="30" className="cn-burst-b" />
            <circle r="30" className="cn-burst-c" />
          </g>

          <g ref={mark} className="cn-mark">
            <g transform="scale(0.3) translate(-104 -245)">
              <path d={MARK_A} />
              <path d={MARK_B} />
            </g>
          </g>
        </svg>

        <a href="#contact" className="cn-cta">
          <span>{ui.bubble}</span>
          <ArrowDown size={20} />
        </a>
      </div>
    </section>
  );
}

// ---------- part 2: a brief that folds into a paper plane and flies away ----------
const PLANE = [
  { d: "M40 0L-34 -24L-10 -1Z", fill: "#ffffff" },
  { d: "M40 0L-10 -1L-28 10Z", fill: "#b6d4ca" },
  { d: "M-10 -1L-28 10L-16 24L-4 4Z", fill: "#267372" },
];

function Brief({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const ui = UI[locale];
  const rtl = locale === "ar";
  const reduced = useReducedMotion();
  const sec = useRef<HTMLElement>(null);
  const letter = useRef<HTMLElement>(null);
  const plane = useRef<SVGGElement>(null);
  const trail = useRef<SVGPathElement>(null);
  const [picked, setPicked] = useState<number[]>([]);
  const [name, setName] = useState("");
  const [org, setOrg] = useState("");
  const [msg, setMsg] = useState("");
  const [phase, setPhase] = useState<"idle" | "flying" | "sent">("idle");

  const empty = !name && !org && !msg && picked.length === 0;
  const state = phase === "flying" ? "fold" : phase === "sent" || empty ? "ball" : "letter";
  const chosen = picked.map((i) => ui.opts[i]).join(", ");
  const subject = "BIG Education — Project enquiry";
  const to = contact.formTo;
  const body = `${chosen ? chosen + "\r\n\r\n" : ""}${msg}\r\n\r\n${name}\r\n${org}`.trim();
  const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  function toggle(i: number) {
    setPicked((p) => (p.includes(i) ? p.filter((v) => v !== i) : [...p, i]));
  }

  function fly(done: () => void) {
    const s = sec.current;
    const l = letter.current;
    const g = plane.current;
    const tr = trail.current;
    if (!s || !l || !g || !tr) {
      done();
      return;
    }
    const S = s.getBoundingClientRect();
    const L = l.getBoundingClientRect();
    const dir = rtl ? -1 : 1;
    const sx = L.left - S.left + L.width / 2;
    const sy = L.top - S.top + L.height / 2;
    const ex = rtl ? -140 : S.width + 140;
    const ey = -170;
    const p0 = [sx, sy];
    const p1 = [sx + dir * 170, sy + 150];
    const p2 = [(sx + ex) / 2, ey + 120];
    const p3 = [ex, ey];
    const pt = (t: number) => {
      const u = 1 - t;
      return [
        u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
        u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
      ];
    };
    const dur = 3400;
    const R = 96;
    const L0 = 0.34;
    const L1 = 0.58;
    const at = (e: number) => {
      const [bx, by] = pt(e);
      const q = clamp((e - L0) / (L1 - L0));
      const th = q * Math.PI * 2 * (q > 0 && q < 1 ? 1 : 0) + (q >= 1 ? 0 : 0);
      const on = e > L0 && e < L1 ? 1 : 0;
      return [bx + on * dir * R * Math.sin(th), by - on * R * (1 - Math.cos(th))];
    };
    const t0 = performance.now();
    const pts: string[] = [];
    g.style.opacity = "1";
    const step = (now: number) => {
      const t = clamp((now - t0) / dur);
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const [x, y] = at(e);
      const [x2, y2] = at(Math.min(1, e + 0.006));
      const ang = (Math.atan2(y2 - y, x2 - x) * 180) / Math.PI;
      const sc =
        (0.25 + 0.75 * smooth(clamp(t / 0.14))) * (1 - 0.55 * smooth(win(t, 0.55, 1)));
      const flip = rtl ? -1 : 1;
      g.setAttribute(
        "transform",
        `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang.toFixed(1)}) scale(${sc.toFixed(3)} ${(sc * flip).toFixed(3)})`,
      );
      pts.push(`${x.toFixed(1)} ${y.toFixed(1)}`);
      tr.setAttribute("d", "M" + pts.join("L"));
      tr.style.opacity = String(0.7 * (1 - smooth(win(t, 0.8, 1))));
      g.style.opacity = String(1 - smooth(win(t, 0.9, 1)));
      if (t < 1) requestAnimationFrame(step);
      else {
        tr.setAttribute("d", "");
        done();
      }
    };
    requestAnimationFrame(step);
  }

  // open the mail app right inside the click: phones drop mailto links that fire after a delay
  function openMail() {
    const a = document.createElement("a");
    a.href = mailto;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (phase !== "idle") return;
    openMail();
    if (reduced) {
      setPhase("sent");
      return;
    }
    setPhase("flying");
    fly(() => setPhase("sent"));
  }

  function reset() {
    setName("");
    setOrg("");
    setMsg("");
    setPicked([]);
    setPhase("idle");
  }

  useEffect(() => {
    if (phase === "idle" && plane.current) plane.current.style.opacity = "0";
  }, [phase]);

  return (
    <section className="cn-brief" id="contact" ref={sec} data-phase={phase}>
      <div className="cn-brief-grid">
        <div className="cn-form-col">
          <span className="eyebrow">{ui.contactUs}</span>
          <h3>{ui.title}</h3>
          <p className="cn-lead">{c.contactText}</p>

          {phase === "sent" ? (
            <div className="cn-sent" role="status">
              <span className="cn-sent-ic">
                <Check size={26} />
              </span>
              <strong>{ui.sentTitle}</strong>
              <p>{c.formReady}</p>
              <div className="cn-sent-row">
                <a className="button" href={mailto}>
                  {c.send}
                  <ArrowUpRight size={19} />
                </a>
                <button type="button" className="cn-again" onClick={reset}>
                  {ui.again}
                </button>
              </div>
            </div>
          ) : (
            <form className="cn-form" onSubmit={submit}>
              <fieldset className="cn-chips">
                <legend>{ui.plan}</legend>
                {ui.opts.map((o, i) => (
                  <button
                    key={o}
                    type="button"
                    data-on={picked.includes(i)}
                    aria-pressed={picked.includes(i)}
                    onClick={() => toggle(i)}
                  >
                    {o}
                  </button>
                ))}
              </fieldset>
              <div className="cn-row">
                <label>
                  {c.name}
                  <input
                    required
                    name="name"
                    autoComplete="name"
                    maxLength={100}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
                <label>
                  {c.organization}
                  <input
                    name="organization"
                    autoComplete="organization"
                    maxLength={150}
                    value={org}
                    onChange={(e) => setOrg(e.target.value)}
                  />
                </label>
              </div>
              <label>
                {c.message}
                <textarea
                  required
                  name="message"
                  rows={4}
                  maxLength={3000}
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                />
              </label>
              <button className="button cn-send" type="submit" disabled={phase === "flying"}>
                {phase === "flying" ? ui.sending : ui.send}
                <Send size={19} />
              </button>
              <p className="form-note">{c.formNote}</p>
            </form>
          )}
        </div>

        <div className="cn-sky" aria-hidden="true">
          <svg
            className="cn-ball"
            viewBox="-90 -90 180 180"
            data-show={state === "ball"}
          >
            <g className="cn-ball-in">
              {BALL.tris.map((p, i) => (
                <path key={i} d={p.d} fill={p.fill} />
              ))}
              <path d={BALL.outline} className="cn-ball-edge" />
            </g>
          </svg>
          <article className="cn-letter" ref={letter} data-state={state}>
            <header>
              <svg viewBox="20 55 200 200" className="cn-letter-mark">
                <path d={MARK_A} />
                <path d={MARK_B} />
              </svg>
              <b>BIG EDUCATION</b>
            </header>
            <dl>
              <div>
                <dt>{ui.to}</dt>
                <dd dir="ltr">{to}</dd>
              </div>
              <div>
                <dt>{ui.subject}</dt>
                <dd>{chosen || "—"}</dd>
              </div>
            </dl>
            <p className="cn-letter-body" data-empty={!msg}>
              {msg || ui.placeholder}
            </p>
            <footer>
              <span>{ui.from}</span>
              <strong>{name || "—"}</strong>
              <em>{org}</em>
            </footer>
          </article>
        </div>
      </div>

      <div className="cn-details">
        <div>
          <span className="eyebrow">{c.email}</span>
          <a href={`mailto:${contact.email}`}>
            {contact.email}
            <ArrowUpRight size={18} />
          </a>
        </div>
        <div>
          <span className="eyebrow">{c.call}</span>
          {contact.phones.map((p) => (
            <a key={p} href={`tel:${p}`} dir="ltr">
              {p.replace(/(\d{3})(\d{2})(\d{4})(\d{2})/, "$1 $2 $3 $4")}
              <ArrowUpRight size={18} />
            </a>
          ))}
        </div>
        <div>
          <span className="eyebrow">BIG GROUP</span>
          <a href={contact.group} target="_blank" rel="noreferrer">
            big-egypt.com
            <ArrowUpRight size={18} />
          </a>
        </div>
      </div>

      <svg className="cn-fly" aria-hidden="true">
        <path ref={trail} className="cn-trail" d="" />
        <g ref={plane} className="cn-plane" style={{ opacity: 0 }}>
          {PLANE.map((p, i) => (
            <path key={i} d={p.d} fill={p.fill} />
          ))}
        </g>
      </svg>
    </section>
  );
}

export function ContactNext({ locale }: { locale: Locale }) {
  return (
    <div className="cn">
      <Journey locale={locale} />
      <Brief locale={locale} />
    </div>
  );
}
