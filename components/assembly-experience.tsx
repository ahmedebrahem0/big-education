"use client";

import dynamic from "next/dynamic";
import {
  Component,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useReducedMotion } from "motion/react";
import type { Locale } from "@/content/site";
import "./assembly.css";

export function AssemblyFallback() {
  return (
    <div
      className="assembly-reference"
      role="img"
      aria-label="BIG Education training room with twelve wood and black upholstered chairs, writing tablets, a lecturer desk and teal storage"
    />
  );
}
const Room = dynamic(() => import("./assembly-room"), {
  ssr: false,
  loading: AssemblyFallback,
});
class RoomBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? <AssemblyFallback /> : this.props.children;
  }
}

const chapters = {
  en: [
    "The foundation",
    "Frames & supports",
    "Seats & writing tablets",
    "Desk & storage",
    "Ready for learning",
  ],
  ar: [
    "الأساس",
    "الهياكل والدعامات",
    "المقاعد وأسطح الكتابة",
    "المكتب والتخزين",
    "جاهزة للتعلّم",
  ],
};
const descriptions = {
  en: [
    "Every learning space starts with a considered foundation.",
    "Cantilever frames take shape, one connection at a time.",
    "Curved timber, upholstered seats, and a place for every idea.",
    "A teaching desk and thoughtful storage bring the room together.",
    "Warm oak. Deep teal. A complete environment for learning.",
  ],
  ar: [
    "كل مساحة للتعلّم تبدأ بأساس مدروس.",
    "تتشكّل الهياكل والدعامات، وصلة بعد وصلة.",
    "خشب منحني، مقاعد مبطّنة، ومساحة لكل فكرة.",
    "مكتب للمعلّم ووحدات تخزين تُكمل المكان.",
    "دفء الخشب وعمق التركواز. بيئة متكاملة للتعلّم.",
  ],
};
const stops = [0, 0.23, 0.47, 0.69, 1];

