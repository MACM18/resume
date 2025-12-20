"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  float?: boolean;
  variant?: "default" | "gradient" | "minimal";
}

export function GlassCard({
  children,
  className,
  hover = true,
  float = false,
  variant = "default",
}: GlassCardProps) {
  const variantStyles = {
    default: "bg-glass-bg/10 backdrop-blur-xl border-glass-border/30",
    gradient:
      "bg-gradient-to-br from-glass-bg/15 via-glass-bg/5 to-transparent backdrop-blur-2xl border-glass-border/40",
    minimal: "bg-glass-bg/5 backdrop-blur-lg border-glass-border/20",
  };

  return (
    <motion.div
      className={cn(
        "relative overflow-hidden",
        "rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)]",
        variantStyles[variant],
        "border",
        // Multi-layer glass effect
        "before:absolute before:inset-0 before:rounded-2xl",
        "before:bg-gradient-to-br before:from-white/10 before:via-white/5 before:to-transparent",
        "before:opacity-50",
        // Shimmer effect on top edge
        "after:absolute after:inset-x-0 after:top-0 after:h-px",
        "after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent",
        hover && "transition-all duration-700 ease-out",
        hover &&
          "hover:shadow-[0_8px_40px_rgba(0,0,0,0.15),0_0_80px_rgba(var(--primary)/0.1)]",
        hover && "hover:border-primary/50 hover:bg-glass-bg/20",
        hover && "hover:before:opacity-70",
        float && "animate-float",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Noise texture overlay for depth */}
      <div
        className='absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none'
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      <div className='relative z-10'>{children}</div>
    </motion.div>
  );
}
