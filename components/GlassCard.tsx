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
        "after:absolute after:inset-[1px] after:rounded-glass after:bg-gradient-to-br after:from-white/5 after:to-transparent after:opacity-50",
        hover &&
          "transition-all duration-300 hover:shadow-hover hover:scale-105 hover:border-primary/40 hover:bg-glass-bg/20",
        float && "animate-float",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className='relative z-10'>{children}</div>
    </motion.div>
  );
}