export function AssemblyExperience({ locale }: { locale: Locale }) {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const exit = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const rail = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [visible, setVisible] = useState(false);
  const [awake, setAwake] = useState(true);
  const [failed, setFailed] = useState(false);
  const [complete, setComplete] = useState(false);
  const [percent, setPercent] = useState(0);
  const reduced = useReducedMotion();
  const staticView = !!reduced || failed || complete;
  const id = useId();
  const active = staticView ? 4 : Math.min(4, Math.floor(percent / 20));
  const arabic = locale === "ar";

  useEffect(() => {
    const element = section.current;
    if (!element) return;
    const preload = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setNear(true);
      },
      { rootMargin: "500px" },
    );
    const viewport = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    preload.observe(element);
    viewport.observe(element);
    const visibility = () => setAwake(!document.hidden);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      preload.disconnect();
      viewport.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  useEffect(() => {
    let frame = 0;
    let lastUpdate = 0;
    let trailing: ReturnType<typeof setTimeout> | undefined;
    const read = () => {
      frame = 0;
      if (!section.current || !stage.current) return;
      const rect = section.current.getBoundingClientRect();
      const travel = section.current.offsetHeight - stage.current.offsetHeight;
      const value = staticView
        ? 1
        : Math.max(0, Math.min(1, -rect.top / Math.max(1, travel)));
      progress.current = value;
      if (rail.current) rail.current.style.transform = `scaleX(${value})`;
      const update = () => {
        setPercent(Math.round(value * 100));
        lastUpdate = performance.now();
      };
      clearTimeout(trailing);
      if (performance.now() - lastUpdate > 120) update();
      else trailing = setTimeout(update, 125);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(trailing);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [staticView]);

  function jump(index: number) {
    if (!section.current || !stage.current) return;
    setComplete(false);
    requestAnimationFrame(() => {
      if (!section.current || !stage.current) return;
      const top = window.scrollY + section.current.getBoundingClientRect().top;
      window.scrollTo({
        top:
          top +
          stops[index] *
            (section.current.offsetHeight - stage.current.offsetHeight),
        behavior: "instant",
      });
    });
  }

  function continueExploring() {
    const next = exit.current?.nextElementSibling;
    if (next instanceof HTMLElement) {
      if (!next.hasAttribute("tabindex")) next.tabIndex = -1;
      next.focus({ preventScroll: true });
      next.scrollIntoView({ behavior: "instant", block: "start" });
    } else exit.current?.focus();
  }

  return (
    <>
      <section
        ref={section}
        className={`assembly-experience${staticView ? " assembly-stable" : ""}`}
        id="approach"
        aria-labelledby={`${id}-title`}
      >
        <div className="assembly-stage" ref={stage}>
          <header className="assembly-header">
            <div>
              <span className="assembly-kicker">
                {arabic
                  ? "من التفاصيل إلى مساحة متكاملة"
                  : "FROM THE PARTS. TO THE POSSIBILITIES."}
              </span>
              <h2 id={`${id}-title`}>
                {arabic
                  ? "مساحة تتشكّل للتعلّم."
                  : "A space, built for learning."}
              </h2>
            </div>
            <a
              href={`#${id}-after`}
              onClick={(event) => {
                event.preventDefault();
                continueExploring();
              }}
              className="assembly-skip"
            >
              {arabic ? "تخطّي التجربة ↓" : "Skip experience ↓"}
            </a>
          </header>
          <div className="assembly-viewport" aria-hidden="true">
            {near && !reduced && !failed ? (
              <RoomBoundary onFailure={() => setFailed(true)}>
                <Room
                  progress={progress}
                  running={visible && awake}
                  complete={complete}
                  onFailure={() => setFailed(true)}
                />
              </RoomBoundary>
            ) : (
              <AssemblyFallback />
            )}
          </div>
          <div className="assembly-controls">
            <div className="assembly-caption">
              <div>
                <span className="assembly-index">0{active + 1} / 05</span>
                <p id={`${id}-caption`}>{descriptions[locale][active]}</p>
              </div>
              <button
                className="assembly-whole"
                onClick={() => {
                  if (complete && !reduced && !failed) jump(0);
                  else {
                    setComplete(true);
                    requestAnimationFrame(() =>
                      section.current?.scrollIntoView({
                        behavior: "instant",
                        block: "start",
                      }),
                    );
                  }
                }}
              >
                {complete && !reduced && !failed
                  ? arabic
                    ? "إعادة التجميع ↺"
                    : "Replay assembly ↺"
                  : arabic
                    ? "عرض الغرفة كاملة ↗"
                    : "View complete room ↗"}
              </button>
            </div>
            <div
              className="assembly-progress"
              role="progressbar"
              aria-label={
                arabic ? "تقدّم تجميع الغرفة" : "Room assembly progress"
              }
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={staticView ? 100 : percent}
            >
              <div ref={rail} />
            </div>
            {!reduced && !failed && (
              <nav
                className="assembly-chapters"
                aria-label={arabic ? "مراحل التجميع" : "Assembly chapters"}
              >
                {chapters[locale].map((label, index) => (
                  <button
                    key={label}
                    aria-current={index === active ? "step" : undefined}
                    onClick={() => jump(index)}
                  >
                    <span>0{index + 1}</span>
                    {label}
                  </button>
                ))}
              </nav>
            )}
            {(reduced || failed) && (
              <p className="assembly-static-note">
                {arabic
                  ? "الغرفة المكتملة — عرض ثابت."
                  : "The complete training room — still view."}
              </p>
            )}
          </div>
        </div>
      </section>
      <div
        ref={exit}
        className="assembly-exit"
        id={`${id}-after`}
        tabIndex={-1}
      >
        <span>
          {arabic
            ? "مصمّمة للتعلّم. مبنيّة لتدوم."
            : "Designed for learning. Built to last."}
        </span>
        <button onClick={continueExploring}>
          {arabic ? "اكتشف المزيد ↓" : "Continue exploring ↓"}
        </button>
      </div>
    </>
  );
}
