"use client";

import { ReactNode } from "react";
import { motion, useInView, useAnimation } from "framer-motion";
import { useEffect, useRef } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  initialScale?: number;
}

export function AnimatedSection({
  children,
  className = "",
  delay = 0,
  direction = "up",
  initialScale = 1,
}: AnimatedSectionProps) {
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const directionToAnimation = {
    up: { y: 50 },
    down: { y: -50 },
    left: { x: 50 },
    right: { x: -50 },
    none: { scale: 0.95 },
  };

  useEffect(() => {
    if (isInView) {
      controls.start({ opacity: 1, y: 0, x: 0, scale: 1 });
    }
  }, [isInView, controls]);

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        scale: initialScale,
        ...directionToAnimation[direction],
      }}
      animate={controls}
      transition={{
        duration: 0.5,
        delay: delay,
        ease: "easeOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
