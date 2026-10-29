"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { copy, type Locale } from "@/content/site";

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
// Lean of the rabbit along the line: tilted at the start, perfectly upright at mid-screen (t = 0.5), tilted again at the end.
const MAX_LEAN = 38;
const lean = (t: number) => MAX_LEAN * Math.sin((t - 0.5) * Math.PI);
const KEYWORDS = {
  en: /^(ecosystem|design|manufacturing|implementation|thrives|learning)/i,
  ar: /^(منظومة|التصميم|والتصنيع|والتنفيذ|التعلم|يزدهر)/,
};
const LINE = "M -60 790 C 260 920, 480 400, 800 520 S 1280 780, 1670 200";
const RABBIT_TAIL =
  "M122.6,222.66l14.74-13.03-47.46-53.69c-1.85,10.3-7.18,54.87,33.64,77.74,5.38,3.01,11.36,6.37,17.2,8.64l-18.12-19.66Z";
const RABBIT =
  "M137.51,223.64l15.41,21.31c7.46-.13,13.5-4.64,15.88-17.79,3.57-19.77,42.7-29.62-35.96-133.09-3.47-4.57-8.18-10.87-12.3-14.76-14.04-13.28-8.36,11.54-6.31,18.49,5.85,19.92,14.98,37.8,24.97,55.88C86.52,88.71,36.73,58.56,38.02,75.47c1.92,25.32,24.44,51.18,42.71,69.12l73.91,63.95-17.13,15.1Z";

// Pinned storytelling scene: a light line draws itself, 2018 counts up and fills,
// and the paragraph lights up word by word - all driven by one scroll progress value.
export function Story({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const reduced = useReducedMotion();
  const root = useRef<HTMLElement>(null);
  const year = useRef<HTMLSpanElement>(null);
  const path = useRef<SVGPathElement>(null);
  const head = useRef<SVGGElement>(null);
  const words = c.aboutText.split(" ");
  const key = KEYWORDS[locale];

  useEffect(() => {
    const el = root.current;
    const p = path.current;
    const h = head.current;
    const y = year.current;
    if (!el || !p || !h || !y) return;
    const fmt = new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en", {
      useGrouping: false,
    });
    const len = p.getTotalLength();
    let raf = 0;
    const apply = (t: number) => {
      el.style.setProperty("--p", t.toFixed(4));
      // 2018 -> 2026 across the whole scene; the colour fill follows the same progress
      const count = clamp((t - 0.04) / 0.84);
      el.style.setProperty("--yf", count.toFixed(4));
      y.textContent = fmt.format(2018 + Math.round(8 * count));
      p.style.strokeDashoffset = String(1 - t);
      const pt = p.getPointAtLength(len * t);
      h.setAttribute(
        "transform",
        `translate(${pt.x} ${pt.y}) rotate(${lean(t).toFixed(1)})`,
      );
      h.style.opacity = t > 0.005 && t < 0.995 ? "1" : "0";
    };
    if (reduced) {
      apply(1);
      return;
    }
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      apply(span > 0 ? clamp(-r.top / span) : 1);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [locale, reduced]);

  return (
    <section
      className="story"
      id="big-picture"
      ref={root}
      data-static={reduced ? "1" : undefined}
    >
      <div className="story-stage">
        <div className="story-glow" aria-hidden="true" />
        <svg
          className="story-line"
          viewBox="0 0 1600 900"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <path d={LINE} className="story-line-ghost" />
          <path
            ref={path}
            d={LINE}
            pathLength={1}
            className="story-line-draw"
            style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
          />
          <g ref={head} style={{ opacity: 0 }}>
            <g transform="scale(0.42) translate(-103 -153)">
              <path d={RABBIT} className="story-rabbit" />
              <path d={RABBIT_TAIL} className="story-rabbit" />
            </g>
          </g>
        </svg>
        <div className="story-year" aria-hidden="true">
          <span ref={year}>{locale === "ar" ? "٢٠١٨" : "2018"}</span>
        </div>
        <div className="story-copy">
          <span className="eyebrow">{c.aboutLabel}</span>
          <h2>{c.aboutTitle}</h2>
          <p className="story-text">
            {words.map((w, i) => (
              <span
                key={i}
                className={key.test(w) ? "sw key" : "sw"}
                style={
                  {
                    "--st": (0.1 + (0.62 * i) / words.length).toFixed(3),
                  } as CSSProperties
                }
              >
                {w}{" "}
              </span>
            ))}
          </p>
          <a className="ghost-button story-cta" href="#vision">
            {c.nav[1]}
            <ArrowUpRight size={18} />
          </a>
        </div>
        <small className="story-caption">
          {locale === "en" ? "THE START OF SOMETHING BIG" : "بداية حكاية كبيرة"}
        </small>
      </div>
    </section>
  );
}

