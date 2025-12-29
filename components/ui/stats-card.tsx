"use client";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/GlassCard";

interface StatsCardProps {
  icon?: LucideIcon;
  metric: string;
  label: string;
  description?: string;
  trend?: "up" | "down" | "neutral";
  delay?: number;
  className?: string;
}

export function StatsCard({
  icon: Icon,
  metric,
  label,
  description,
  trend = "neutral",
  delay = 0,
  className,
}: StatsCardProps) {
  const trendColors = {
    up: "text-green-500",
    down: "text-red-500",
    neutral: "text-foreground/60",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      className={className}
    >
      <GlassCard variant='gradient' className='p-6 text-center group' hover>
        {Icon && (
          <div className='mb-4 flex justify-center'>
            <div className='p-3 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/30'>
              <Icon className='text-primary' size={24} />
            </div>
          </div>
        )}
        <div className='text-5xl font-bold bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent mb-2'>
          {metric}
        </div>
        <div
          className={cn(
            "text-sm uppercase tracking-wide mb-3",
            trendColors[trend]
          )}
        >
          {label}
        </div>
        {description && (
          <p className='text-foreground/70 text-sm leading-relaxed'>
            {description}
          </p>
        )}
      </GlassCard>
    </motion.div>
  );
}
