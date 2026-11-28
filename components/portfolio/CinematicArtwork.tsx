"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

type ArtworkVariant = "hero" | "atmosphere";

const artwork = {
  hero: "/images/cinematic-hero.webp",
  atmosphere: "/images/cinematic-atmosphere.webp",
} satisfies Record<ArtworkVariant, string>;

/** Decorative, scroll-scrubbed depth. Its motion naturally reverses with scroll. */
export function CinematicArtwork({
  variant = "atmosphere",
  className = "",
}: {
  variant?: ArtworkVariant;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["3vh", "-3vh"]);
  const x = useTransform(scrollYProgress, [0, 1], ["-1vw", "1vw"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.025, 1.085]);

  return (
    <motion.div
      ref={ref}
      aria-hidden="true"
      className={`cinematic-artwork ${className}`}
      style={reducedMotion ? undefined : { x, y, scale }}
    >
      <Image
        src={artwork[variant]}
        alt=""
        fill
        priority={variant === "hero"}
        sizes="100vw"
        quality={82}
        draggable={false}
        className="cinematic-artwork-image"
      />
    </motion.div>
  );
}
