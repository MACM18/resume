"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { signOut } from "next-auth/react";
import { Wrench, LogOut, LayoutDashboard, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUserProfile } from "@/lib/profile";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export const AuthButton = () => {
  const { session } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [navContainer, setNavContainer] = useState<HTMLElement | null>(null);

  const { data: profile } = useQuery({
    queryKey: ["currentUserProfile"],
    queryFn: getCurrentUserProfile,
    enabled: !!session,
  });

  useEffect(() => {
    setNavContainer(document.getElementById("nav-auth-container"));
  }, []);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.refresh();
  };

  const isSuperAdmin = profile?.domain === "macm.dev";
  const isAdminPage = pathname?.startsWith("/admin");

  // Hide on admin pages to avoid clutter
  if (isAdminPage) return null;

  const desktopButtons = (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className='flex items-center gap-1'
    >
      {session ? (
        <>
          {isSuperAdmin && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href='/super-admin'
                  className='group flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 hover:bg-secondary/10'
                >
                  <ShieldCheck className='h-4 w-4 text-foreground/60 group-hover:text-secondary' />
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Super Admin</p>
              </TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href='/admin'
                className='group flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 hover:bg-primary/10'
              >
                <LayoutDashboard className='h-4 w-4 text-foreground/60 group-hover:text-primary' />
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Dashboard</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleLogout}
                className='group flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 hover:bg-destructive/10'
              >
                <LogOut className='h-4 w-4 text-foreground/60 group-hover:text-destructive' />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Logout</p>
            </TooltipContent>
          </Tooltip>
        </>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href='/login'
              className='group flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-foreground/5 text-foreground/60 hover:text-foreground'
            >
              <Wrench className='h-4 w-4' />
              <span className='text-sm font-medium'>Login</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>Manage Site</p>
          </TooltipContent>
        </Tooltip>
      )}
    </motion.div>
  );

  return (
    <>
      {/* Desktop - Portal into Navigation */}
      {navContainer && createPortal(desktopButtons, navContainer)}

      {/* Mobile - Fixed Bottom Right */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className='md:hidden fixed bottom-20 right-4 z-40'
      >
        <div className='flex flex-col-reverse gap-2'>
          {session ? (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleLogout}
                    className='group flex items-center justify-center w-11 h-11 rounded-full bg-background/80 backdrop-blur-xl border border-foreground/10 shadow-lg transition-all duration-200 hover:bg-destructive/10 hover:border-destructive/20'
                  >
                    <LogOut className='h-5 w-5 text-foreground/60 group-hover:text-destructive' />
                  </button>
                </TooltipTrigger>
                <TooltipContent side='left'>
                  <p>Logout</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href='/admin'
                    className='group flex items-center justify-center w-11 h-11 rounded-full bg-background/80 backdrop-blur-xl border border-foreground/10 shadow-lg transition-all duration-200 hover:bg-primary/10 hover:border-primary/20'
                  >
                    <LayoutDashboard className='h-5 w-5 text-foreground/60 group-hover:text-primary' />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side='left'>
                  <p>Dashboard</p>
                </TooltipContent>
              </Tooltip>
              {isSuperAdmin && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href='/super-admin'
                      className='group flex items-center justify-center w-11 h-11 rounded-full bg-background/80 backdrop-blur-xl border border-foreground/10 shadow-lg transition-all duration-200 hover:bg-secondary/10 hover:border-secondary/20'
                    >
                      <ShieldCheck className='h-5 w-5 text-foreground/60 group-hover:text-secondary' />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side='left'>
                    <p>Super Admin</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href='/login'
                  className='group flex items-center justify-center w-11 h-11 rounded-full bg-background/80 backdrop-blur-xl border border-foreground/10 shadow-lg transition-all duration-200 hover:bg-foreground/5'
                >
                  <Wrench className='h-5 w-5 text-foreground/60 group-hover:text-foreground' />
                </Link>
              </TooltipTrigger>
              <TooltipContent side='left'>
                <p>Login</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </motion.div>
    </>
  );
};