// Vision + mission: one compact split panel. The hovered half grows, the line-art icon draws itself,
// and a rotating 360° seal sits on the seam.
function VisionIcon() {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
      className="vm-icon"
    >
      <path pathLength={1} d="M8 62C30 26 90 26 112 62 90 98 30 98 8 62Z" />
      <circle pathLength={1} cx="60" cy="62" r="17" />
      <circle pathLength={1} cx="60" cy="62" r="6" />
      <path pathLength={1} d="M60 10V24M30 20l7 11M90 20l-7 11" />
    </svg>
  );
}
function MissionIcon() {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      aria-hidden="true"
      className="vm-icon"
    >
      <circle pathLength={1} cx="56" cy="64" r="44" />
      <circle pathLength={1} cx="56" cy="64" r="28" />
      <circle pathLength={1} cx="56" cy="64" r="11" />
      <path pathLength={1} d="M56 64L104 16M104 16H86M104 16V34" />
    </svg>
  );
}

// One expanding panel for who we are (vision, mission) and what we do (3 solutions).
// Hover / focus / tap opens a panel; the others collapse to a label.
export function Pillars({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const reduced = useReducedMotion();
  const panel = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const arrow = <ArrowUpRight size={20} />;
  const items = [
    {
      key: "vision",
      label: c.vision,
      title: c.vision,
      text: c.visionText,
      icon: <VisionIcon />,
      image: "generated/vision-campus.png",
    },
    {
      key: "mission",
      label: c.mission,
      title: c.mission,
      text: c.missionText,
      icon: <MissionIcon />,
      image: "generated/mission-making.png",
    },
    ...c.services.map((sv) => ({
      key: sv.path,
      label: sv.category,
      title: sv.title,
      text: sv.text,
      image: sv.image,
      path: sv.path,
      list: sv.items,
    })),
  ];
  return (
    <section className="pillars section-pad" id="solutions">
      <span id="vision" className="pillars-anchor" />
      <div className="pillars-head">
        <div>
          <span className="eyebrow">{c.solutionLabel}</span>
          <h2>{c.solutionTitle.replace("\n", " ")}</h2>
        </div>
        <p>{c.solutionIntro}</p>
      </div>
      <motion.div
        ref={panel}
        className="pn-panel"
        initial={false}
        whileInView={reduced ? undefined : { opacity: [0, 1], y: [48, 0] }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        onViewportEnter={() => panel.current?.setAttribute("data-in", "1")}
      >
        {items.map((it, n) => {
          const open = active === n;
          const solution = "path" in it;
          return (
            <article
              key={it.key}
              className={`pn ${solution ? "pn-solution" : "pn-identity"}`}
              data-active={open}
              tabIndex={0}
              aria-label={it.label}
              onPointerEnter={(e) => e.pointerType === "mouse" && setActive(n)}
              onFocus={() => setActive(n)}
              onClick={() => setActive(n)}
            >
              {"image" in it && (
                <Image
                  src={solution ? `/images/${it.image}.webp` : `/images/${it.image}`}
                  alt=""
                  fill
                  sizes="(max-width: 760px) 100vw, 50vw"
                  className="pn-img"
                />
              )}
              <div className="pn-shade" />
              <span className="pn-num">0{n + 1}</span>
              <span className="pn-label">{it.label}</span>
              {"icon" in it && it.icon}
              <div className="pn-body">
                <div className="pn-inner">
                  <h3>{it.title}</h3>
                  <p>{it.text}</p>
                  {"list" in it && (
                    <ul>
                      {it.list.map((li) => (
                        <li key={li}>{li}</li>
                      ))}
                    </ul>
                  )}
                  {"path" in it && (
                    <a
                      className="pn-cta"
                      href={`#${it.path}`}
                      tabIndex={open ? 0 : -1}
                      aria-label={it.title}
                    >
                      {c.learn}
                      {arrow}
                    </a>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </motion.div>
    </section>
  );
}
