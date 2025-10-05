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
        className='fixed top-6 left-1/2 transform -translate-x-1/2 z-50 hidden md:block'
      >
        <GlassCard className='px-6 py-3'>
          <div className='flex items-center space-x-8'>
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className='relative group'
                >
                  <motion.div
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-300 ${
                      isActive
                        ? "text-primary shadow-glow"
                        : "text-foreground/70 hover:text-primary"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon size={18} />
                    <span className='text-sm font-medium'>{item.label}</span>
                  </motion.div>

                  {isActive && (
                    <motion.div
                      layoutId='activeTab'
                      className='absolute inset-0 bg-primary/10 rounded-lg border border-primary/20'
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </GlassCard>
      </motion.nav>

      {/* Mobile Navigation - Bottom Floating */}
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className='fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 md:hidden'
      >
        <GlassCard className='px-4 py-3'>
          <div className='flex items-center space-x-6'>
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className='relative group'
                >
                  <motion.div
                    className={`flex flex-col items-center p-2 rounded-lg transition-all duration-300 ${
                      isActive
                        ? "text-primary"
                        : "text-foreground/70 hover:text-primary"
                    }`}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon size={20} />
                    <span className='text-xs font-medium mt-1'>
                      {item.label}
                    </span>
                  </motion.div>

                  {isActive && (
                    <motion.div
                      layoutId='activeMobileTab'
                      className='absolute inset-0 bg-primary/10 rounded-lg border border-primary/20'
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </GlassCard>
      </motion.nav>

      {/* Mobile Menu Button - Top Right */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className='fixed top-6 right-6 z-50 md:hidden p-3 rounded-full bg-glass-bg/20 backdrop-blur-glass border border-glass-border/30 text-foreground/70 hover:text-primary transition-all duration-300'
      >
        <motion.div
          animate={{ rotate: isMobileMenuOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </motion.div>
      </motion.button>

      {/* Mobile Full Screen Menu */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{
          opacity: isMobileMenuOpen ? 1 : 0,
          scale: isMobileMenuOpen ? 1 : 0.9,
          pointerEvents: isMobileMenuOpen ? "auto" : "none",
        }}
        transition={{ duration: 0.3 }}
        className='fixed inset-0 z-40 md:hidden bg-background/95 backdrop-blur-xl'
      >
        <div className='flex flex-col items-center justify-center h-full space-y-8'>
          {isAdmin
            ? adminMobileItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = adminSection === item.key;

                return (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{
                      opacity: isMobileMenuOpen ? 1 : 0,
                      y: isMobileMenuOpen ? 0 : 50,
                    }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-4 px-8 py-4 rounded-xl transition-all duration-300 ${
                        isActive
                          ? "text-primary bg-primary/10 border border-primary/20"
                          : "text-foreground/70 hover:text-primary hover:bg-glass-bg/10"
                      }`}
                    >
                      <Icon size={24} />
                      <span className='text-xl font-medium'>{item.label}</span>
                    </Link>
                  </motion.div>
                );
              })
            : navItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;

                return (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{
                      opacity: isMobileMenuOpen ? 1 : 0,
                      y: isMobileMenuOpen ? 0 : 50,
                    }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Link
                      href={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center space-x-4 px-8 py-4 rounded-xl transition-all duration-300 ${
                        isActive
                          ? "text-primary bg-primary/10 border border-primary/20"
                          : "text-foreground/70 hover:text-primary hover:bg-glass-bg/10"
                      }`}
                    >
                      <Icon size={24} />
                      <span className='text-xl font-medium'>{item.label}</span>
                    </Link>
                  </motion.div>
                );
              })}
        </div>
      </motion.div>
    </>
  );
}
