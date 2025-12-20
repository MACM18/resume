"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  float?: boolean;
}

export function GlassCard({
  children,
  className,
  hover = true,
  float = false,
}: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        "relative bg-glass-bg/15 backdrop-blur-glass border border-glass-border/40",
        "rounded-glass shadow-glass",
        "before:absolute before:inset-0 before:rounded-glass before:bg-gradient-glass before:opacity-60",
        "after:absolute after:inset-px after:rounded-glass after:bg-linear-to-br after:from-white/5 after:to-transparent after:opacity-50",
        hover &&
          "transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:border-primary/60 hover:bg-glass-bg/25 hover:backdrop-blur-md",
        float && "animate-float",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={hover ? { y: -4 } : undefined}
    >
      <div className='relative z-10'>{children}</div>
    </motion.div>
  );
}
