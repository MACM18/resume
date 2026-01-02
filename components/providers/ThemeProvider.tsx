"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getEffectiveDomain } from "@/lib/utils";

import { generateCssVariables } from "@/lib/theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [hostname, setHostname] = useState("");

  useEffect(() => {
    setHostname(window.location.hostname);
  }, []);

  // If server-side CSS variables are present (SSR injected), avoid fetching again on client
  const hasServerVars =
    typeof window !== "undefined" &&
    getComputedStyle(document.documentElement).getPropertyValue(
      "--has-background-image"
    ) !== "";

  const { data: profileData } = useQuery({
    queryKey: ["theme", hostname],
    queryFn: async () => {
      if (!hostname) return { theme: {}, background_image_url: null };
      const normalizedDomain = getEffectiveDomain(hostname);
      if (!normalizedDomain) {
        return { theme: {}, background_image_url: null };
      }

      const response = await fetch(
        `/api/profile/theme?domain=${encodeURIComponent(normalizedDomain)}`
      );
      if (!response.ok) {
        return { theme: {}, background_image_url: null };
      }

      const data = await response.json();
      return {
        theme: data?.theme || {},
        background_image_url: data?.background_image_url || null,
      };
    },
    // Only enable the client fetch if hostname is present AND server-side CSS variables are not already set
    enabled: !!hostname && !hasServerVars,
  });

  return (
    <>
      {/* Only apply client-side CSS when we did fetch it (and server hasn't already applied it) */}
      {profileData && !hasServerVars && (
        <style
          dangerouslySetInnerHTML={{
            __html: generateCssVariables(
              profileData.theme,
              profileData.background_image_url
            ),
          }}
        />
      )}
      {children}
    </>
  );
}
