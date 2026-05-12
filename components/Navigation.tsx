"use client";
import { motion, AnimatePresence } from "framer-motion";
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
import { useState, useEffect } from "react";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/about", label: "About", icon: User },
  { path: "/projects", label: "Projects", icon: FolderOpen },
  { path: "/resume", label: "Resume", icon: FileText },
  { path: "/contact", label: "Contact", icon: Info }, // Added contact to main nav
];

export function Navigation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isAdmin = pathname?.startsWith("/admin");
  const adminSection = searchParams?.get("section") ?? "profile";

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
      {/* Desktop Navigation - Futuristic Floating Pill */}
      <div className="fixed top-6 left-0 right-0 z-50 hidden md:flex justify-center pointer-events-none">
        <motion.nav
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`pointer-events-auto flex items-center gap-1 px-2 py-2 rounded-full border border-white/10 dark:border-white/5 bg-background/40 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.2)] transition-all duration-300 ${
            scrolled ? "scale-95 opacity-90 hover:scale-100 hover:opacity-100" : ""
          }`}
        >
          <div className='flex items-center gap-1'>
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              const Icon = item.icon;

              return (
                <Link key={item.path} href={item.path} className='relative group'>
                  <motion.div
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 relative z-10 ${
                      isActive
                        ? "text-primary"
                        : "text-foreground/60 hover:text-foreground"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon size={16} />
                    <span className='text-xs font-semibold tracking-wide uppercase'>
                      {item.label}
                    </span>
                  </motion.div>

                  {isActive && (
                    <motion.div
                      layoutId='activeTab'
                      className='absolute inset-0 bg-primary/10 rounded-full border border-primary/20'
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  
                  {/* Hover effect for non-active items */}
                  {!isActive && (
                    <motion.div
                      className="absolute inset-0 bg-foreground/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      layoutId={undefined}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Separator if needed or just space */}
          <div className="w-px h-4 bg-white/10 dark:bg-white/5 mx-2" />

          {/* Auth buttons container inside the pill */}
          <div id='nav-auth-container' className="flex items-center" />
        </motion.nav>
      </div>

      {/* Mobile Navigation - Futuristic Floating Bottom Pill */}
      <div className="fixed bottom-8 left-0 right-0 z-40 md:hidden flex justify-center px-4">
        <motion.nav
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-sm flex items-center justify-around p-2 rounded-full border border-white/10 dark:border-white/5 bg-background/60 backdrop-blur-2xl shadow-2xl"
        >
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                href={item.path}
                className='relative flex flex-col items-center flex-1'
              >
                <motion.div
                  className={`flex flex-col items-center gap-1 p-2 rounded-full transition-all duration-300 relative z-10 ${
                    isActive ? "text-primary" : "text-foreground/60"
                  }`}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon size={20} />
                </motion.div>

                {isActive && (
                  <motion.div
                    layoutId='activeMobileTab'
                    className='absolute inset-0 bg-primary/10 rounded-full border border-primary/20'
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}
              </Link>
            );
          })}
        </motion.nav>
      </div>

      {/* Admin Mobile Menu Button */}
      {isAdmin && (
        <>
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className='fixed top-6 right-6 z-50 md:hidden p-3 rounded-full border border-white/10 bg-background/40 backdrop-blur-2xl text-foreground/70 hover:text-primary transition-all duration-200 shadow-xl'
          >
            <motion.div
              animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </motion.div>
          </motion.button>

          <AnimatePresence>
            {isMobileMenuOpen && (
              <>
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className='fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] z-40 md:hidden bg-background/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl overflow-y-auto pt-20'
                >
                  <div className='p-6 space-y-2'>
                    <h2 className='text-sm font-bold uppercase tracking-widest text-foreground/40 mb-6 px-4'>
                      Admin Controls
                    </h2>
                    {adminMobileItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = adminSection === item.key;

                      return (
                        <Link
                          key={item.key}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 ${
                            isActive
                              ? "text-primary bg-primary/10 border border-primary/20"
                              : "text-foreground/70 hover:text-foreground hover:bg-foreground/5"
                          }`}
                        >
                          <Icon size={18} />
                          <span className='text-sm font-semibold'>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className='fixed inset-0 z-30 md:hidden bg-black/40 backdrop-blur-sm'
                />
              </>
            )}
          </AnimatePresence>
        </>
      )}
    </>
  );
}
