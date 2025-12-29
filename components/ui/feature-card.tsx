"use client";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/GlassCard";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  metric?: string;
  accentColor?: "primary" | "secondary" | "accent";
  delay?: number;
  className?: string;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  metric,
  accentColor = "primary",
  delay = 0,
  className,
}: FeatureCardProps) {
  const colorStyles = {
    primary: {
      icon: "text-primary",
      border: "border-primary/30",
      gradient: "from-primary/20 to-primary/5",
    },
    secondary: {
      icon: "text-secondary",
      border: "border-secondary/30",
      gradient: "from-secondary/20 to-secondary/5",
    },
    accent: {
      icon: "text-accent",
      border: "border-accent/30",
      gradient: "from-accent/20 to-accent/5",
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      <GlassCard variant='gradient' className='p-6 h-full group' hover>
        <div className='flex items-start gap-4'>
          <div
            className={cn(
              "p-3 rounded-xl bg-gradient-to-br",
              colorStyles[accentColor].gradient,
              "border",
              colorStyles[accentColor].border,
              "group-hover:scale-110 transition-transform duration-300"
            )}
          >
            <Icon
              className={cn(
                colorStyles[accentColor].icon,
                "transition-transform"
              )}
              size={24}
            />
          </div>
          <div className='flex-1'>
            {metric && (
              <div
                className={cn(
                  "text-3xl font-bold mb-2 bg-gradient-to-r bg-clip-text text-transparent",
                  `from-${accentColor} to-${accentColor}/80`
                )}
              >
                {metric}
              </div>
            )}
            <h3 className='text-lg font-semibold mb-2 text-foreground'>
              {title}
            </h3>
            <p className='text-sm text-foreground/70 leading-relaxed'>
              {description}
            </p>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
