"use client";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "motion/react";
import { copy, type Locale } from "@/content/site";
import type { Live } from "./spaces-rooms";

const Rooms = dynamic(() => import("./spaces-rooms"), { ssr: false });

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

// Pinned scene: scrolling walks the camera through three built-in-code rooms
// (learning, technology, creative) while the page colours shift with each chapter.
export function SpacesScene({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const reduced = useReducedMotion();
  const root = useRef<HTMLElement>(null);
  const live = useRef<Live>({ fb: 0, ch: 0, item: -1 });
  const jump = useRef<(ch: number) => void>(() => {});
  const [ch, setCh] = useState(0);
  const [item, setItem] = useState(0);
  const [running, setRunning] = useState(false);
  const [near, setNear] = useState(false);
  const [failed, setFailed] = useState(false);
  const [small, setSmall] = useState(false);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    setSmall(window.matchMedia("(max-width: 760px)").matches);
    let last = { ch: -1, item: -1 };

    const apply = (p: number) => {
      const cf = p * 3;
      const chn = Math.min(2, Math.floor(cf));
      const local = p >= 1 ? 1 : cf - chn;
      const fb = chn + (chn < 2 ? smooth(clamp((local - 0.8) / 0.2)) : 0);
      const a = Math.floor(fb);
      const b = Math.min(2, a + 1);
      const m = smooth(fb - a);
      const T = (k: "bg" | "fg" | "ac") => mix(THEMES[a][k], THEMES[b][k], m);
      el.style.setProperty("--bg", rgb(T("bg")));
      el.style.setProperty("--fg", rgb(T("fg")));
      el.style.setProperty("--ac", rgb(T("ac")));
      el.style.setProperty("--local", local.toFixed(3));
      const it = Math.min(2, Math.floor(local * 3));
      // camera frames the whole room right after entering and again just before leaving
      live.current = {
        fb,
        ch: chn,
        item: local < 0.07 || (chn < 2 && local > 0.86) ? -1 : it,
      };
      if (last.ch !== chn) setCh(chn);
      if (last.item !== it) setItem(it);
      last = { ch: chn, item: it };
    };
    const onScroll = () => {
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      apply(span > 0 ? clamp(-r.top / span) : 0);
    };
    jump.current = (target: number) => {
      if (reduced) {
        apply((target + 0.5) / 3);
        return;
      }
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      window.scrollTo({
        top: window.scrollY + r.top + span * ((target + 0.4) / 3),
        behavior: "smooth",
      });
    };
    onScroll();
    const preload = new IntersectionObserver(
      ([e]) => e.isIntersecting && setNear(true),
      { rootMargin: "700px" },
    );
    const view = new IntersectionObserver(([e]) =>
      setRunning(e.isIntersecting),
    );
    preload.observe(el);
    view.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      preload.disconnect();
      view.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [reduced]);

  const names = c.spaces[ch];
  const details = c.spaceDetails[ch];
  return (
    <section
      className="spx"
      id="spaces"
      ref={root}
      data-static={reduced ? "1" : undefined}
    >
      <div className="spx-stage">
        <div className="spx-3d" aria-hidden="true">
          {near && !failed && (
            <Rooms
              live={live}
              running={running}
              small={small}
              onFailure={() => setFailed(true)}
            />
          )}
        </div>
        <div className="spx-copy">
          <span className="eyebrow">{c.spacesLabel}</span>
          <h2>{c.spacesTitle}</h2>
          <p className="spx-lead">{c.spacesText}</p>
          <div className="spx-tabs" role="tablist" aria-label={c.spacesLabel}>
            {c.filters.map((f, n) => (
              <button
                key={f}
                role="tab"
                aria-selected={ch === n}
                className="spx-tab"
                data-s={n < ch ? "past" : n === ch ? "active" : "future"}
                onClick={() => jump.current(n)}
              >
                <span>0{n + 1}</span>
                {f}
                <i />
              </button>
            ))}
          </div>
          <ol className="spx-list" key={ch}>
            {names.map((name, n) => (
              <li
                key={name}
                data-on={reduced ? true : item === n}
                style={{ "--n": n } as CSSProperties}
              >
                <span>0{n + 1}</span>
                <div>
                  <h3>{name}</h3>
                  <p>{details[n]}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
