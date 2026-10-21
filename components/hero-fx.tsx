"use client";
import { useEffect, useRef, type ReactNode } from "react";

// Pointer + scroll parallax for the hero. Writes CSS variables only (no React state per frame).
export function HeroFx({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const trail = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const fine = window.matchMedia("(pointer: fine)").matches;
    let raf = 0;
    let mx = 0.2;
    let my = 0;
    let tx = mx;
    let ty = my;
    let p = 0;
    let visible = true;
    const tick = () => {
      raf = 0;
      mx += (tx - mx) * 0.08;
      my += (ty - my) * 0.08;
      el.style.setProperty("--mx", mx.toFixed(4));
      el.style.setProperty("--my", my.toFixed(4));
      el.style.setProperty("--p", p.toFixed(4));
      if (visible && (Math.abs(tx - mx) > 0.001 || Math.abs(ty - my) > 0.001))
        raf = requestAnimationFrame(tick);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    // Light trail: a short-lived ribbon that follows the pointer.
    const cv = trail.current;
    const ctx = cv?.getContext("2d") ?? null;
    const pts: { x: number; y: number; t: number }[] = [];
    let traf = 0;
    const LIFE = 650;
    const size = () => {
      if (!cv) return;
      const r = el.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = r.width * dpr;
      cv.height = r.height * dpr;
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const draw = () => {
      traf = 0;
      if (!ctx || !cv) return;
      const now = performance.now();
      while (pts.length && now - pts[0].t > LIFE) pts.shift();
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1];
        const b = pts[i];
        const life = 1 - (now - b.t) / LIFE;
        ctx.strokeStyle = `rgba(182,212,202,${(life * 0.85).toFixed(3)})`;
        ctx.shadowColor = "rgba(182,212,202,0.9)";
        ctx.shadowBlur = 12;
        ctx.lineWidth = 1 + life * 3.5;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
      if (pts.length) traf = requestAnimationFrame(draw);
    };
    const onTrail = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      pts.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() });
      if (pts.length > 60) pts.shift();
      if (!traf) traf = requestAnimationFrame(draw);
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
      kick();
    };
    const onScroll = () => {
      p = Math.min(1, Math.max(0, window.scrollY / el.offsetHeight));
      kick();
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) kick();
    });
    io.observe(el);
    if (fine) {
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointermove", onTrail);
      size();
      window.addEventListener("resize", size);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      io.disconnect();
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointermove", onTrail);
      window.removeEventListener("resize", size);
      cancelAnimationFrame(traf);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <section className="hero" id="top" ref={ref}>
      {children}
      <canvas ref={trail} className="hero-trail" aria-hidden="true" />
    </section>
  );
}
