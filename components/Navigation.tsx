"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  User,
  FolderOpen,
  FileText,
  Info,
  Sparkles,
} from "lucide-react";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/about", label: "About", icon: User },
  { path: "/projects", label: "Projects", icon: FolderOpen },
  { path: "/resume", label: "Resume", icon: FileText },
  { path: "/contact", label: "Contact", icon: Info }, // Added contact to main nav
];

export function Navigation() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  const home = pathname === "/";
  const items = home
    ? [
        { path: "#work", label: "Work", icon: FolderOpen },
        { path: "#story", label: "Story", icon: User },
        { path: "#skills", label: "Skills", icon: Sparkles },
        { path: "#contact", label: "Contact", icon: Info },
      ]
    : navItems;

  return (
    <>
      <div className="fixed top-6 left-0 right-0 z-50 hidden md:flex justify-center pointer-events-none">
        <nav aria-label="Main navigation" className="pointer-events-auto flex items-center gap-1 rounded-full border border-foreground/10 bg-background/80 px-2 py-2 shadow-lg backdrop-blur-xl">
          <div className='flex items-center gap-1'>
            {items.map((item) => {
              const isActive = !home && pathname === item.path;
              const Icon = item.icon;

              return (
                <Link key={item.path} href={item.path} className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-foreground/65 hover:bg-foreground/5 hover:text-foreground"}`}>
                    <Icon size={16} />
                    <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
          {!home && <div id='nav-auth-container' className="ml-2 flex items-center border-l border-foreground/10 pl-2" />}
        </nav>
      </div>

      <div className="fixed bottom-8 left-0 right-0 z-40 md:hidden flex justify-center px-4">
        <nav aria-label="Main navigation" className="flex w-full max-w-sm items-center justify-around rounded-full border border-foreground/10 bg-background/90 p-2 shadow-xl backdrop-blur-xl">
          {items.map((item) => {
            const isActive = !home && pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                href={item.path}
                aria-label={item.label}
                title={item.label}
                className={`flex flex-1 flex-col items-center rounded-full p-2 transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-foreground/60 hover:text-foreground"}`}
              >
                <Icon size={20} />
                <span className="mt-1 text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
