"use client";

import { useEffect, useRef } from "react";

/** A decorative page-length thread whose accent is drawn along with scroll progress. */
export function StoryThread() {
  const activePath = useRef<SVGPathElement>(null);

  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-story-root]");
    const path = activePath.current;
    if (!root || !path) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const range = Math.max(1, root.offsetHeight - window.innerHeight);
        const progress = Math.min(1, Math.max(0, -root.getBoundingClientRect().top / range));
        path.style.strokeDashoffset = reducedMotion.matches ? "0" : String(1 - progress);
      });
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(root);
    reducedMotion.addEventListener("change", update);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      resizeObserver.disconnect();
      reducedMotion.removeEventListener("change", update);
    };
  }, []);

  const rope = "M50 0 C14 45 86 85 50 130 S14 215 50 260 S86 345 50 390 S14 475 50 520 S86 605 50 650 S14 735 50 780 S86 865 50 910 S14 965 50 1000";

  return (
    <svg className="story-thread" viewBox="0 0 100 1000" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="story-thread-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" />
          <stop offset="52%" stopColor="hsl(var(--secondary))" />
          <stop offset="100%" stopColor="hsl(var(--primary))" />
        </linearGradient>
      </defs>
      <path className="story-thread-base" d={rope} pathLength="1" />
      <path ref={activePath} className="story-thread-progress" d={rope} pathLength="1" />
      {[130, 260, 390, 520, 650, 780, 910].map((y, index) => (
        <circle key={y} className="story-thread-knot" cx={index % 2 ? 50 : 50} cy={y} r="4" />
      ))}
    </svg>
  );
}
