"use client";

import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft, BriefcaseBusiness, FileText, FolderKanban, Home, ImageIcon,
  Info, LayoutDashboard, Menu, Palette, ShieldCheck, UserRound,
} from "lucide-react";
import { adminGroups, adminItems } from "./admin-routes";

const icons = {
  overview: LayoutDashboard,
  home: Home,
  about: Info,
  projects: FolderKanban,
  work: BriefcaseBusiness,
  resumes: FileText,
  gallery: ImageIcon,
  profile: UserRound,
  appearance: Palette,
  account: ShieldCheck,
};

function AdminLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav aria-label="Admin navigation" className="space-y-5">
      {adminGroups.map((group) => (
        <div key={group.label}>
          <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.19em] text-muted-foreground">{group.label}</p>
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const Icon = icons[item.icon];
              const active = pathname === item.path;
              return (
                <Link key={item.path} href={item.path} onClick={onNavigate} aria-current={active ? "page" : undefined}
                  className={`flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active ? "bg-primary/10 font-semibold text-primary" : "text-foreground/68 hover:bg-muted hover:text-foreground"}`}>
                  <Icon size={17} aria-hidden="true" className="shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/admin";
  const [mobileOpen, setMobileOpen] = useState(false);
  const current = adminItems.find((item) => item.path === pathname) || adminItems[0];

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);


  return (
    <div className="relative min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-border bg-card/95 md:flex">
        <Link href="/admin" className="flex h-[72px] items-center gap-3 border-b border-border px-5">
          <Image src="https://cdn.macm.dev/macm-icon.webp" alt="" width={34} height={34} className="rounded-lg" />
          <span><span className="block text-sm font-bold tracking-tight">MACM workspace</span><span className="block text-[11px] text-muted-foreground">Portfolio administration</span></span>
        </Link>
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5"><AdminLinks pathname={pathname} /></div>
        <div className="border-t border-border p-3">
          <Link href="/" className="flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><ArrowLeft size={16} /> Back to site</Link>
        </div>
      </aside>

      <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur md:hidden">
        <Link href="/admin" className="flex items-center gap-2 text-sm font-semibold">
          <Image src="https://cdn.macm.dev/macm-icon.webp" alt="" width={25} height={25} className="rounded" />
          MACM workspace
        </Link>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button type="button" aria-label="Open admin menu" className="rounded-md p-2 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><Menu size={21} /></button>
          </SheetTrigger>
          <SheetContent side="left" className="flex h-full w-[min(20rem,86vw)] flex-col gap-0 border-border bg-card p-0">
            <SheetHeader className="border-b border-border px-4 py-4 text-left"><SheetTitle className="text-sm">MACM workspace</SheetTitle></SheetHeader>
            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5"><AdminLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} /></div>
            <div className="border-t border-border p-3"><Link href="/" onClick={() => setMobileOpen(false)} className="flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"><ArrowLeft size={16} /> Back to site</Link></div>
          </SheetContent>
        </Sheet>
      </header>

      <div className="min-w-0 pt-14 md:pl-60 md:pt-0">
        <div className="border-b border-border bg-card/65 px-4 py-4 sm:px-6 md:px-8">
          <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">{adminGroups.find((group) => group.items.some((item) => item.path === current.path))?.label}</p>
              <h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">{current.label}</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">{current.description}</p>
            </div>
            <Link href="/" className="hidden items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"><ArrowLeft size={14} /> View site</Link>
          </div>
        </div>
        <main id="admin-content" className="mx-auto min-h-[calc(100vh-8rem)] w-full max-w-[1500px] px-4 py-5 sm:px-6 md:px-8 md:py-7">
          {children}
        </main>
      </div>
    </div>
  );
}
