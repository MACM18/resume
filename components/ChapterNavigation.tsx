"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const chapters = [
  { id: "intro", label: "Intro" },
  { id: "proof", label: "Proof" },
  { id: "work", label: "Work" },
  { id: "story", label: "Story" },
  { id: "skills", label: "Skills" },
  { id: "contact", label: "Contact" },
];

export function ChapterNavigation() {
  const [active, setActive] = useState("intro");

  useEffect(() => {
    const sections = chapters.map(({ id }) => document.getElementById(id)).filter((section): section is HTMLElement => Boolean(section));
    if (!sections.length) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActive(visible.target.id);
    }, { rootMargin: "-28% 0px -54% 0px", threshold: [0, 0.1, 0.35, 0.65] });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return <>
    <div className="fixed inset-x-0 top-4 z-50 hidden justify-center px-4 lg:flex">
      <nav aria-label="Portfolio chapters" className="chapter-rail chapter-rail-desktop">
        {chapters.map((chapter, index) => <Link key={chapter.id} href={"#" + chapter.id} aria-current={active === chapter.id ? "location" : undefined} className={active === chapter.id ? "chapter-link is-active" : "chapter-link"}>
          <span className="chapter-number">{String(index + 1).padStart(2, "0")}</span><span>{chapter.label}</span>
        </Link>)}
        <span className="chapter-rail-progress" style={{ transform: "scaleX(" + ((chapters.findIndex((chapter) => chapter.id === active) + 1) / chapters.length) + ")" }} aria-hidden="true" />
      </nav>
    </div>
    <div className="fixed inset-x-0 bottom-3 z-50 px-3 lg:hidden">
      <nav aria-label="Portfolio chapters" className="chapter-rail chapter-rail-mobile">
        {chapters.map((chapter, index) => <Link key={chapter.id} href={"#" + chapter.id} aria-current={active === chapter.id ? "location" : undefined} className={active === chapter.id ? "chapter-link is-active" : "chapter-link"}>
          <span className="chapter-number">{String(index + 1).padStart(2, "0")}</span><span>{chapter.label}</span>
        </Link>)}
      </nav>
    </div>
  </>;
}
