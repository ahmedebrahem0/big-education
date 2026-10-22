"use client";
import { useEffect, useRef, type RefObject } from "react";

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const smooth = (t: number) => t * t * (3 - 2 * t);
// 0 -> 1 as `s` moves through [a, b]
export const win = (s: number, a: number, b: number) => clamp((s - a) / (b - a));

// Drives a pinned section: reads scroll progress (0..1 over the section's sticky span),
// eases towards it every frame and hands the eased value to `paint`.
// With reduced motion it paints the finished state once and never listens to scroll.
export function useScrub(
  ref: RefObject<HTMLElement | null>,
  reduced: boolean | null,
  paint: (s: number) => void,
) {
  const fn = useRef(paint);
  useEffect(() => {
    fn.current = paint;
  });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced) {
      fn.current(1);
      return;
    }
    const target = () => {
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      return span > 0 ? clamp(-r.top / span) : 0;
    };
    let goal = target();
    let shown = goal;
    let raf = 0;
    fn.current(shown);
    const loop = () => {
      shown += (goal - shown) * 0.14;
      if (Math.abs(goal - shown) < 0.0002) shown = goal;
      fn.current(shown);
      raf = shown === goal ? 0 : requestAnimationFrame(loop);
    };
    const onScroll = () => {
      goal = target();
      if (!raf) raf = requestAnimationFrame(loop);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [ref, reduced]);
}
