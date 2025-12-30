"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { GlassCard } from "@/components/GlassCard";
import { AdminNav } from "@/components/admin/AdminNav";
import { ProjectManagement } from "@/components/admin/ProjectManagement";
import { ProfileManagement } from "@/components/admin/ProfileManagement";
import { HomePageForm } from "@/components/admin/HomePageForm";
import { AboutPageForm } from "@/components/admin/AboutPageForm";
import { ResumeManagement } from "@/components/admin/ResumeManagement";
import { ResumeManager } from "@/components/admin/ResumeManager";
import { ThemeEditor } from "@/components/admin/ThemeEditor";
import { WorkExperienceManagement } from "@/components/admin/WorkExperienceManagement";
import {
  User,
  Palette,
  Home,
  Info,
  FolderKanban,
  Briefcase,
  FileText,
} from "lucide-react";

const ADMIN_ITEMS = [
  { value: "profile", label: "Profile & Domain", icon: User },
  { value: "theme", label: "Theme", icon: Palette },
  { value: "home", label: "Home Page", icon: Home },
  { value: "about", label: "About Page", icon: Info },
  { value: "projects", label: "Projects", icon: FolderKanban },
  { value: "work", label: "Work Experience", icon: Briefcase },
  { value: "resumes", label: "Resumes", icon: FileText },
] as const;

export default function AdminPage() {
  const { session } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [section, setSection] = useState("profile");

  useEffect(() => {
    if (!session) router.push("/login");
  }, [session, router]);

  // Initialize from query param and keep in sync when URL changes
  useEffect(() => {
    const qp = searchParams?.get("section");
    if (qp && qp !== section) setSection(qp);
    if (!qp && section !== "profile") {
      const sp = new URLSearchParams(searchParams?.toString());
      sp.set("section", section);
      router.replace(`${pathname}?${sp.toString()}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // When section changes via sidebar/mobile select, reflect in URL
  useEffect(() => {
    const current = searchParams?.get("section") ?? "profile";
    if (current !== section) {
      const sp = new URLSearchParams(searchParams?.toString());
      sp.set("section", section);
      router.replace(`${pathname}?${sp.toString()}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  if (!session) return null;

  return (
    <div className='min-h-screen relative pt-20 pb-24 md:pb-12'>
      <div className='mx-auto w-full max-w-7xl px-4 md:px-6'>
        {/* Header */}
        <div className='mb-8 md:mb-12'>
          <h1 className='text-4xl md:text-5xl font-bold mb-2'>
            Admin Dashboard
          </h1>
          <p className='text-foreground/60'>Manage your portfolio content</p>
        </div>

        {/* Mobile Tab Selector */}
        <div className='md:hidden mb-6'>
          <div className='border border-foreground/10 rounded-xl bg-background/50 backdrop-blur-sm p-1.5'>
            <div className='grid grid-cols-2 gap-1.5'>
              {ADMIN_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = section === item.value;

                return (
                  <button
                    key={item.value}
                    onClick={() => setSection(item.value)}
                    className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-foreground/70 hover:text-foreground hover:bg-foreground/5"
                    }`}
                  >
                    <Icon size={16} />
                    <span className='text-xs font-medium truncate'>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-[240px_minmax(0,1fr)] gap-6'>
          {/* Desktop Sidebar */}
          <div className='hidden md:block'>
            <div className='sticky top-24'>
              <div className='border border-foreground/10 rounded-xl bg-background/50 backdrop-blur-sm p-2'>
                <nav className='space-y-1'>
                  {ADMIN_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = section === item.value;

                    return (
                      <button
                        key={item.value}
                        onClick={() => setSection(item.value)}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left transition-all duration-200 ${
                          isActive
                            ? "text-primary bg-primary/10 border border-primary/20"
                            : "text-foreground/70 hover:text-foreground hover:bg-foreground/5"
                        }`}
                      >
                        <Icon size={18} />
                        <span className='font-medium text-sm'>
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className='border border-foreground/10 rounded-xl bg-background/50 backdrop-blur-sm overflow-hidden'>
            <div className='p-4 md:p-6'>
              {section === "profile" && <ProfileManagement />}
              {section === "theme" && (
                <div className='max-h-[calc(100vh-200px)] overflow-y-auto'>
                  <ThemeEditor />
                </div>
              )}
              {section === "home" && (
                <div className='max-h-[calc(100vh-200px)] overflow-y-auto'>
                  <HomePageForm />
                </div>
              )}
              {section === "about" && (
                <div className='max-h-[calc(100vh-200px)] overflow-y-auto'>
                  <AboutPageForm />
                </div>
              )}
              {section === "projects" && <ProjectManagement />}
              {section === "work" && <WorkExperienceManagement />}
              {section === "resumes" && (
                <div className='space-y-6'>
                  <div>
                    <ResumeManagement />
                  </div>
                  <div className='border-t border-foreground/10 pt-6'>
                    <ResumeManager />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
