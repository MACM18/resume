"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, Suspense } from "react";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { motion, AnimatePresence } from "framer-motion";
import { ProjectManagement } from "@/components/admin/ProjectManagement";
import { ProfileManagement } from "@/components/admin/ProfileManagement";
import { HomePageForm } from "@/components/admin/HomePageForm";
import { AboutPageForm } from "@/components/admin/AboutPageForm";
import { ResumeManagement } from "@/components/admin/ResumeManagement";
import { ResumeManager } from "@/components/admin/ResumeManager";
import { ThemeEditor } from "@/components/admin/ThemeEditor";
import { WorkExperienceManagement } from "@/components/admin/WorkExperienceManagement";
import { GalleryManager } from "@/components/admin/GalleryManager";
import {
  User,
  Palette,
  Home,
  Info,
  FolderKanban,
  Briefcase,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  ChevronRight,
  Loader2,
} from "lucide-react";

const ADMIN_GROUPS = [
  {
    label: "Identity",
    items: [
      { value: "profile", label: "Profile & Domain", icon: User },
      { value: "theme", label: "Theme & Branding", icon: Palette },
    ],
  },
  {
    label: "Pages",
    items: [
      { value: "home", label: "Home Page", icon: Home },
      { value: "about", label: "About Page", icon: Info },
    ],
  },
  {
    label: "Professional",
    items: [
      { value: "work", label: "Work Experience", icon: Briefcase },
      { value: "projects", label: "Project Portfolio", icon: FolderKanban },
      { value: "resumes", label: "Resume Builder", icon: FileText },
    ],
  },
  {
    label: "Assets",
    items: [{ value: "gallery", label: "Media Gallery", icon: ImageIcon }],
  },
] as const;

// Explicitly type for better inference and to avoid "as const" flatMap issues
type AdminNavItem = (typeof ADMIN_GROUPS)[number]["items"][number];
const ALL_ITEMS: AdminNavItem[] = ADMIN_GROUPS.reduce<AdminNavItem[]>(
  (acc, group) => [...acc, ...group.items],
  []
);

function AdminDashboardContent() {
  const { session } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Derived state from URL - primary source of truth
  const section = searchParams?.get("section") || "profile";
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session) router.push("/login");
  }, [session, router]);

  // Sync scroll position for mobile nav
  useEffect(() => {
    const activeElement = document.getElementById(`nav-item-${section}`);
    if (activeElement && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        left: activeElement.offsetLeft - 20,
        behavior: "smooth",
      });
    }
  }, [section]);

  const handleSectionChange = (newSection: string) => {
    const sp = new URLSearchParams(searchParams?.toString());
    sp.set("section", newSection);
    router.push(`${pathname}?${sp.toString()}`, { scroll: false });
  };

  if (!session) return null;

  const currentItem = ALL_ITEMS.find((i) => i.value === section) || ALL_ITEMS[0];

  return (
    <div className='min-h-screen relative pt-20 pb-24 md:pb-12 bg-background/50'>
      <div className='mx-auto w-full max-w-7xl px-4 md:px-8'>
        {/* Header Section */}
        <div className='flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-12'>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className='flex items-center gap-3 text-primary mb-2'>
              <LayoutDashboard size={24} />
              <span className='text-sm font-bold uppercase tracking-widest'>Admin Portal</span>
            </div>
            <h1 className='text-4xl md:text-5xl font-bold tracking-tight'>
              Dashboard
            </h1>
          </motion.div>

          {/* Breadcrumb style indicator for mobile */}
          <div className='md:hidden flex items-center gap-2 text-foreground/40 text-sm'>
            <span>Admin</span>
            <ChevronRight size={14} />
            <span className='text-foreground font-medium'>{currentItem.label}</span>
          </div>
        </div>

        {/* Mobile Horizontal Navigation */}
        <div className='md:hidden mb-8 -mx-4 px-4 sticky top-20 z-30 bg-background/80 backdrop-blur-md py-3 border-b border-foreground/5'>
          <div 
            ref={scrollContainerRef}
            className='flex gap-2 overflow-x-auto no-scrollbar pb-1'
          >
            {ALL_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = section === item.value;

              return (
                <button
                  key={item.value}
                  id={`nav-item-${item.value}`}
                  onClick={() => handleSectionChange(item.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                      : "bg-foreground/5 text-foreground/60 hover:bg-foreground/10"
                  }`}
                >
                  <Icon size={16} />
                  <span className='text-xs font-semibold'>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)] gap-10'>
          {/* Desktop Sidebar */}
          <div className='hidden md:block'>
            <div className='sticky top-32 space-y-8'>
              {ADMIN_GROUPS.map((group, groupIdx) => (
                <motion.div 
                  key={group.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: groupIdx * 0.1 }}
                  className='space-y-3'
                >
                  <h3 className='px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/30'>
                    {group.label}
                  </h3>
                  <nav className='space-y-1'>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = section === item.value;

                      return (
                        <button
                          key={item.value}
                          onClick={() => handleSectionChange(item.value)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all duration-300 group relative ${
                            isActive
                              ? "text-primary font-bold"
                              : "text-foreground/50 hover:text-foreground hover:bg-foreground/5"
                          }`}
                        >
                          <Icon size={20} className={isActive ? "text-primary" : "group-hover:text-foreground/70"} />
                          <span className='text-sm'>{item.label}</span>
                          
                          {isActive && (
                            <motion.div
                              layoutId='activeIndicator'
                              className='absolute left-0 w-1 h-6 bg-primary rounded-full'
                              initial={false}
                            />
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className='min-h-[600px]'>
            <div className='border border-foreground/10 rounded-[2rem] bg-background/40 backdrop-blur-2xl shadow-2xl overflow-hidden'>
              <div className='p-6 md:p-10'>
                <AnimatePresence mode='wait'>
                  <motion.div
                    key={section}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ErrorBoundary>
                      {section === "profile" && <ProfileManagement />}
                      {section === "theme" && <ThemeEditor />}
                      {section === "home" && <HomePageForm />}
                      {section === "about" && <AboutPageForm />}
                      {section === "projects" && <ProjectManagement />}
                      {section === "work" && <WorkExperienceManagement />}
                      {section === "resumes" && (
                        <div className='space-y-12'>
                          <ResumeManagement />
                          <div className='pt-12 border-t border-foreground/10'>
                            <ResumeManager />
                          </div>
                        </div>
                      )}
                      {section === "gallery" && <GalleryManager />}
                    </ErrorBoundary>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  );
}
