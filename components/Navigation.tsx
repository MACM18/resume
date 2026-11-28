"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChapterNavigation } from "@/components/ChapterNavigation";

const siteLinks = [
  { path: "/", label: "Home" },
  { path: "/projects", label: "Work" },
  { path: "/about", label: "About" },
  { path: "/resume", label: "Resume" },
  { path: "/contact", label: "Contact" },
];

export function Navigation() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  if (pathname === "/") return <ChapterNavigation />;

  return <>
    <div className="fixed inset-x-0 top-4 z-50 hidden justify-center px-4 lg:flex">
      <nav aria-label="Main navigation" className="site-nav-rail">
        {siteLinks.map((item, index) => <Link key={item.path} href={item.path} aria-current={pathname === item.path ? "page" : undefined} className={pathname === item.path ? "site-nav-link is-active" : "site-nav-link"}><span>{String(index + 1).padStart(2, "0")}</span>{item.label}</Link>)}
      </nav>
    </div>
    <div className="fixed inset-x-0 bottom-3 z-50 px-3 lg:hidden">
      <nav aria-label="Main navigation" className="site-nav-rail site-nav-mobile">
        {siteLinks.map((item, index) => <Link key={item.path} href={item.path} aria-current={pathname === item.path ? "page" : undefined} className={pathname === item.path ? "site-nav-link is-active" : "site-nav-link"}><span>{String(index + 1).padStart(2, "0")}</span>{item.label}</Link>)}
      </nav>
    </div>
  </>;
}
