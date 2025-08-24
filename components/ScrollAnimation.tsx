import { useRef, ReactNode } from "react";
import { motion, useInView } from "framer-motion";

interface ScrollAnimationProps {
  children: ReactNode;
  className?: string;
  initialX?: number;
  initialY?: number;
  initialScale?: number;
  duration?: number;
  delay?: number;
  once?: boolean;
}

export function ScrollAnimation({
  children,
  className = "",
  initialX = 0,
  initialY = 50,
  initialScale = 1,
  duration = 0.6,
  delay = 0,
  once = true,
}: ScrollAnimationProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, x: initialX, y: initialY, scale: initialScale }}
      animate={isInView ? { opacity: 1, x: 0, y: 0, scale: 1 } : {}}
      transition={{ duration, delay }}
    >
      {children}
    </motion.div>
  );
}
