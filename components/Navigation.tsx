"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Home,
  User,
  FolderOpen,
  FileText,
  Menu,
  X,
  Palette,
  Info,
  FolderKanban,
  Briefcase,
} from "lucide-react";
import { useState } from "react";
import { GlassCard } from "./GlassCard";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/about", label: "About", icon: User },
  { path: "/projects", label: "Projects", icon: FolderOpen },
  { path: "/resume", label: "Resume", icon: FileText },
];

export function Navigation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdmin = pathname?.startsWith("/admin");
  const adminSection = searchParams?.get("section") ?? "profile";

  // Admin mobile menu items map to /admin?section=<value>
  const adminMobileItems = [
    {
      href: "/admin?section=profile",
      key: "profile",
      label: "Profile & Domain",
      icon: User,
    },
    {
      href: "/admin?section=theme",
      key: "theme",
      label: "Theme",
      icon: Palette,
    },
    {
      href: "/admin?section=home",
      key: "home",
      label: "Home Page",
      icon: Home,
    },
    {
      href: "/admin?section=about",
      key: "about",
      label: "About Page",
      icon: Info,
    },
    {
      href: "/admin?section=projects",
      key: "projects",
      label: "Projects",
      icon: FolderKanban,
    },
    {
      href: "/admin?section=work",
      key: "work",
      label: "Work Experience",
      icon: Briefcase,
    },
    {
      href: "/admin?section=resumes",
      key: "resumes",
      label: "Resumes",
      icon: FileText,
    },
  ] as const;

  return (
    <>
      {/* Desktop Navigation - Top */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className='fixed top-0 left-0 right-0 z-50 hidden md:block border-b border-foreground/5 bg-background/80 backdrop-blur-xl'
      >
        <div className='max-w-7xl mx-auto px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-1'>
              {navItems.map((item) => {
                const isActive = pathname === item.path;
                const Icon = item.icon;

                return (
                  <Link key={item.path} href={item.path} className='relative'>
                    <motion.div
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                        isActive
                          ? "text-primary bg-primary/5"
                          : "text-foreground/60 hover:text-foreground hover:bg-foreground/5"
                      }`}
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon size={18} />
                      <span className='text-sm font-medium'>{item.label}</span>
                    </motion.div>

                    {isActive && (
                      <motion.div
                        layoutId='activeTab'
                        className='absolute bottom-0 left-0 right-0 h-0.5 bg-primary'
                        initial={false}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 40,
                        }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Navigation - Bottom Bar */}
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className='fixed bottom-0 left-0 right-0 z-30 md:hidden border-t border-foreground/5 bg-background/95 backdrop-blur-xl'
      >
        <div className='grid grid-cols-4 px-2 py-3 safe-area-inset-bottom'>
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                href={item.path}
                className='relative flex flex-col items-center'
              >
                <motion.div
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive ? "text-primary" : "text-foreground/60"
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon size={22} />
                  <span className='text-xs font-medium'>{item.label}</span>
                </motion.div>

                {isActive && (
                  <motion.div
                    layoutId='activeMobileTab'
                    className='absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full'
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 40,
                    }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </motion.nav>

      {/* Mobile Menu Button - Top Right - Only for Admin */}
      {isAdmin && (
        <>
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className='fixed top-4 right-4 z-50 md:hidden p-3 rounded-full border border-foreground/10 bg-background/80 backdrop-blur-xl text-foreground/70 hover:text-primary transition-all duration-200 shadow-lg'
          >
            <motion.div
              animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </motion.div>
          </motion.button>

          {/* Mobile Admin Menu Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{
              x: isMobileMenuOpen ? 0 : "100%",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className='fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] z-40 md:hidden bg-background border-l border-foreground/10 shadow-2xl overflow-y-auto'
          >
            <div className='p-6 space-y-2'>
              <h2 className='text-xl font-bold mb-6 px-2'>Admin Menu</h2>
              {adminMobileItems.map((item) => {
                const Icon = item.icon;
                const isActive = adminSection === item.key;

                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "text-primary bg-primary/10 border border-primary/20"
                        : "text-foreground/70 hover:text-foreground hover:bg-foreground/5"
                    }`}
                  >
                    <Icon size={20} />
                    <span className='font-medium'>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>

          {/* Overlay */}
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className='fixed inset-0 z-30 md:hidden bg-background/80 backdrop-blur-sm'
            />
          )}
        </>
      )}
    </>
  );
}
