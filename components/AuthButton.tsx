"use client";

import { useSupabase } from "@/components/providers/AuthProvider";
// import { Button } from "@/components/ui/button";
import { Wrench, LogOut, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GlassCard } from "./GlassCard";

export const AuthButton = () => {
  const { session, supabase } = useSupabase();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 1 }}
      className='fixed top-6 left-6 z-50'
    >
      <GlassCard className='p-1 rounded-full'>
        <div className='flex items-center gap-1'>
          {session ? (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href='/admin'
                    className='group flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-300 hover:bg-primary/10'
                  >
                    <LayoutDashboard className='h-5 w-5 text-foreground/70 group-hover:text-primary' />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side='right'>
                  <p>Dashboard</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleLogout}
                    className='group flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-300 hover:bg-destructive/10'
                  >
                    <LogOut className='h-5 w-5 text-foreground/70 group-hover:text-destructive' />
                  </button>
                </TooltipTrigger>
                <TooltipContent side='right'>
                  <p>Logout</p>
                </TooltipContent>
              </Tooltip>
            </>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href='/login'
                  className='group flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-300 hover:bg-secondary/10'
                >
                  <Wrench className='h-5 w-5 text-foreground/70 group-hover:text-secondary' />
                </Link>
              </TooltipTrigger>
              <TooltipContent side='right'>
                <p>Modify</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </GlassCard>
    </motion.div>
  );
};
