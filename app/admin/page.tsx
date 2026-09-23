"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, Suspense } from "react";
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
import { AdminOverview } from "@/components/admin/AdminOverview";
import { AccountSecurity } from "@/components/admin/AccountSecurity";
import { AdminLoadingState } from "@/components/admin/AdminUI";
import { PresetControls } from "@/components/admin/PresetControls";
import {
  User,
  ShieldCheck,
  Palette,
  Home,
  Info,
  FolderKanban,
  Briefcase,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  ChevronRight,
} from "lucide-react";

const ADMIN_GROUPS = [
  {
    label: "Workspace",
    items: [{ value: "overview", label: "Overview", icon: LayoutDashboard }],
  },
  {
    label: "Identity",
    items: [
      { value: "profile", label: "Profile", icon: User },
      { value: "theme", label: "Theme & Branding", icon: Palette },
      { value: "account", label: "Account & Security", icon: ShieldCheck },
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

const ADMIN_PAGE_META: Record<string, { eyebrow: string; description: string }> = {
  overview: { eyebrow: "Workspace", description: "See what is published, complete, and ready for your next edit." },
  profile: { eyebrow: "Identity", description: "Keep your public identity, media, background, and favicon in one place." },
  theme: { eyebrow: "Branding", description: "Choose a readable palette, site mode, and custom colors." },
  account: { eyebrow: "Security", description: "Manage account access and verification settings." },
  home: { eyebrow: "Page content", description: "Shape the homepage story, proof points, links, and call to action." },
  about: { eyebrow: "Page content", description: "Tell your story, organize skills, and keep contact details current." },
  work: { eyebrow: "Professional", description: "Maintain the experience entries shown across your portfolio." },
  projects: { eyebrow: "Professional", description: "Publish case studies, media, technologies, and project links." },
  resumes: { eyebrow: "Professional", description: "Create versions, generate summaries, and choose the active resume." },
  gallery: { eyebrow: "Assets", description: "Organize reusable images and albums for your public pages." },
};

function AdminDashboardContent() {
  const { session } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Derived state from URL - primary source of truth
  const section = searchParams?.get("section") || "overview";
  
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
  const CurrentSectionIcon = currentItem.icon;

  return (
    <div className='min-h-screen relative pb-24 pt-24 md:pb-12 md:pt-28 bg-background/50'>
      <div className='mx-auto w-full max-w-[1720px] px-4 md:px-6 xl:px-8'>
        {/* Header Section */}
        <div className='flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 md:mb-7'>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className='flex items-center gap-3 text-primary mb-2'>
              <LayoutDashboard size={24} />
              <span className='text-[10px] font-bold uppercase tracking-[0.24em]'>Portfolio workspace</span>
            </div>
            <h1 className='text-3xl md:text-4xl font-bold tracking-tight'>
              Content dashboard
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
        <div className='md:hidden mb-5 -mx-4 px-4 sticky top-20 z-30 bg-background/80 backdrop-blur-md py-3 border-b border-foreground/5'>
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

        <div className='grid grid-cols-1 md:grid-cols-[210px_minmax(0,1fr)] xl:grid-cols-[224px_minmax(0,1fr)] gap-5 xl:gap-7'>
          {/* Desktop Sidebar */}
          <div className='hidden md:block'>
            <div className='sticky top-25 max-h-[calc(100vh-7rem)] overflow-y-auto space-y-5 pr-1'>
              {ADMIN_GROUPS.map((group, groupIdx) => (
                <motion.div 
                  key={group.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: groupIdx * 0.04 }}
                  className='space-y-1.5'
                >
                  <h3 className='px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/30'>
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
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-all duration-300 group relative ${
                            isActive
                              ? "text-primary font-bold"
                              : "text-foreground/50 hover:text-foreground hover:bg-foreground/5"
                          }`}
                        >
                          <Icon size={17} className={isActive ? "text-primary" : "group-hover:text-foreground/70"} />
                          <span className='text-sm'>{item.label}</span>
                          
                          {isActive && (
                            <motion.div
                              layoutId='activeIndicator'
                              className='absolute left-0 w-0.5 h-5 bg-primary rounded-full'
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
          <div className='min-w-0'>
            <div className='border border-foreground/10 bg-card/85 shadow-sm rounded-xl min-w-0'>
              <div className='border-b border-border bg-muted/25 px-4 py-3 sm:px-6 xl:px-8'>
                <div className='flex items-start gap-3'>
                  <CurrentSectionIcon size={16} className='mt-0.5 shrink-0 text-primary' aria-hidden='true' />
                  <div className='min-w-0'>
                    <p className='text-[10px] font-semibold uppercase tracking-[0.2em] text-primary'>{ADMIN_PAGE_META[section]?.eyebrow || "Workspace"}</p>
                    <p className='mt-1 text-sm text-muted-foreground'>{ADMIN_PAGE_META[section]?.description}</p>
                  </div>
                </div>
              </div>
              <div className='admin-workspace p-4 sm:p-6 xl:p-8'>
                <AnimatePresence mode='wait'>
                  <motion.div
                    key={section}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ErrorBoundary>
                      <PresetControls section={section} />
                      {section === "overview" && <AdminOverview onNavigate={handleSectionChange} />}
                      {section === "profile" && <ProfileManagement />}
                      {section === "account" && <AccountSecurity />}
                      {section === "theme" && <ThemeEditor />}
                      {section === "home" && <HomePageForm />}
                      {section === "about" && <AboutPageForm />}
                      {section === "projects" && <ProjectManagement />}
                      {section === "work" && <WorkExperienceManagement />}
                      {section === "resumes" && (
                        <div className='space-y-8'>
                          <ResumeManagement />
                          <div className='pt-8 border-t border-foreground/10'>
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
      <div className='mx-auto min-h-screen max-w-7xl px-4 pt-28 md:px-8'><AdminLoadingState label='Loading admin workspace' /></div>
    }>
      <AdminDashboardContent />
    </Suspense>
  );
}
