"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center" | "right";
  gradient?: "primary" | "secondary" | "accent" | "mixed";
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  align = "center",
  gradient = "mixed",
  className,
}: SectionHeaderProps) {
  const gradientStyles = {
    primary: "from-primary to-primary/80",
    secondary: "from-secondary to-secondary/80",
    accent: "from-accent to-accent/80",
    mixed: "from-primary via-secondary to-accent",
  };

  const alignStyles = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={cn("flex flex-col gap-4 mb-12", alignStyles[align], className)}
    >
      <div className='relative inline-block'>
        <h2
          className={cn(
            "text-4xl md:text-5xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
            gradientStyles[gradient]
          )}
        >
          {title}
        </h2>
        <div
          className={cn(
            "absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r rounded-full",
            gradientStyles[gradient],
            "opacity-30"
          )}
        />
      </div>
      {subtitle && (
        <p className='text-lg md:text-xl text-foreground/70 max-w-2xl'>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
