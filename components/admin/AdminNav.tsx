"use client";

import { cn } from "@/lib/utils";
import { PanelLeft } from "lucide-react";
import * as React from "react";

export type AdminNavItem = {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
};

export function AdminNav({
  items,
  active,
  onSelect,
  className,
}: {
  items: AdminNavItem[];
  active: string;
  onSelect: (value: string) => void;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "relative z-20 h-full w-full",
        "rounded-xl border border-glass-border/40 bg-glass-bg/40 backdrop-blur-md",
        "shadow-[0_8px_32px_rgba(0,0,0,0.12)]",
        className
      )}
      aria-label='Admin navigation'
    >
      <div className='absolute inset-0 rounded-xl bg-linear-to-b from-white/2 to-white/1 pointer-events-none' />
      <div className='relative flex h-full'>
        <nav className='flex flex-1 items-center justify-center p-4'>
          <ul className='flex flex-col gap-2 w-full max-w-[220px]'>
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = item.value === active;
              return (
                <li key={item.value}>
                  <button
                    type='button'
                    onClick={() => onSelect(item.value)}
                    className={cn(
                      "group w-full text-left",
                      "rounded-lg border border-transparent px-3 py-2",
                      "transition-all duration-200",
                      isActive
                        ? "bg-primary/10 border-primary/20 text-primary"
                        : "hover:bg-glass-bg/50 hover:border-glass-border/50 text-foreground/80"
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <div className='flex items-center gap-3'>
                      {Icon ? (
                        <Icon
                          className={cn(
                            "h-4 w-4",
                            isActive
                              ? "text-primary"
                              : "text-foreground/60 group-hover:text-foreground/90"
                          )}
                        />
                      ) : (
                        <PanelLeft className='h-4 w-4 text-foreground/60' />
                      )}
                      <span className='truncate'>{item.label}</span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
