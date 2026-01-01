"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  float?: boolean;
  variant?: "default" | "gradient" | "minimal" | "bordered";
}

export function GlassCard({
  children,
  className,
  hover = true,
  float = false,
  variant = "default",
}: GlassCardProps) {
  const variantStyles = {
    default: "bg-background/40 backdrop-blur-sm border-foreground/10 shadow-sm",
    gradient:
      "bg-gradient-to-br from-background/50 via-background/30 to-background/20 backdrop-blur-sm border-foreground/10",
    minimal: "bg-background/20 backdrop-blur-sm border-foreground/5",
    bordered: "bg-background/30 backdrop-blur-sm border-foreground/20",
  };

  return (
    <motion.div
      className={cn(
        "relative overflow-hidden",
        "rounded-xl border",
        variantStyles[variant],
        hover && "transition-all duration-300 ease-out",
        hover &&
          "hover:border-primary/30 hover:shadow-md hover:bg-background/50",
        hover && "hover:-translate-y-0.5",
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
