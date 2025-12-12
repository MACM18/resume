"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Theme } from "@/types/portfolio";
import { getEffectiveDomain } from "@/lib/utils";

const generateCssVariables = (
  theme: Theme,
  backgroundImageUrl: string | null
) => {
  let css = `:root { ${Object.entries(theme)
    .map(([key, value]) => `${key}: ${value};`)
    .join(" ")} }`;

  if (backgroundImageUrl) {
    css += `\n:root { 
      --background-image-url: url('${backgroundImageUrl}');
      --has-background-image: 1;
    }`;
  } else {
    css += `\n:root { 
      --background-image-url: none;
      --has-background-image: 0;
    }`;
  }
  return css;
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [hostname, setHostname] = useState("");

  useEffect(() => {
    setHostname(window.location.hostname);
  }, []);

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
    enabled: !!hostname,
  });

  return (
    <>
      {profileData && (
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
