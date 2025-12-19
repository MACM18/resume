"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { signOut } from "next-auth/react";
import { Wrench, LogOut, LayoutDashboard, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { GlassCard } from "./GlassCard";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUserProfile } from "@/lib/profile";

export const AuthButton = () => {
  const { session } = useAuth();
  const router = useRouter();

  const { data: profile } = useQuery({
    queryKey: ["currentUserProfile"],
    queryFn: getCurrentUserProfile,
    enabled: !!session, // Only fetch profile if user is logged in
  });

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.refresh();
  };

  const isSuperAdmin = profile?.domain === "macm.dev";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 1 }}
      className='fixed top-6 left-6 z-30'
    >
      <GlassCard className='p-1 rounded-full'>
        <div className='flex items-center gap-1'>
          {session ? (
            <>
              {isSuperAdmin && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href='/super-admin'
                      className='group flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-300 hover:bg-secondary/10'
                    >
                      <ShieldCheck className='h-5 w-5 text-foreground/70 group-hover:text-secondary' />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side='right'>
                    <p>Super Admin</p>
                  </TooltipContent>
                </Tooltip>
              )}
              {/* Always show the regular admin dashboard link if logged in */}
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
