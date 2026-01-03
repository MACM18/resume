"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
    gtag?: (...args: unknown[]) => void;
  }
}

export default function Analytics() {
  const pathname = usePathname();

  useEffect(() => {
    // Ensure dataLayer exists
    window.dataLayer = window.dataLayer || [];

    // Push initial page_view for SPA navigation
    window.dataLayer.push({
      event: "page_view",
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
    } as Record<string, unknown>);

    // If gtag is present, also send gtag page_view (some setups rely on this)
    if (typeof window.gtag === "function") {
      window.gtag("event", "page_view", {
        page_path: pathname,
        page_location: window.location.href,
        page_title: document.title,
      } as Record<string, unknown>);
    }
  }, [pathname]);

  return null;
}
