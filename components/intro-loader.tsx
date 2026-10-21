"use client";
import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

// Debug switch: true = intro stays on screen after drawing (no lift) so it can be tuned in DevTools.
const FREEZE = false;
const HOLD = 700;
const LIFT = 900;
const FAILSAFE = 9000;

type Phase = "wait" | "draw" | "lift" | "done";

export function IntroLoader() {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("wait");

  // Plays on every load (refresh included), unless reduced motion. Starts only once the page has loaded,
  // so heavy first-load work can't desync the drawing from the reveal.
  useEffect(() => {
    if (reduced) {
      const skip = setTimeout(() => setPhase("done"), 0);
      return () => clearTimeout(skip);
    }
    document.documentElement.classList.add("intro-lock");
    let start = 0;
    const go = () => {
      start = window.setTimeout(() => setPhase("draw"), 150);
    };
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
    const failsafe = FREEZE ? 0 : window.setTimeout(() => setPhase("lift"), FAILSAFE);
    return () => {
      window.removeEventListener("load", go);
      clearTimeout(start);
      clearTimeout(failsafe);
    };
  }, [reduced]);

  // The curtain lifts only after the last drawing animation has really finished.
  useEffect(() => {
    if (phase !== "lift") return;
    document.documentElement.classList.remove("intro-lock");
    const done = setTimeout(() => setPhase("done"), LIFT);
    return () => clearTimeout(done);
  }, [phase]);

  const finished = () => {
    if (FREEZE) return;
    window.setTimeout(() => setPhase((p) => (p === "draw" ? "lift" : p)), HOLD);
  };

  if (phase === "done") return null;
  return (
    <div
      className={`intro ${phase === "draw" ? "intro-run" : ""} ${phase === "lift" ? "intro-run intro-lift" : ""}`}
      role="presentation"
      onClick={() => !FREEZE && setPhase("lift")}
    >
      <svg className="intro-mark" viewBox="20 55 200 200" fill="none" aria-hidden="true">
        <path
          pathLength="1"
          d="M137.51,223.64l15.41,21.31c7.46-.13,13.5-4.64,15.88-17.79,3.57-19.77,42.7-29.62-35.96-133.09-3.47-4.57-8.18-10.87-12.3-14.76-14.04-13.28-8.36,11.54-6.31,18.49,5.85,19.92,14.98,37.8,24.97,55.88C86.52,88.71,36.73,58.56,38.02,75.47c1.92,25.32,24.44,51.18,42.71,69.12l73.91,63.95-17.13,15.1Z"
        />
        <path
          pathLength="1"
          d="M122.6,222.66l14.74-13.03-47.46-53.69c-1.85,10.3-7.18,54.87,33.64,77.74,5.38,3.01,11.36,6.37,17.2,8.64l-18.12-19.66Z"
        />
      </svg>
      <div
        className="intro-word"
        onAnimationEnd={(e) => {
          if (e.target === e.currentTarget) finished();
        }}
      >
        <strong>BIG</strong>
        <span>EDUCATION</span>
      </div>
      <i className="intro-bar" />
    </div>
  );
}
